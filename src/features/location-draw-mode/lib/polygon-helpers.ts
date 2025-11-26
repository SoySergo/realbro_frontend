import type { DrawPoint } from '@/entities/map-draw/model/types';

/**
 * Генерация уникального ID для полигона
 */
export const generatePolygonId = (): string => {
    return `polygon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Создание GeoJSON для полигона из массива точек
 */
export const createPolygonGeoJSON = (points: DrawPoint[]): GeoJSON.FeatureCollection => {
    return {
        type: 'FeatureCollection',
        features: [
            // Линии между точками
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: points.map((p) => [p.lng, p.lat]),
                },
            },
            // Полигон (если >= 3 точек)
            ...(points.length >= 3
                ? [
                    {
                        type: 'Feature' as const,
                        properties: {},
                        geometry: {
                            type: 'Polygon' as const,
                            coordinates: [[...points.map((p) => [p.lng, p.lat]), [points[0].lng, points[0].lat]]],
                        },
                    },
                ]
                : []),
        ],
    };
};

/**
 * Создание GeoJSON для точек полигона
 */
export const createPointsGeoJSON = (points: DrawPoint[]): GeoJSON.FeatureCollection => {
    return {
        type: 'FeatureCollection',
        features: points.map((point, index) => ({
            type: 'Feature',
            properties: { index },
            geometry: {
                type: 'Point',
                coordinates: [point.lng, point.lat],
            },
        })),
    };
};

/**
 * Проверка являются ли два массива точек идентичными
 */
export const arePointsEqual = (points1: DrawPoint[], points2: DrawPoint[]): boolean => {
    return JSON.stringify(points1) === JSON.stringify(points2);
};
