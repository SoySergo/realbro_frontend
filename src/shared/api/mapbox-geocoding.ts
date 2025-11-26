import env from '@/shared/config/env';
import type { MapboxGeocodingResponse, MapboxFeature, MapboxLocation, MapboxPlaceType } from '@/entities/location';

/**
 * Сервис для работы с Mapbox Geocoding API
 * Поиск мест: городов, регионов, районов, стран
 */

const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Типы мест, которые нам интересны для поиска недвижимости
const RELEVANT_PLACE_TYPES: MapboxPlaceType[] = [
    'country',
    'region',
    'place',
    'district',
    'locality',
    'neighborhood',
];

/**
 * Параметры поиска локаций
 */
export interface GeocodingSearchParams {
    /** Поисковый запрос */
    query: string;
    /** Язык результатов (ru, en, fr) */
    language?: string;
    /** Ограничение по типам мест */
    types?: MapboxPlaceType[];
    /** Лимит результатов (по умолчанию 10) */
    limit?: number;
    /** Координаты для приоритета близости [lng, lat] */
    proximity?: [number, number];
    /** Ограничение по bbox [minLng, minLat, maxLng, maxLat] */
    bbox?: [number, number, number, number];
}

/**
 * Поиск мест через Mapbox Geocoding API
 */
export async function searchLocations(params: GeocodingSearchParams): Promise<MapboxLocation[]> {
    const { query, language = 'en', types = RELEVANT_PLACE_TYPES, limit = 10, proximity, bbox } = params;

    // Валидация запроса
    if (!query || query.trim().length < 2) {
        console.warn('Search query too short:', query);
        return [];
    }

    try {
        // Формируем URL
        const encodedQuery = encodeURIComponent(query.trim());
        const url = `${MAPBOX_GEOCODING_URL}/${encodedQuery}.json`;

        // Формируем query параметры
        const searchParams = new URLSearchParams({
            access_token: env.NEXT_PUBLIC_MAPBOX_TOKEN,
            language,
            limit: limit.toString(),
            types: types.join(','),
        });

        // Добавляем опциональные параметры
        if (proximity) {
            searchParams.append('proximity', proximity.join(','));
        }

        if (bbox) {
            searchParams.append('bbox', bbox.join(','));
        }

        // Выполняем запрос
        const response = await fetch(`${url}?${searchParams.toString()}`);

        if (!response.ok) {
            console.error('Mapbox Geocoding API error:', response.status, response.statusText);
            return [];
        }

        const data: MapboxGeocodingResponse = await response.json();

        console.log('Mapbox Geocoding results:', data.features.length, 'found');

        // Преобразуем результаты в упрощённый формат
        return data.features.map(featureToLocation);
    } catch (error) {
        console.error('Failed to search locations:', error);
        return [];
    }
}

/**
 * Получить место по ID
 */
export async function getPlaceById(placeId: string, language = 'en'): Promise<MapboxLocation | null> {
    try {
        const url = `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(placeId)}.json`;
        const searchParams = new URLSearchParams({
            access_token: env.NEXT_PUBLIC_MAPBOX_TOKEN,
            language,
        });

        const response = await fetch(`${url}?${searchParams.toString()}`);

        if (!response.ok) {
            console.error('Failed to get place by ID:', placeId);
            return null;
        }

        const data: MapboxGeocodingResponse = await response.json();

        if (data.features.length === 0) {
            return null;
        }

        return featureToLocation(data.features[0]);
    } catch (error) {
        console.error('Failed to get place by ID:', error);
        return null;
    }
}

/**
 * Преобразовать Mapbox Feature в упрощённую локацию
 */
function featureToLocation(feature: MapboxFeature): MapboxLocation {
    // Определяем основной тип места
    const placeType = feature.place_type[0];

    // Собираем контекст (полное имя с иерархией)
    const contextParts: string[] = [feature.text];

    if (feature.context) {
        feature.context.forEach((ctx) => {
            contextParts.push(ctx.text);
        });
    }

    return {
        id: feature.id,
        name: feature.text,
        placeType,
        coordinates: feature.center,
        bbox: feature.bbox,
        context: contextParts.join(', '),
        wikidata: feature.properties.wikidata,
    };
}

/**
 * Получить тип локации для совместимости с существующей системой
 */
export function mapPlaceTypeToLocationType(
    placeType: MapboxPlaceType
): 'country' | 'region' | 'province' | 'comarca' | 'city' | 'district' | 'neighborhood' {
    switch (placeType) {
        case 'country':
            return 'country';
        case 'region':
            return 'region';
        case 'place':
        case 'locality':
            return 'city';
        case 'district':
            return 'district';
        case 'neighborhood':
            return 'neighborhood';
        default:
            return 'city'; // По умолчанию считаем городом
    }
}

/**
 * Получить admin_level для OSM границ
 */
export function getAdminLevelForPlaceType(placeType: MapboxPlaceType): number | undefined {
    switch (placeType) {
        case 'country':
            return 2;
        case 'region':
            return 4;
        case 'place':
            return 8; // Города
        case 'district':
            return 9;
        case 'neighborhood':
            return 10;
        default:
            return undefined;
    }
}
