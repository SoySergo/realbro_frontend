/**
 * Базовые типы для фильтров поиска недвижимости
 */

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

    // Тип сделки
    dealType?: DealType;

    // Класс недвижимости (жилая / коммерческая)
    propertyClass?: PropertyClass;

    // Категории недвижимости (квартиры, комнаты, дома, офисы и т.д.)
    categoryIds?: number[];
    propertyCategory?: PropertyCategory[];

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

    // Радиус (центр + радиус в км)
    radiusCenter?: [number, number]; // [lng, lat]
    radiusKm?: number;

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

// Тип сделки
export type DealType = 'rent' | 'sale';

// Класс недвижимости
export type PropertyClass = 'residential' | 'commercial';

// Категория недвижимости
export type PropertyCategory =
    // Жилая
    | 'apartment'
    | 'room'
    | 'house'
    | 'villa'
    | 'penthouse'
    | 'townhouse'
    | 'studio'
    // Коммерческая
    | 'office'
    | 'retail'
    | 'warehouse'
    | 'restaurant'
    | 'hotel'
    | 'land';

// Типы маркеров
export type MarkerType = 'view' | 'no_view' | 'like' | 'dislike' | 'all';

// Deprecated - старые типы для обратной совместимости
export interface PropertyFilters {
    propertyType?: string[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number[];
    bathrooms?: number[];
    minArea?: number;
    maxArea?: number;
    location?: string;
    features?: string[];
}

export interface FilterOption {
    value: string;
    label: string;
}
