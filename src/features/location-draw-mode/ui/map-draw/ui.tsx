'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { LocationModeWrapper } from '@/features/location-filter/ui/location-mode-wrapper';
import { DrawControls } from '../draw-controls';
import { DrawnPolygonsList } from '../drawn-polygons-list';
import type { DrawPolygon } from '@/entities/map-draw/model/types';
import {
    useDrawingState,
    useMapClickHandler,
    usePointDragDrop,
    useDrawingLayer,
    useCompletedPolygonsLayer,
    useEditorPopup,
    useActionsPopup,
} from '../../model/hooks';
import { cleanupAllDrawingLayers } from '../../lib/map-layer-helpers';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { useAuth } from '@/features/auth';
import { useFilters } from '@/features/search-filters/model/use-filters';
import { createFilterGeometry, createGuestGeometry, getGuestGeometry, getFilterGeometry } from '@/shared/api/geometries';
import { useSidebarStore } from '@/widgets/sidebar';
import type { DrawPoint } from '@/entities/map-draw/model/types';
import { saveGeometryToStorage, getGeometryFromStorage, removeGeometryFromStorage, syncGeometriesToBackend } from '@/shared/lib/geometry-storage';

type MapDrawProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** Начальные данные (восстановление сохранённых полигонов) */
    initialData?: DrawPolygon[];
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент для рисования произвольных полигонов на карте
 * Позволяет создавать, редактировать и удалять полигоны
 * Использует двухслойную систему: локальное состояние + глобальное (store/URL)
 */
/** Конвертация GeoJSON строки из бекенда → DrawPolygon */
function geojsonToDrawPolygon(id: string, geojsonStr: string, name?: string): DrawPolygon | null {
    try {
        const geojson = JSON.parse(geojsonStr);
        if (geojson.type !== 'Polygon' || !geojson.coordinates?.[0]) return null;
        const ring: number[][] = geojson.coordinates[0];
        // Последняя точка = первая (замыкание), убираем её
        const points: DrawPoint[] = ring.slice(0, -1).map(([lng, lat]) => ({ lng, lat }));
        if (points.length < 3) return null;
        return { id, name, points, createdAt: new Date() };
    } catch {
        return null;
    }
}

export function MapDraw({ map, onClose, initialData, className }: MapDrawProps) {
    const t = useTranslations('draw');
    const { setLocationFilter, setLocationMode } = useFilterStore();
    const { isAuthenticated } = useAuth();
    const { filters: urlFilters, setFilters: setUrlFilters } = useFilters();
    const { activeQueryId, queries } = useSidebarStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(!initialData);
    const [isRestoring, setIsRestoring] = useState(false);

    // Хук управления состоянием
    const {
        isDrawing,
        selectedPolygonId,
        setSelectedPolygonId,
        currentPoints,
        setCurrentPoints,
        polygons,
        setPolygons,
        historyRef,
        isDrawingRef,
        selectedPolygonIdRef,
        editorPopupRef,
        actionsPopupRef,
        handleStartDrawing,
        handleCompletePolygon,
        handleCancelDrawing,
        handleUndoLastPoint,
        handleEditPolygon,
        handleDeletePolygon,
        handleClear,
    } = useDrawingState(map);

    // Восстановление полигона: из initialData (store) ИЛИ из бекенда (по IDs из URL)
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initializedRef.current) return;

        // 1) Если есть initialData из store — используем его
        if (initialData && initialData.length > 0) {
            initializedRef.current = true;
            const restored = initialData.map(p => ({
                ...p,
                createdAt: p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt),
            }));
            setPolygons(restored);
            setIsDirty(false);
            console.log('[MapDraw] Restored', restored.length, 'polygons from store');

            // Async: убедиться что геометрии есть в БД (могли быть удалены при чистке)
            const polygonIds = urlFilters.polygonIds;
            if (polygonIds?.length) {
                syncGeometriesToBackend(polygonIds);
            }
            return;
        }

        // 2) Если нет initialData, но в URL есть polygonIds — загружаем с бекенда
        const polygonIds = urlFilters.polygonIds;
        if (polygonIds && polygonIds.length > 0) {
            initializedRef.current = true;
            setIsRestoring(true);
            const geoSrc = urlFilters.geoSrc;

            Promise.all(
                polygonIds.map(async (id) => {
                    // 1) Пробуем получить из БД
                    try {
                        const geo = geoSrc === 'filter'
                            ? await getFilterGeometry(id)
                            : await getGuestGeometry(id);
                        if (geo) {
                            const parsed = geojsonToDrawPolygon(geo.id, geo.geometry, geo.name);
                            if (parsed) return parsed;
                            console.warn('[MapDraw] DB geometry parse failed for', id, '- trying localStorage');
                        }
                    } catch (err) {
                        console.warn('[MapDraw] DB fetch failed for', id, err, '- trying localStorage');
                    }

                    // 2) Fallback: localStorage
                    const local = getGeometryFromStorage(id);
                    if (local?.geometry) {
                        const parsed = geojsonToDrawPolygon(local.id, local.geometry, local.name);
                        if (parsed) {
                            console.log('[MapDraw] Restored from localStorage:', id);
                            syncGeometriesToBackend([id]);
                            return parsed;
                        }
                    }

                    // 3) Нет нигде — вернём null (ID будет убран из URL)
                    console.warn('[MapDraw] Polygon not found anywhere, will remove ID:', id);
                    return null;
                })
            ).then((results) => {
                const restored = results.filter((p): p is DrawPolygon => p !== null);
                const lostIds = polygonIds.filter((_, i) => results[i] === null);

                if (restored.length > 0) {
                    setPolygons(restored);
                    setIsDirty(false);
                    setLocationFilter({ mode: 'draw', polygons: restored });
                    console.log('[MapDraw] Restored', restored.length, 'polygons');
                }

                // Убираем потерянные ID из URL
                if (lostIds.length > 0) {
                    const remainingIds = polygonIds.filter(id => !lostIds.includes(id));
                    setUrlFilters({
                        polygonIds: remainingIds.length > 0 ? remainingIds : undefined,
                        geoSrc: remainingIds.length > 0 ? geoSrc : undefined,
                    });
                }
            }).catch((err) => {
                console.error('[MapDraw] Failed to fetch polygons:', err);
            }).finally(() => {
                setIsRestoring(false);
            });
            return;
        }

        initializedRef.current = true;
    }, [initialData, urlFilters.polygonIds, urlFilters.geoSrc, setPolygons, setLocationFilter]);

    // Очистка с удалением геометрий с бекенда + из URL + из localStorage
    const handleClearWithDelete = () => {
        // Удаляем из localStorage
        const { locationGeometryMeta, deleteLocationGeometries } = useFilterStore.getState();
        for (const meta of locationGeometryMeta) {
            removeGeometryFromStorage(meta.id);
        }
        // Также удаляем по текущим URL IDs (может не совпадать с meta)
        const currentPolygonIds = urlFilters.polygonIds;
        if (currentPolygonIds) {
            for (const id of currentPolygonIds) {
                removeGeometryFromStorage(id);
            }
        }

        handleClear();
        setIsDirty(false);
        deleteLocationGeometries(isAuthenticated);
        setLocationFilter(null);
        setUrlFilters({ polygonIds: undefined, geoSrc: undefined });
    };

    // Хук drag-and-drop точек
    const { draggedPointIndex } = usePointDragDrop({
        map,
        isDrawing,
        currentPoints,
        historyRef,
        setCurrentPoints,
    });

    // Хук обработки кликов на карту
    useMapClickHandler({
        map,
        isDrawing,
        draggedPointIndex,
        historyRef,
        setCurrentPoints,
    });

    // Хук отрисовки текущего полигона
    useDrawingLayer({
        map,
        currentPoints,
    });

    // Хук отрисовки завершённых полигонов
    useCompletedPolygonsLayer({
        map,
        polygons,
        selectedPolygonId,
        isDrawingRef,
        selectedPolygonIdRef,
        setSelectedPolygonId,
    });

    // Хук popup редактора (показывается во время рисования)
    useEditorPopup({
        map,
        isDrawing,
        currentPoints,
        editorPopupRef,
        onComplete: () => {
            const changed = handleCompletePolygon();
            if (changed) setIsDirty(true);
        },
        onCancel: handleCancelDrawing,
        onUndo: handleUndoLastPoint,
        translations: {
            points: t('points'),
            save: t('save'),
            minThreePoints: t('minThreePoints'),
            undo: t('undo'),
            cancel: t('cancel'),
        },
    });

    // Хук popup действий (показывается при клике на полигон)
    useActionsPopup({
        map,
        selectedPolygonId,
        polygons,
        actionsPopupRef,
        isDrawing,
        onEdit: (id: string) => { handleEditPolygon(id); },
        onDelete: (id: string) => { handleDeletePolygon(id); setIsDirty(true); },
        onSelectPolygon: setSelectedPolygonId,
        translations: {
            edit: t('edit'),
            delete: t('delete'),
        },
    });
    // Обработчик применения фильтра (сохранение на бекенд и в store)
    const handleApply = async () => {
        if (polygons.length === 0) return;

        setIsSaving(true);
        try {
            const savedGeometryIds: string[] = [];
            const { locationGeometryMeta, deleteLocationGeometries, clearGeometryMeta } = useFilterStore.getState();

            // Определяем режим сохранения: фильтр или гостевой
            const activeQuery = activeQueryId ? queries.find(q => q.id === activeQueryId) : null;
            const isValidUUID = activeQueryId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeQueryId) : false;
            const hasSavedFilter = isAuthenticated && activeQuery && !activeQuery.isUnsaved && isValidUUID;

            // Удаляем старые геометрии перед созданием новых (чтобы не дублировать)
            if (locationGeometryMeta.length > 0) {
                await deleteLocationGeometries(isAuthenticated);
                clearGeometryMeta();
            }

            // Сохраняем все полигоны на бекенд
            for (const polygon of polygons) {
                const coordinates = [
                    [...polygon.points.map(p => [p.lng, p.lat]),
                    [polygon.points[0].lng, polygon.points[0].lat]] // замыкаем полигон
                ];

                const geojsonStr = JSON.stringify({
                    type: 'Polygon',
                    coordinates,
                });

                const params = {
                    id: polygon.id,
                    type: 'polygon' as const,
                    geometry: geojsonStr,
                    name: polygon.name || '',
                };

                let geometryId: string;

                if (hasSavedFilter && activeQueryId) {
                    const result = await createFilterGeometry(activeQueryId, params);
                    geometryId = result.id;
                    console.log('[GEO] Polygon saved to filter:', activeQueryId);
                } else {
                    const result = await createGuestGeometry(params);
                    geometryId = result.id;
                    console.log('[GEO] Polygon saved as guest geometry:', geometryId);
                }

                savedGeometryIds.push(geometryId);

                // Дублируем в localStorage (fallback при чистке БД)
                saveGeometryToStorage({
                    id: geometryId,
                    type: 'polygon',
                    geometry: geojsonStr,
                    name: polygon.name || '',
                });

                // Сохраняем мету (id + name, без координат)
                const { addGeometryMeta } = useFilterStore.getState();
                addGeometryMeta({ id: geometryId, name: polygon.name || '', type: 'polygon' });
            }

            // Обновляем store
            setLocationFilter({
                mode: 'draw',
                polygons: polygons,
            });

            // Сохраняем geometry IDs в URL через nuqs (source of truth)
            setUrlFilters({
                polygonIds: savedGeometryIds,
                geoSrc: hasSavedFilter ? 'filter' : 'guest',
            });

            // Закрываем панель режима
            setLocationMode(null);
            onClose?.();
        } catch (error) {
            console.error('[GEO] Failed to save polygon:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Обработчик закрытия панели
    const handleClose = () => {
        onClose?.();
        console.log('Close draw panel');
    };

    // Cleanup при размонтировании
    useEffect(() => {
        // Копируем refs в локальные переменные для cleanup
        const editorPopup = editorPopupRef.current;
        const actionsPopup = actionsPopupRef.current;

        return () => {
            console.log('Cleanup draw component');

            // Проверяем что карта ещё активна перед cleanup
            try {
                if (!map.getCanvas()) return;
            } catch {
                return;
            }

            // Удаляем все слои рисования (включая завершённые полигоны)
            cleanupAllDrawingLayers(map);

            // Удаляем popup-ы
            if (editorPopup) {
                editorPopup.remove();
            }
            if (actionsPopup) {
                actionsPopup.remove();
            }

            // Восстанавливаем курсор и dragPan
            try {
                map.dragPan.enable();
                map.getCanvas().style.cursor = '';
            } catch {
                // Карта уже уничтожена
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <LocationModeWrapper
            title={t('title')}
            hasLocalData={currentPoints.length > 0 || polygons.length > 0}
            isDirty={isDirty}
            onClear={handleClearWithDelete}
            onApply={handleApply}
            onClose={handleClose}
            isSaving={isSaving}
            className={className}
        >
            <div className="space-y-4">
                {/* Пустое состояние */}
                {!isDrawing && !isRestoring && polygons.length === 0 && (
                    <div className="text-center py-8 text-text-secondary">
                        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">{t('emptyState')}</p>
                        <p className="text-xs mt-2">{t('emptyStateHint')}</p>
                    </div>
                )}

                {/* Список нарисованных полигонов */}
                {!isDrawing && polygons.length > 0 && (
                    <DrawnPolygonsList
                        polygons={polygons}
                        onEdit={(id) => { handleEditPolygon(id); }}
                        onDelete={(id) => { handleDeletePolygon(id); setIsDirty(true); }}
                        onSelect={setSelectedPolygonId}
                        selectedId={selectedPolygonId}
                    />
                )}

                {/* Кнопки управления рисованием */}
                {!isDrawing && (
                    <DrawControls
                        hasPolygons={polygons.length > 0}
                        isDrawing={isDrawing}
                        onStartDrawing={() => { handleStartDrawing(); }}
                        polygonsCount={polygons.length}
                    />
                )}

                {/* Инструкция во время рисования */}
                {isDrawing && (
                    <div className="p-3 bg-info/10 border border-info rounded-lg">
                        <p className="text-sm text-text-primary font-medium mb-1">
                            {t('drawingInstructions')}
                        </p>
                        <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                            <li>{t('clickToAddPoint')}</li>
                            <li>{t('dragToMovePoint')}</li>
                            <li>{t('minThreePoints')}</li>
                        </ul>
                    </div>
                )}
            </div>
        </LocationModeWrapper>
    );
}
