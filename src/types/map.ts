import type { Property } from './property';

// Viewport карты (область отображения)
export type MapViewport = {
    latitude: number;
    longitude: number;
    zoom: number;
};

// Упрощенная версия Property для маркеров на карте
export type MapProperty = Pick<Property, 'id' | 'coordinates' | 'price' | 'type'> & {
    title?: string;
};

// Конфигурация маркера
export type MarkerConfig = {
    color?: string;
    size?: number;
};

// Типы мест в Mapbox Geocoding API
export type MapboxPlaceType =
    | 'country' // Страна
    | 'region' // Регион/штат
    | 'postcode' // Почтовый индекс
    | 'district' // Район
    | 'place' // Город
    | 'locality' // Населённый пункт
    | 'neighborhood' // Квартал
    | 'address' // Адрес
    | 'poi'; // Точка интереса

// Контекст локации из Mapbox (иерархия мест)
export interface MapboxContext {
    id: string;
    text: string;
    wikidata?: string;
    short_code?: string;
}

// Геометрия места
export interface MapboxGeometry {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][];
}

// Свойства места
export interface MapboxProperties {
    wikidata?: string;
    short_code?: string;
    accuracy?: string;
}

// Feature из Mapbox Geocoding API
export interface MapboxFeature {
    id: string;
    type: 'Feature';
    place_type: MapboxPlaceType[];
    relevance: number;
    properties: MapboxProperties;
    text: string;
    place_name: string;
    bbox?: [number, number, number, number];
    center: [number, number]; // [lng, lat]
    geometry: MapboxGeometry;
    context?: MapboxContext[];
}

// Результат запроса к Geocoding API
export interface MapboxGeocodingResponse {
    type: 'FeatureCollection';
    query: string[];
    features: MapboxFeature[];
    attribution: string;
}

// Упрощённая локация для использования в приложении
export interface MapboxLocation {
    id: string;
    name: string;
    placeType: MapboxPlaceType;
    coordinates: [number, number]; // [lng, lat]
    bbox?: [number, number, number, number];
    context?: string; // Полное имя с иерархией
    wikidata?: string;
}
