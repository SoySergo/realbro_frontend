import type { BoundaryFeature } from '../model/types';

/**
 * Утилиты для работы с OSM границами
 */

/**
 * Проверяет, находится ли точка внутри границы (используя GeoJSON polygon)
 */
export const isPointInBoundary = (
    point: { lat: number; lng: number },
    boundary: BoundaryFeature
): boolean => {
    if (boundary.geometry.type !== 'Polygon' && boundary.geometry.type !== 'MultiPolygon') {
        return false;
    }

    // Для точной проверки нужна более сложная логика (ray casting algorithm)
    // TODO: Реализовать точную проверку point-in-polygon
    return false;
};

/**
 * Вычисляет центр границы
 */
export const getBoundaryCenter = (boundary: BoundaryFeature): { lat: number; lng: number } => {
    // Fallback: вычисляем из координат
    if (boundary.geometry.type === 'Polygon') {
        const coords = boundary.geometry.coordinates[0] as [number, number][];
        const sum = coords.reduce(
            (acc, [lng, lat]) => ({
                lat: acc.lat + lat,
                lng: acc.lng + lng,
            }),
            { lat: 0, lng: 0 }
        );
        return {
            lat: sum.lat / coords.length,
            lng: sum.lng / coords.length,
        };
    }

    return { lat: 0, lng: 0 };
};

/**
 * Форматирует название границы для отображения
 */
export const formatBoundaryName = (boundary: BoundaryFeature): string => {
    const props = boundary.properties;

    // Приоритет: name > name_en > wikidata label
    if (props.name) return String(props.name);
    if (props.name_en) return String(props.name_en);

    return 'Unknown Location';
};

/**
 * Получает тип локации по admin_level
 */
export const getLocationType = (adminLevel?: number): string => {
    switch (adminLevel) {
        case 2:
            return 'country';
        case 4:
            return 'region';
        case 6:
            return 'province';
        case 7:
            return 'comarca';
        case 8:
            return 'city';
        case 9:
            return 'district';
        case 10:
            return 'neighborhood';
        default:
            return 'location';
    }
};

/**
 * Извлекает wikidata ID из boundary
 */
export const getWikidataId = (boundary: BoundaryFeature): string | undefined => {
    return boundary.properties.wikidata;
};