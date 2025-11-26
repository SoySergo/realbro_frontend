import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { DrawPoint } from '@/entities/map-draw/model/types';
import { createPolygonGeoJSON, createPointsGeoJSON } from '../../lib/polygon-helpers';

type UsePointDragDropProps = {
    map: mapboxgl.Map;
    isDrawing: boolean;
    currentPoints: DrawPoint[];
    historyRef: React.RefObject<DrawPoint[][]>;
    setCurrentPoints: (points: DrawPoint[] | ((prev: DrawPoint[]) => DrawPoint[])) => void;
};

type UsePointDragDropReturn = {
    draggedPointIndex: number | null;
};

/**
 * Хук для drag-and-drop перемещения точек полигона
 * 
 * Функциональность:
 * - Перемещение точек перетаскиванием мыши
 * - Оптимизация через requestAnimationFrame (60 FPS)
 * - Сохранение финальной позиции в историю
 * - Смена курсора (move/grabbing)
 * - Отключение dragPan карты во время перетаскивания
 */
export function usePointDragDrop({
    map,
    isDrawing,
    currentPoints,
    historyRef,
    setCurrentPoints,
}: UsePointDragDropProps): UsePointDragDropReturn {
    const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
    const isDraggingRef = useRef(false);
    const dragIndexRef = useRef<number | null>(null);

    // Временное хранилище точек во время драга (для производительности)
    const tempPointsRef = useRef<DrawPoint[]>([]);
    const animationFrameRef = useRef<number | null>(null);

    // Функция для прямого обновления GeoJSON без React ре-рендера
    const updateMapGeometry = useCallback(
        (points: DrawPoint[]) => {
            const polygonSource = map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource;
            const pointsSource = map.getSource('drawing-polygon-points') as mapboxgl.GeoJSONSource;

            if (!polygonSource || !pointsSource) return;

            // Напрямую обновляем источники Mapbox
            polygonSource.setData(createPolygonGeoJSON(points));
            pointsSource.setData(createPointsGeoJSON(points));
        },
        [map]
    );

    useEffect(() => {
        if (!isDrawing || currentPoints.length === 0) return;

        // Инициализируем временное хранилище
        tempPointsRef.current = [...currentPoints];

        const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
            // Проверяем, кликнули ли на точку
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['drawing-polygon-points'],
            });

            if (features.length > 0) {
                const feature = features[0];
                const index = feature.properties?.index;

                if (typeof index === 'number') {
                    isDraggingRef.current = true;
                    dragIndexRef.current = index;
                    setDraggedPointIndex(index);

                    // Копируем текущие точки во временное хранилище
                    tempPointsRef.current = [...currentPoints];

                    // Отключаем обработку кликов и drag карты
                    map.dragPan.disable();
                    map.getCanvas().style.cursor = 'grabbing';
                    e.preventDefault();

                    console.log('Started dragging point:', index);
                }
            }
        };

        const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
            if (!isDraggingRef.current || dragIndexRef.current === null) {
                // Меняем курсор при наведении на точку
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['drawing-polygon-points'],
                });

                if (features.length > 0) {
                    map.getCanvas().style.cursor = 'move';
                } else if (isDrawing && !isDraggingRef.current) {
                    map.getCanvas().style.cursor = 'crosshair';
                }
                return;
            }

            // Отменяем предыдущий кадр анимации если есть
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Обновляем позицию в временном хранилище
            const dragIndex = dragIndexRef.current;
            tempPointsRef.current[dragIndex] = { lng: e.lngLat.lng, lat: e.lngLat.lat };

            // Используем requestAnimationFrame для плавного обновления (60 FPS)
            animationFrameRef.current = requestAnimationFrame(() => {
                // Напрямую обновляем Mapbox без изменения React state
                updateMapGeometry(tempPointsRef.current);
            });
        };

        const handleMouseUp = () => {
            if (isDraggingRef.current && dragIndexRef.current !== null) {
                console.log('Finished dragging point:', dragIndexRef.current);

                // Отменяем незавершённый кадр
                if (animationFrameRef.current !== null) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }

                // Теперь обновляем React state один раз с финальной позицией
                const finalPoints = [...tempPointsRef.current];

                // Проверяем, не дублируется ли последняя запись в истории
                const lastHistory = historyRef.current[historyRef.current.length - 1];
                const isDuplicate =
                    lastHistory && JSON.stringify(lastHistory) === JSON.stringify(finalPoints);

                if (!isDuplicate) {
                    historyRef.current.push([...finalPoints]);
                    console.log('Saved to history after drag, total states:', historyRef.current.length);
                } else {
                    console.log('Skipped duplicate history entry after drag');
                }

                setCurrentPoints(finalPoints);
            }

            isDraggingRef.current = false;
            dragIndexRef.current = null;
            setDraggedPointIndex(null);
            map.dragPan.enable();
            map.getCanvas().style.cursor = isDrawing ? 'crosshair' : '';
        };

        // Добавляем обработчики
        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);

        return () => {
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);

            // Очищаем анимацию при размонтировании
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            map.dragPan.enable();
        };
    }, [isDrawing, currentPoints, map, updateMapGeometry, historyRef, setCurrentPoints]);

    return { draggedPointIndex };
}
