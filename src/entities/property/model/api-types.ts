/**
 * Backend DTO Types — точное соответствие ответам бекенда (snake_case)
 * 
 * Источник: BACKEND_API_DOCS.md
 * Эти типы используются для десериализации ответов API.
 * Все поля в snake_case, как приходят с бекенда.
 */

// === Подкатегория объекта ===
export type SubcategoryCode =
    | 'single' | 'double' | 'shared'           // room
    | 'piso' | 'studio' | 'loft' | 'atico'     // apartment
    | 'penthouse' | 'duplex' | 'triplex'
    | 'bajo' | 'entresuelo'
    | 'chalet' | 'villa' | 'townhouse'          // house
    | 'pareado' | 'adosado' | 'independiente'
    | 'rustico' | 'finca' | 'cortijo' | 'masia';

// === Тип сделки ===
export type PropertyTypeCode = 'sale' | 'rent';

// === Вид недвижимости ===
export type PropertyKindCode = 'residential' | 'commercial' | 'industrial' | 'land' | 'other';

// === Категория ===
export type CategoryCode = 'room' | 'apartment' | 'house' | 'property';

// === Координаты ===
export interface CoordinatesDTO {
    lat: number;
    lng: number;
}

// === Линия транспорта ===
export interface TransportLineDTO {
    id: number;
    name: string;
    ref?: string;
    type?: string;
    color?: string;
}

// === Ближайшая станция транспорта ===
export interface NearestStationDTO {
    station_id: number;
    name: string;
    type: string;              // "metro", "tram", "bus", etc.
    lat: number;
    lon: number;
    distance: number;          // метры
    walking_distance?: number;
    walking_duration?: number; // секунды
    lines?: TransportLineDTO[];
}

// === Локация (краткая — для списка) ===
export interface LocationShortDTO {
    address: string;
    is_address_visible: boolean;
    coordinates: CoordinatesDTO;
    transport?: NearestStationDTO;  // ближайшая 1 станция
}

// === Локация (детальная — для карточки объекта) ===
export interface LocationDetailsDTO {
    formatted_address: string;
    is_address_visible: boolean;
    coordinates: CoordinatesDTO;
    transport: NearestStationDTO[]; // все ближайшие станции
}

// === Автор (краткий — для списка) ===
export interface AuthorShortDTO {
    id: string;
    contact_id: string;
    name: string;
    avatar?: string;
    author_type: 'owner' | 'agent' | 'agency';
    company_id?: string;
    company_name?: string;
    company_logo?: string;
    company_url?: string;
    is_verified: boolean;
}

// === Автор (полный — для карточки объекта) ===
export interface AuthorLongDTO extends AuthorShortDTO {
    object_count: number;
    rating: number;
    review_count: number;
}

// === Медиа-элемент ===
export interface MediaItemDTO {
    id: string;
    url: string;
    type: string;             // "image" | "video" | "floor"
    width?: number;
    height?: number;
    description?: string;
}

// === Медиа (фото, видео, планировки) ===
export interface MediaResponseDTO {
    photos: MediaItemDTO[];
    videos: MediaItemDTO[];
    plans: MediaItemDTO[];
    photos_count: number;
    videos_count: number;
    plans_count: number;
}

// === Атрибут (характеристика/удобство/параметр) ===
export interface AttributeDTO {
    label: string;        // переведённое название
    value: string;        // код (напр. "has_elevator")
    icon_type: string;    // тип иконки (lucide key)
}

// === Краткий листинг (для grid-карточек) ===
export interface PropertyShortListingDTO {
    id: string;
    property_type: PropertyTypeCode;
    property_kind: PropertyKindCode;
    category: CategoryCode;
    sub_category: SubcategoryCode;
    author: AuthorShortDTO;
    location: LocationShortDTO;
    title: string;
    slug: string;
    price: number;
    price_per_month?: number;
    area: number;
    area_useful?: number;
    rooms: number | null;
    bathrooms: number | null;
    floor: number | null;
    total_floors: number | null;
    media: MediaResponseDTO;
    published_at: string;       // ISO 8601
    updated_at: string;
}

// === Обогащённый листинг (для горизонтальных карточек) ===
export interface PropertyEnrichedListingDTO extends PropertyShortListingDTO {
    characteristics: AttributeDTO[];
    amenities: AttributeDTO[];
    tenant_preferences: AttributeDTO[];
    tenants: AttributeDTO[];
    estate_info: AttributeDTO[];
    short_description: string;
}

// === Детальная карточка объекта ===
export interface PropertyDetailsDTO {
    property_type: PropertyTypeCode;
    property_kind: PropertyKindCode;
    category: string;               // переведённое название
    sub_category: string;           // переведённое название
    author: AuthorLongDTO;
    location: LocationDetailsDTO;
    title: string;
    slug: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords: string[];
    price: number;
    price_per_month?: number;
    area: number;
    area_useful?: number;
    area_kitchen?: number;
    rooms: number | null;
    bathrooms: number | null;
    floor: number | null;
    total_floors: number | null;
    deposit_months?: number;
    deposit?: number;
    agency_fee?: number;
    min_term?: number;
    max_term?: number;
    description: string;
    description_original: string;
    building_info: AttributeDTO[];
    estate_info: AttributeDTO[];
    energy_efficiency: AttributeDTO[];
    characteristics: AttributeDTO[];
    amenities: AttributeDTO[];
    tenant_preferences: AttributeDTO[];
    tenants: AttributeDTO[];
    media: MediaResponseDTO;
    published_at: string;
    updated_at: string;
}
