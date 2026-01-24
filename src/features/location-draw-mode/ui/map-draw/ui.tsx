'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { LocationModeWrapper } from '@/features/location-filter/ui/location-mode-wrapper';
import { DrawControls } from '../draw-controls';
import { DrawnPolygonsList } from '../drawn-polygons-list';
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
import { saveGeometry } from '@/shared/api';

type MapDrawProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент для рисования произвольных полигонов на карте
 * Позволяет создавать, редактировать и удалять полигоны
 * Использует двухслойную систему: локальное состояние + глобальное (store/URL)
 */
export function MapDraw({ map, onClose, className }: MapDrawProps) {
    const t = useTranslations('draw');
    const { setLocationFilter, setLocationMode } = useFilterStore();
    const [isSaving, setIsSaving] = useState(false);

    // Хук управления состоянием
    const {
        isDrawing,
        selectedPolygonId,
        setSelectedPolygonId,
        currentPoints,
        setCurrentPoints,
        polygons,
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
    // TODO: Сохраняем все полигоны и в поиск добавляем ids
    // Обработчик применения фильтра (сохранение на бекенд и в store)
    const handleApply = async () => {
        if (polygons.length === 0) return;

        setIsSaving(true);
        try {
            // Берём первый полигон для сохранения
            const polygon = polygons[0];
            const coordinates = [polygon.points.map(p => [p.lng, p.lat])];

            // Отправляем на бекенд
            const result = await saveGeometry({
                type: 'polygon',
                coordinates,
                metadata: {
                    name: polygon.name,
                    pointsCount: polygon.points.length,
                },
            });

            console.log('Polygon saved to backend:', result);

            // Обновляем store с сохранённым фильтром
            setLocationFilter({
                mode: 'draw',
                polygon: {
                    ...polygon,
                    id: `polygon_${result.id}`,
                },
            });

            // Закрываем панель режима
            setLocationMode(null);
            onClose?.();
        } catch (error) {
            console.error('Failed to save polygon:', error);
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
            map.dragPan.enable();
            map.getCanvas().style.cursor = '';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <LocationModeWrapper
            title={t('title')}
            hasLocalData={currentPoints.length > 0 || polygons.length > 0}
            onClear={handleClear}
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
