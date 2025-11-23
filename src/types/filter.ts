import type { PropertyType, PropertyFeature } from './property';

// Структура фильтров согласно бекенду
export interface SearchFilters {
    // Географические фильтры (старая структура - deprecated)
    countryIds?: number[];
    regionIds?: number[];
    provinceIds?: number[];
    cityIds?: number[];
    districtIds?: number[];
    neighborhoodIds?: number[];

    // Географические фильтры по OSM admin_level
    adminLevel2?: number[]; // Страны
    adminLevel4?: number[]; // Регионы
    adminLevel6?: number[]; // Провинции
    adminLevel7?: number[]; // Крупные города
    adminLevel8?: number[]; // Города
    adminLevel9?: number[]; // Районы
    adminLevel10?: number[]; // Кварталы/микрорайоны

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

    // Мета-информация о локациях (для восстановления границ)
    locationsMeta?: Array<{
        id: number;
        wikidata?: string;
        adminLevel?: number;
    }>;
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
    id: number; // Deprecated: для обратной совместимости
    name: string;
    type: 'country' | 'region' | 'province' | 'comarca' | 'city' | 'district' | 'neighborhood';
    adminLevel?: number; // OSM admin_level: 2, 4, 6, 7, 8, 9, 10
    centerLat?: number;
    centerLon?: number;
    areaSqKm?: number;
    // Основной идентификатор для синхронизации с картой (OSM полигонами)
    wikidata?: string; // Например: "Q1492" для Барселоны
    osmId?: number; // OSM ID (если доступен)
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

// Локальное состояние для режима search (до применения)
export interface LocalSearchModeState {
    selectedLocations: LocationItem[];
}

// Локальное состояние для режима draw (до применения)
export interface LocalDrawModeState {
    polygon: DrawPolygon | null;
}

// Локальное состояние для режима isochrone (до применения)
export interface LocalIsochroneModeState {
    isochrone: IsochroneSettings | null;
}

// Локальное состояние для режима radius (до применения)
export interface LocalRadiusModeState {
    radius: RadiusSettings | null;
}

// Общий тип для локального состояния всех режимов
export interface LocalLocationStates {
    search: LocalSearchModeState;
    draw: LocalDrawModeState;
    isochrone: LocalIsochroneModeState;
    radius: LocalRadiusModeState;
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
