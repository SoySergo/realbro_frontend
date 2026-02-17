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

    // Изохрон (время до точки)
    isochroneCenter?: [number, number]; // [lng, lat]
    isochroneMinutes?: number;
    isochroneProfile?: 'walking' | 'cycling' | 'driving';

    // Сортировка
    sort?: string;
    sortOrder?: 'asc' | 'desc';

    // Мета-информация о локациях (для восстановления границ)
    locationsMeta?: Array<{
        id: number;
        name?: string;
        wikidata?: string;
        adminLevel?: number;
    }>;

    // === Бекенд-совместимые поля (snake_case) ===

    // Тип сделки (бекенд: 'sale' | 'rent' | 'sale,rent')
    property_types?: string;
    // Вид недвижимости (1=residential, 2=commercial, 3=industrial, 4=land, 5=other)
    property_kind_ids?: number[];
    // Категория (1=room, 2=apartment, 3=house)
    categories?: number[];
    // Подкатегория (4=piso, 5=studio, 6=loft, ...)
    sub_categories?: number[];

    // Локации (snake_case — маппинг admin_level)
    country_ids?: number[];
    region_ids?: number[];
    province_ids?: number[];
    city_ids?: number[];             // admin_level 7 и 8 → city_ids
    district_ids?: number[];
    neighborhood_ids?: number[];

    // Ванные
    bathrooms?: number[];

    // Геолокация
    bbox?: string;                   // 'minLat,minLng,maxLat,maxLng'
    radius?: number;                 // метры
    radius_lat?: number;
    radius_lng?: number;
    geojson?: string;                // inline GeoJSON
    polygon_ids?: string[];          // UUID[] сохранённых геометрий

    // Включение / исключение
    include_ids?: string[];          // UUID[]
    exclude_ids?: string[];          // UUID[]

    // Сортировка (snake_case)
    sort_by?: string;                // 'published_at' | 'price' | 'area' | 'created_at'
    sort_order_backend?: 'asc' | 'desc';

    // Пагинация
    limit?: number;
    cursor?: string;

    // Язык
    language?: string;

    // Маркеры (для saved filters)
    exclude_marker_types?: string[]; // 'dislike', 'hidden'
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
export type MarkerType = 'view' | 'no_view' | 'like' | 'dislike' | 'saved' | 'hidden' | 'to_review' | 'to_think' | 'all';

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
