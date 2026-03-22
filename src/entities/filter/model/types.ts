/**
 * Search filter types — URL is the single source of truth.
 * Each field maps directly to a URL search parameter.
 * No backend snake_case fields, no localStorage, no duplicates.
 */

export type MarkerType =
    | 'view'
    | 'no_view'
    | 'like'
    | 'dislike'
    | 'saved'
    | 'hidden'
    | 'to_review'
    | 'to_think'
    | 'all';

export type SortField = 'price' | 'area' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
export type GeometrySource = 'guest' | 'filter';

/**
 * SearchFilters — URL-representable filter state.
 * undefined = parameter not set in URL.
 */
export interface SearchFilters {
    // Price range: ?price=500-2000
    minPrice?: number;
    maxPrice?: number;

    // Area range: ?area=50-100
    minArea?: number;
    maxArea?: number;

    // Room counts: ?rooms=2,3,4
    rooms?: number[];

    // Bathrooms: ?bathrooms=1,2
    bathrooms?: number[];

    // Category IDs: ?categories=1,2
    categoryIds?: number[];

    // Subcategory IDs: ?sub_categories=4,5,6
    subCategories?: number[];

    // Admin levels (OSM): ?admin2=123&admin4=456...
    adminLevel2?: number[];
    adminLevel4?: number[];
    adminLevel6?: number[];
    adminLevel7?: number[];
    adminLevel8?: number[];
    adminLevel9?: number[];
    adminLevel10?: number[];

    // Geometry UUIDs: ?polygon=uuid1,uuid2&isochrone=uuid3&radius=uuid4
    polygonIds?: string[];
    isochroneIds?: string[];
    radiusIds?: string[];

    // Geometry source: ?geo_src=guest|filter
    geoSrc?: GeometrySource;

    // Marker type: ?marker=like
    markerType?: MarkerType;

    // Sort: ?sort=price&order=desc
    sort?: SortField;
    order?: SortOrder;

    // Bounding box (visible map area): ?bbox=west,south,east,north
    bbox?: [number, number, number, number];
}

// Legacy re-exports for gradual migration
export type DealType = 'rent' | 'sale';
export type PropertyClass = 'residential' | 'commercial';
export type PropertyCategory =
    | 'apartment'
    | 'room'
    | 'house'
    | 'villa'
    | 'penthouse'
    | 'townhouse'
    | 'studio'
    | 'office'
    | 'retail'
    | 'warehouse'
    | 'restaurant'
    | 'hotel'
    | 'land';



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
