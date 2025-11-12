import type { PropertyType, PropertyFeature } from './property';

// Структура фильтров согласно бекенду
export interface SearchFilters {
    // Географические фильтры
    countryIds?: number[];
    regionIds?: number[];
    provinceIds?: number[];
    cityIds?: number[];
    districtIds?: number[];
    neighborhoodIds?: number[];

    // Категории недвижимости
    categoryIds?: number[];

    // Цена
    minPrice?: number;
    maxPrice?: number;

    // Комнаты
    rooms?: number[];

    // Площадь
    minArea?: number;
    maxArea?: number;

    // Язык (автоматически из локали)
    lang?: string;

    // Тип маркеров на карте
    markerType?: MarkerType;

    // Полигоны (для рисования областей)
    geometryIds?: number[];
    rawGeometryIds?: number[];

    // Сортировка
    sort?: string;
    sortOrder?: 'asc' | 'desc';
}

// Типы маркеров
export type MarkerType = 'view' | 'no_view' | 'like' | 'dislike' | 'all';

// Полигон для рисования на карте
export interface DrawPolygon {
    id: string;
    coordinates: [number, number][][]; // GeoJSON Polygon
    color?: string;
    name?: string;
    createdAt: Date;
}

// Режимы фильтра локации
export type LocationFilterMode = 'search' | 'draw' | 'isochrone' | 'radius';

// Локация для поиска
export interface LocationItem {
    id: number;
    name: string;
    type: 'city' | 'province' | 'district' | 'country';
}

// Настройки изохрона (время до точки)
export interface IsochroneSettings {
    center: [number, number]; // [lng, lat]
    profile: 'walking' | 'cycling' | 'driving';
    minutes: number; // 5, 10, 15, 30, 45, 60
}

// Настройки радиуса
export interface RadiusSettings {
    center: [number, number]; // [lng, lat]
    radiusKm: number;
}

// Локация для фильтра
export interface LocationFilter {
    mode: LocationFilterMode;
    selectedLocations?: LocationItem[]; // для режима search
    polygon?: DrawPolygon;
    isochrone?: IsochroneSettings;
    radius?: RadiusSettings;
}

// Deprecated - старые типы для обратной совместимости
export interface PropertyFilters {
    propertyType?: PropertyType[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number[];
    bathrooms?: number[];
    minArea?: number;
    maxArea?: number;
    location?: string;
    features?: PropertyFeature[];
}

export interface FilterOption {
    value: string;
    label: string;
}
