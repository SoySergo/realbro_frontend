/**
 * Типы для работы с границами (boundaries) из PBF тайлов
 */

// Тип границы
export type BoundaryType = 'country' | 'province' | 'city' | 'district' | 'neighborhood';

// Свойства границы из PBF тайла
export interface BoundaryFeatureProperties {
    osm_id: number;
    name: string;
    admin_level: number; // 2, 4, 6, 7, 8, 9, 10
    boundary_type: string; // 'administrative'
    name_en?: string;
    name_fr?: string;
    name_ru?: string;
    name_es?: string;
    name_ca?: string; // Каталонское название
    population?: number;
    area?: number; // площадь в км²
    wikidata?: string; // Wikidata ID для синхронизации (например: "Q1492" для Барселоны)

    // Дополнительные свойства в зависимости от типа
    countryId?: number;
    provinceId?: number;
    cityId?: number;
    districtId?: number;

    // Метаданные
    [key: string]: string | number | boolean | undefined;
}

// Feature из Mapbox (GeoJSON)
export interface BoundaryFeature {
    type: 'Feature';
    id?: string | number;
    geometry: {
        type: 'Polygon' | 'MultiPolygon';
        coordinates: number[][][] | number[][][][]; // Polygon или MultiPolygon coordinates
    };
    properties: BoundaryFeatureProperties;
    layer?: {
        id: string;
        type: string;
        source: string;
        [key: string]: string | number | boolean | undefined;
    };
}

// Событие клика на границу
export interface BoundaryClickEvent {
    feature: BoundaryFeature;
    lngLat: {
        lng: number;
        lat: number;
    };
    point: {
        x: number;
        y: number;
    };
}
