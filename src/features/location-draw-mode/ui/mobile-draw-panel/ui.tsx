'use client';

import { memo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Pencil, Plus, Check, X, Undo } from 'lucide-react';
import { DrawnPolygonsList } from '../drawn-polygons-list';
import { useDrawingState } from '../../model/hooks/use-drawing-state';
import { useDrawingLayer } from '../../model/hooks/use-drawing-layer';
import { useCompletedPolygonsLayer } from '../../model/hooks/use-completed-polygons-layer';
import { useMapClickHandler } from '../../model/hooks/use-map-click-handler';
import type mapboxgl from 'mapbox-gl';

type MobileDrawPanelProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
};

// Максимальное количество полигонов
const MAX_POLYGONS = 4;

/**
 * Мобильная панель режима рисования полигонов
 * Компактная версия для отображения под табами на карте
 *
 * Функциональность:
 * - Рисование полигонов тапами по карте
 * - Редактирование и удаление существующих полигонов
 * - Отображение списка нарисованных полигонов
 */
export const MobileDrawPanel = memo(function MobileDrawPanel({ map }: MobileDrawPanelProps) {
    const t = useTranslations('draw');

    // Состояние для drag-and-drop (не используем на мобильных, но нужно для хука)
    const [draggedPointIndex] = useState<number | null>(null);

    // Состояние рисования
    const {
        isDrawing,
        selectedPolygonId,
        setSelectedPolygonId,
        currentPoints,
        setCurrentPoints,
        polygons,
        handleStartDrawing,
        handleCompletePolygon,
        handleCancelDrawing,
        handleUndoLastPoint,
        handleEditPolygon,
        handleDeletePolygon,
        historyRef,
        isDrawingRef,
        selectedPolygonIdRef,
    } = useDrawingState(map);

    // Слой для текущего рисования
    useDrawingLayer({
        map,
        currentPoints,
    });

    // Слой для завершённых полигонов
    useCompletedPolygonsLayer({
        map,
        polygons,
        selectedPolygonId,
        isDrawingRef,
        selectedPolygonIdRef,
        setSelectedPolygonId,
    });

    // Обработчик кликов по карте
    useMapClickHandler({
        map,
        isDrawing,
        draggedPointIndex,
        setCurrentPoints,
        historyRef,
    });

    // Проверка лимита полигонов
    const limitReached = polygons.length >= MAX_POLYGONS;
    const canComplete = currentPoints.length >= 3;

    return (
        <div className="px-4 py-3 space-y-3">
            {/* Режим рисования */}
            {isDrawing ? (
                <div className="space-y-3">
                    {/* Подсказка */}
                    <div className="text-center py-2">
                        <p className="text-sm text-text-secondary">
                            {currentPoints.length === 0
                                ? t('tapToStart')
                                : t('pointsCount', { count: currentPoints.length })}
                        </p>
                        {currentPoints.length > 0 && currentPoints.length < 3 && (
                            <p className="text-xs text-text-tertiary mt-1">
                                {t('needMorePoints', { count: 3 - currentPoints.length })}
                            </p>
                        )}
                    </div>

                    {/* Кнопки управления рисованием */}
                    <div className="flex gap-2">
                        {/* Отменить последнюю точку */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUndoLastPoint}
                            disabled={currentPoints.length === 0}
                            className="flex-1 h-10 touch-manipulation"
                        >
                            <Undo className="h-4 w-4 mr-2" />
                            {t('undo')}
                        </Button>

                        {/* Отменить рисование */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelDrawing}
                            className="flex-1 h-10 hover:bg-error/10 hover:text-error hover:border-error touch-manipulation"
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t('cancel')}
                        </Button>

                        {/* Завершить полигон */}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleCompletePolygon}
                            disabled={!canComplete}
                            className="flex-1 h-10 bg-brand-primary touch-manipulation"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            {t('complete')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Кнопка начала рисования */}
                    <Button
                        variant={polygons.length === 0 ? 'default' : 'outline'}
                        className="w-full h-11 touch-manipulation"
                        onClick={handleStartDrawing}
                        disabled={limitReached}
                    >
                        {polygons.length === 0 ? (
                            <>
                                <Pencil className="h-4 w-4 mr-2" />
                                {t('startDrawing')}
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('addPolygon')}
                            </>
                        )}
                    </Button>

                    {/* Список нарисованных полигонов */}
                    {polygons.length > 0 && (
                        <DrawnPolygonsList
                            polygons={polygons}
                            selectedId={selectedPolygonId}
                            onSelect={setSelectedPolygonId}
                            onEdit={handleEditPolygon}
                            onDelete={handleDeletePolygon}
                        />
                    )}

                    {/* Пустое состояние */}
                    {polygons.length === 0 && (
                        <div className="text-center py-4 text-text-secondary">
                            <Pencil className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">{t('emptyStateHint')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
