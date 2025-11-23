import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { DrawPoint } from '@/types/draw';

type UseMapClickHandlerProps = {
    map: mapboxgl.Map;
    isDrawing: boolean;
    draggedPointIndex: number | null;
    historyRef: React.RefObject<DrawPoint[][]>;
    setCurrentPoints: (points: DrawPoint[] | ((prev: DrawPoint[]) => DrawPoint[])) => void;
};

/**
 * Хук для обработки кликов по карте (добавление точек)
 * 
 * Функциональность:
 * - Добавление точек при клике на карту в режиме рисования
 * - Сохранение в историю для возможности отмены
 * - Блокировка кликов во время drag-and-drop точек
 */
export function useMapClickHandler({
    map,
    isDrawing,
    draggedPointIndex,
    historyRef,
    setCurrentPoints,
}: UseMapClickHandlerProps): void {
    useEffect(() => {
        if (!isDrawing) return;

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            // Проверяем, что клик не был на точке (для drag-and-drop)
            if (draggedPointIndex !== null) return;

            const point: DrawPoint = { lng: e.lngLat.lng, lat: e.lngLat.lat };

            // Добавляем точку и сразу сохраняем в историю
            setCurrentPoints((prev) => {
                const newPoints = [...prev, point];

                // Проверяем, не дублируется ли последняя запись в истории
                const lastHistory = historyRef.current[historyRef.current.length - 1];
                const isDuplicate =
                    lastHistory && JSON.stringify(lastHistory) === JSON.stringify(newPoints);

                if (!isDuplicate) {
                    historyRef.current.push([...newPoints]);
                    console.log(
                        `Point added: ${prev.length} -> ${newPoints.length}, history: ${historyRef.current.length}`
                    );
                } else {
                    console.log(
                        `Skipped duplicate: points=${newPoints.length}, history=${historyRef.current.length}`
                    );
                }

                return newPoints;
            });
        };

        map.on('click', handleMapClick);

        return () => {
            map.off('click', handleMapClick);
        };
    }, [isDrawing, map, draggedPointIndex, historyRef, setCurrentPoints]);
}
