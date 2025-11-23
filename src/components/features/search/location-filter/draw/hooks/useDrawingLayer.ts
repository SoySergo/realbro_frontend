import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { DrawPoint } from '@/types/draw';
import { createPolygonGeoJSON, createPointsGeoJSON } from '../utils/polygonHelpers';

type UseDrawingLayerProps = {
    map: mapboxgl.Map;
    currentPoints: DrawPoint[];
};

/**
 * Хук для отрисовки текущего полигона (в процессе рисования)
 * 
 * Функциональность:
 * - Создание GeoJSON для линий и точек
 * - Добавление источников и слоёв на карту
 * - Стилизация: первая точка зелёная, остальные синие
 * - Удаление слоёв при отсутствии точек
 */
export function useDrawingLayer({ map, currentPoints }: UseDrawingLayerProps): void {
    useEffect(() => {
        if (currentPoints.length === 0) {
            // Удаляем источник и слои если нет точек
            if (map.getSource('drawing-polygon')) {
                if (map.getLayer('drawing-polygon-fill')) map.removeLayer('drawing-polygon-fill');
                if (map.getLayer('drawing-polygon-line')) map.removeLayer('drawing-polygon-line');
                if (map.getLayer('drawing-polygon-points')) map.removeLayer('drawing-polygon-points');
                map.removeSource('drawing-polygon');
                map.removeSource('drawing-polygon-points');
            }
            return;
        }

        // GeoJSON для текущих точек и линий
        const geojson = createPolygonGeoJSON(currentPoints);
        const pointsGeojson = createPointsGeoJSON(currentPoints);

        // Добавляем источник для полигона если его нет
        if (!map.getSource('drawing-polygon')) {
            map.addSource('drawing-polygon', { type: 'geojson', data: geojson });
        } else {
            (map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource).setData(geojson);
        }

        // Добавляем источник для точек если его нет
        if (!map.getSource('drawing-polygon-points')) {
            map.addSource('drawing-polygon-points', { type: 'geojson', data: pointsGeojson });
        } else {
            (map.getSource('drawing-polygon-points') as mapboxgl.GeoJSONSource).setData(pointsGeojson);
        }

        // Добавляем слои только если их ещё нет
        if (!map.getLayer('drawing-polygon-fill')) {
            // Заливка полигона (полупрозрачная)
            map.addLayer({
                id: 'drawing-polygon-fill',
                type: 'fill',
                source: 'drawing-polygon',
                paint: {
                    'fill-color': '#3b82f6', // Синий цвет
                    'fill-opacity': 0.4,
                },
                filter: ['==', ['geometry-type'], 'Polygon'],
            });
        }

        if (!map.getLayer('drawing-polygon-line')) {
            // Линии полигона
            map.addLayer({
                id: 'drawing-polygon-line',
                type: 'line',
                source: 'drawing-polygon',
                paint: {
                    'line-color': '#3b82f6',
                    'line-width': 2,
                    'line-opacity': 1,
                },
            });
        }

        if (!map.getLayer('drawing-polygon-points')) {
            // Точки (вершины) - все точки синие
            map.addLayer({
                id: 'drawing-polygon-points',
                type: 'circle',
                source: 'drawing-polygon-points',
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#198BFF',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                },
            });
        }
    }, [currentPoints, map]);
}
