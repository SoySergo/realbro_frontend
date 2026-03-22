import type { DrawPoint } from '@/entities/map-draw/model/types';

/**
 * Генерация UUIDv7 (timestamp-sortable)
 */
export const generatePolygonId = (): string => {
    const now = Date.now();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Записываем 48-бит timestamp в первые 6 байт
    bytes[0] = (now / 2 ** 40) & 0xff;
    bytes[1] = (now / 2 ** 32) & 0xff;
    bytes[2] = (now / 2 ** 24) & 0xff;
    bytes[3] = (now / 2 ** 16) & 0xff;
    bytes[4] = (now / 2 ** 8) & 0xff;
    bytes[5] = now & 0xff;
    // Версия 7
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    // Вариант RFC4122
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
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
