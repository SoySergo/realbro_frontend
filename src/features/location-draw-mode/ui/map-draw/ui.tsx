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
import { cleanupDrawingLayers } from '../../lib/map-layer-helpers';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { useAuth } from '@/features/auth';
import { createFilterGeometry, createGuestGeometry } from '@/shared/api/geometries';
import { useSidebarStore } from '@/widgets/sidebar';

type MapDrawProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** Начальные данные (восстановление сохранённого полигона) */
    initialData?: DrawPolygon;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент для рисования произвольных полигонов на карте
 * Позволяет создавать, редактировать и удалять полигоны
 * Использует двухслойную систему: локальное состояние + глобальное (store/URL)
 */
export function MapDraw({ map, onClose, initialData, className }: MapDrawProps) {
    const t = useTranslations('draw');
    const { setLocationFilter, setLocationMode } = useFilterStore();
    const { isAuthenticated } = useAuth();
    const { activeQueryId, queries } = useSidebarStore();
    const [isSaving, setIsSaving] = useState(false);

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

    // Восстановление сохранённого полигона при повторном открытии
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initialData && !initializedRef.current) {
            initializedRef.current = true;
            setPolygons([initialData]);
            console.log('[MapDraw] Restored saved polygon:', initialData.id);
        }
    }, [initialData, setPolygons]);

    // Очистка с удалением геометрий с бекенда
    const handleClearWithDelete = () => {
        handleClear();
        // Удаляем геометрии с бекенда
        const { deleteLocationGeometries } = useFilterStore.getState();
        deleteLocationGeometries(isAuthenticated);
        setLocationFilter(null);
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
        onComplete: handleCompletePolygon,
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
        onEdit: handleEditPolygon,
        onDelete: handleDeletePolygon,
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

            // Определяем режим сохранения: фильтр или гостевой
            const activeQuery = activeQueryId ? queries.find(q => q.id === activeQueryId) : null;
            const isValidUUID = activeQueryId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeQueryId) : false;
            const hasSavedFilter = isAuthenticated && activeQuery && !activeQuery.isUnsaved && isValidUUID;

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

                // Сохраняем мету (id + name, без координат)
                const { addGeometryMeta } = useFilterStore.getState();
                addGeometryMeta({ id: geometryId, name: polygon.name || '', type: 'polygon' });
            }

            // Обновляем store
            setLocationFilter({
                mode: 'draw',
            });

            // Сохраняем geometry IDs в фильтры → попадут в URL params
            const { setFilters } = useFilterStore.getState();
            setFilters({
                polygon_ids: savedGeometryIds,
                geometry_source: hasSavedFilter ? 'filter' : 'guest',
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

            // Удаляем источники и слои
            cleanupDrawingLayers(map);

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
            onClear={handleClearWithDelete}
            onApply={handleApply}
            onClose={handleClose}
            isSaving={isSaving}
            className={className}
        >
            <div className="space-y-4">
                {/* Пустое состояние */}
                {!isDrawing && polygons.length === 0 && (
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
                        onEdit={handleEditPolygon}
                        onDelete={handleDeletePolygon}
                        onSelect={setSelectedPolygonId}
                        selectedId={selectedPolygonId}
                    />
                )}

                {/* Кнопки управления рисованием */}
                {!isDrawing && (
                    <DrawControls
                        hasPolygons={polygons.length > 0}
                        isDrawing={isDrawing}
                        onStartDrawing={handleStartDrawing}
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
