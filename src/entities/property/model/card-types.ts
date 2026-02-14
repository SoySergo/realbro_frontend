// Общие типы для карточек недвижимости (данные приходят с бекенда в snake_case)

// Тип недвижимости
export type PropertyType = 'apartment' | 'studio' | 'house' | 'penthouse' | 'duplex';

// Тип транспорта
export type TransportType = 'metro' | 'train' | 'bus';

// Фото объекта — с бекенда приходит id, размеры, alt
export interface PropertyCardImage {
    id: string;
    url: string;
    width: number;
    height: number;
    alt: string;
}

// Линия транспорта (у одной станции может быть несколько линий)
export interface TransportLine {
    name: string;
    color: string;
}

// Ближайшая станция транспорта для карточки
export interface PropertyCardTransportStation {
    type: TransportType;
    station_name: string;
    lines: TransportLine[];
    walk_minutes: number;
}

// Автор объявления в карточке (минимальная информация)
export interface PropertyCardAuthor {
    id: string;
    name: string;
    avatar?: string;
    type: 'agent' | 'owner' | 'agency';
    is_verified?: boolean;
}

// === Грид-карточка (компактная, для поисковой выдачи) ===
export interface PropertyGridCard {
    id: string;
    title: string;
    type: PropertyType;
    price: number;
    price_per_meter?: number;
    rooms: number;
    area: number;
    floor?: number;
    total_floors?: number;
    address: string;
    images: PropertyCardImage[];
    transport_station?: PropertyCardTransportStation;
    author?: PropertyCardAuthor;
    is_new?: boolean;
    created_at: string;
}

// === Горизонтальная карточка (расширенная, для списка) ===

// Расширенный автор для горизонтальной карточки
export interface PropertyHorizontalCardAuthor extends PropertyCardAuthor {
    agency_name?: string;
    agency_logo?: string;
    is_super_agent?: boolean;
    phone?: string;
}

// Видео превью
export interface PropertyCardVideo {
    url: string;
    thumbnail: string;
}

// 3D тур превью
export interface PropertyCardTour3d {
    url: string;
    thumbnail: string;
}

export interface PropertyHorizontalCard {
    id: string;
    title: string;
    type: PropertyType;
    price: number;
    price_per_meter?: number;
    rooms: number;
    bathrooms?: number;
    area: number;
    floor?: number;
    total_floors?: number;
    address: string;
    description?: string;
    images: PropertyCardImage[];
    amenities?: string[];
    transport_station?: PropertyCardTransportStation;
    author?: PropertyCardAuthor | PropertyHorizontalCardAuthor;
    is_new?: boolean;
    is_verified?: boolean;
    no_commission?: boolean;
    exclusive?: boolean;
    video?: PropertyCardVideo;
    floor_plan?: string;
    tour_3d?: PropertyCardTour3d;
    created_at: string;
}

// === Карточка для чата (AI-предложения) ===
export type PropertyFeature =
    | 'parking'
    | 'elevator'
    | 'terrace'
    | 'balcony'
    | 'airConditioning'
    | 'heating'
    | 'furnished'
    | 'petFriendly'
    | 'pool'
    | 'garden';

export interface PropertyChatCard {
    id: string;
    title: string;
    type: PropertyType;
    price: number;
    price_per_meter?: number;
    rooms: number;
    bathrooms: number;
    area: number;
    floor?: number;
    total_floors?: number;
    address: string;
    description?: string;
    images: PropertyCardImage[];
    features?: PropertyFeature[];
    transport_station?: PropertyCardTransportStation;
    is_new?: boolean;
    is_verified?: boolean;
    created_at: string;
}
