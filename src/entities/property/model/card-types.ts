// Общие типы для карточек недвижимости (данные приходят с бекенда в snake_case)

import type {
    PropertyShortListingDTO,
    PropertyEnrichedListingDTO,
    MediaResponseDTO,
    MediaItemDTO,
    AuthorShortDTO,
    AuthorLongDTO,
    LocationShortDTO,
    NearestStationDTO,
    TransportLineDTO,
    AttributeDTO,
    PropertyTypeCode,
    PropertyKindCode,
    CategoryCode,
    SubcategoryCode,
} from './api-types';
import type { PropertyFeature, PropertyType, TransportType } from './types';

// === Типы для обратной совместимости (deprecated — будут удалены) ===

// Фото объекта (deprecated → используй MediaItemDTO)
export interface PropertyCardImage {
    id: string;
    url: string;
    width: number;
    height: number;
    alt: string;
}

// Линия транспорта (deprecated → используй TransportLineDTO)
export interface TransportLine {
    name: string;
    color: string;
}

// Ближайшая станция для карточки (deprecated → используй NearestStationDTO)
export interface PropertyCardTransportStation {
    type: TransportType;
    station_name: string;
    lines: TransportLine[];
    walk_minutes: number;
}

// Автор (deprecated → используй AuthorShortDTO)
export interface PropertyCardAuthor {
    id: string;
    slug?: string;
    name: string;
    avatar?: string;
    type: 'agent' | 'owner' | 'agency';
    is_verified?: boolean;
}

// === Грид-карточка (компактная, для поисковой выдачи) ===
// Приведена к PropertyShortListingDTO с обратной совместимостью
export interface PropertyGridCard {
    id: string;
    title: string;
    slug?: string;
    // Новые поля из бекенда
    property_type?: PropertyTypeCode;
    property_kind?: PropertyKindCode;
    category?: CategoryCode;
    sub_category?: SubcategoryCode;
    currency?: string;
    // Основные характеристики
    price: number;
    price_per_meter?: number;
    price_per_month?: number;
    rooms: number;
    bathrooms?: number;
    area: number;
    floor?: number;
    total_floors?: number;
    address: string;
    // Медиа (новый формат из бекенда)
    media?: MediaResponseDTO;
    // Медиа (legacy формат) — принимает как объекты PropertyCardImage, так и plain URL строки
    images: (PropertyCardImage | string)[];
    // Локация (новый формат из бекенда)
    location?: LocationShortDTO;
    // Транспорт (legacy формат)
    transport_station?: PropertyCardTransportStation;
    // Автор (новый формат из бекенда)
    author?: AuthorShortDTO | PropertyCardAuthor;
    is_new?: boolean;
    // Даты
    published_at?: string;
    created_at?: string;
    updated_at?: string;
    // Legacy
    type?: PropertyType;
}

// === Горизонтальная карточка (расширенная, для списка) ===

// Расширенный автор для горизонтальной карточки (deprecated → используй AuthorLongDTO)
export interface PropertyHorizontalCardAuthor extends PropertyCardAuthor {
    agency_name?: string;
    agency_logo?: string;
    is_super_agent?: boolean;
    phone?: string;
}

// Видео превью (deprecated → используй MediaResponseDTO)
export interface PropertyCardVideo {
    url: string;
    thumbnail: string;
}

// 3D тур превью (deprecated → используй MediaResponseDTO)
export interface PropertyCardTour3d {
    url: string;
    thumbnail: string;
}

export interface PropertyHorizontalCard {
    id: string;
    title: string;
    slug?: string;
    // Новые поля из бекенда
    property_type?: PropertyTypeCode;
    property_kind?: PropertyKindCode;
    category?: CategoryCode;
    sub_category?: SubcategoryCode;
    currency?: string;
    // Основные характеристики
    price: number;
    price_per_meter?: number;
    price_per_month?: number;
    rooms: number;
    bathrooms?: number;
    area: number;
    floor?: number;
    total_floors?: number;
    address: string;
    description?: string;
    short_description?: string;
    // Медиа (новый формат)
    media?: MediaResponseDTO;
    // Медиа (legacy)
    images: (PropertyCardImage | string)[];
    // Атрибуты (новый формат)
    characteristics?: AttributeDTO[];
    // Legacy удобства
    amenities?: string[];
    // Локация (новый формат)
    location?: LocationShortDTO;
    // Транспорт (legacy)
    transport_station?: PropertyCardTransportStation;
    // Автор
    author?: PropertyCardAuthor | PropertyHorizontalCardAuthor | AuthorShortDTO;
    is_new?: boolean;
    is_verified?: boolean;
    // Legacy флаги (deprecated → будут в characteristics)
    no_commission?: boolean;
    exclusive?: boolean;
    video?: PropertyCardVideo;
    floor_plan?: string;
    tour_3d?: PropertyCardTour3d;
    // Даты
    published_at?: string;
    created_at?: string;
    updated_at?: string;
    // Legacy
    type?: PropertyType;
}

// === Карточка для чата (AI-предложения) ===

export interface PropertyChatCard {
    id: string;
    title: string;
    slug?: string;
    // Новые поля из бекенда
    property_type?: PropertyTypeCode;
    property_kind?: PropertyKindCode;
    category?: CategoryCode;
    sub_category?: SubcategoryCode;
    // Основные
    price: number;
    price_per_meter?: number;
    rooms: number;
    bathrooms: number;
    area: number;
    floor?: number;
    total_floors?: number;
    address: string;
    description?: string;
    // Медиа
    media?: MediaResponseDTO;
    images: (PropertyCardImage | string)[];
    // Атрибуты
    characteristics?: AttributeDTO[];
    features?: PropertyFeature[];
    // Локация / транспорт
    location?: LocationShortDTO;
    transport_station?: PropertyCardTransportStation;
    is_new?: boolean;
    is_verified?: boolean;
    // Даты
    published_at?: string;
    created_at?: string;
    updated_at?: string;
    // Legacy
    type?: PropertyType;
}

// === Утилиты для работы с изображениями (PropertyCardImage | string) ===

/** Получить URL из элемента images (поддерживает оба формата) */
export function getImageUrl(img: PropertyCardImage | string): string {
    return typeof img === 'string' ? img : img.url;
}

/** Получить alt-текст из элемента images */
export function getImageAlt(img: PropertyCardImage | string, fallback: string = ''): string {
    return typeof img === 'string' ? fallback : (img.alt || fallback);
}