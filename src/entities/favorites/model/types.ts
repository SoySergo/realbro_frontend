/**
 * Типы для избранного
 * Синхронизированы с BACKEND_API_DOCS.md (секции 13, 14)
 * Включает заметки, напоминания, сохраненные фильтры и профессионалов
 */

import type { Property, PropertyAuthor } from '@/entities/property/model/types';

// === Backend API Types (snake_case) ===

/**
 * Заметка к объекту недвижимости (бекенд формат)
 * Эндпоинт: /api/v1/favorites/notes
 */
export interface PropertyNote {
    id: string;
    user_id: string;
    property_id: string;
    content: string;
    tags: string[];
    note_type: 'property' | 'agency';
    is_private: boolean;
    reminder?: ReminderResponse;
    created_at: string;
    updated_at: string;
    // Связанный объект для отображения в списке (опциональный, фронтенд)
    property?: Property;
    // Связанное агентство (если заметка об агентстве)
    agency?: PropertyAuthor;
}

/**
 * Напоминание (бекенд формат)
 */
export interface ReminderResponse {
    id: string;
    note_id: string;
    remind_at: string;
    completed_at?: string;
    message: string;
    is_notified: boolean;
}

/**
 * Запрос на создание заметки
 */
export interface CreateNoteRequest {
    property_id: string;
    content: string;
    tags?: string[];
    note_type: 'property' | 'agency';
    reminder_at?: string;
    reminder_message?: string;
}

/**
 * Запрос на обновление заметки
 */
export interface UpdateNoteRequest {
    content?: string;
    tags?: string[];
}

/**
 * Профессионал (агент/агентство) в избранном (бекенд формат)
 * Эндпоинт: /api/v1/favorites/professionals
 */
export interface FavoriteProfessional {
    id: string;
    user_id: string;
    contact_id: string;
    professional_type: 'agent' | 'agency';
    // Inline-данные профессионала (бекенд возвращает inline)
    name: string;
    avatar_url?: string;
    company_name?: string;
    phone?: string;
    notes: string;
    contact_requested_at?: string;
    messages_count: number;
    properties_count: number;
    created_at: string;
    updated_at: string;
}

/**
 * Запрос на добавление профессионала в избранное
 */
export interface CreateFavProfRequest {
    contact_id: string;
    professional_type: 'agent' | 'agency';
}

/**
 * Запрос на обновление взаимодействий с профессионалом
 */
export interface UpdateInteractionsRequest {
    contact_requested?: boolean;
    increment_messages?: boolean;
    notes?: string;
}

// === Frontend UI Types ===

// Тип локации для сохраненного фильтра
export type SavedFilterLocationType = 'search' | 'draw' | 'isochrone' | 'radius';

// Данные локации для сохраненного фильтра
export interface SavedFilterLocation {
    type: SavedFilterLocationType;
    // Для search mode - ID и названия выбранных мест
    places?: Array<{
        id: string;
        name: string;
    }>;
    // Для draw mode - GeoJSON полигон
    polygon?: {
        name: string;
        coordinates: number[][][];
    };
    // Для isochrone mode
    isochrone?: {
        center: [number, number];
        profile: 'walking' | 'cycling' | 'driving';
        minutes: number;
    };
    // Для radius mode
    radius?: {
        center: [number, number];
        radiusKm: number;
    };
}

// Сохраненный фильтр
export interface SavedFilter {
    id: string;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    lastUsedAt?: Date;
    // Параметры фильтра
    filters: {
        priceMin?: number;
        priceMax?: number;
        areaMin?: number;
        areaMax?: number;
        roomsMin?: number;
        roomsMax?: number;
        propertyTypes?: string[];
        features?: string[];
    };
    // Локация
    location?: SavedFilterLocation;
    // Статистика
    propertiesCount?: number;
}

// Избранный объект недвижимости
export interface FavoriteProperty {
    id: string;
    propertyId: string;
    userId: string;
    addedAt: Date;
    property: Property;
    note?: PropertyNote;
    // Тип отметки (для фильтрации)
    markType?: 'like' | 'dislike' | 'unsorted';
}

// Табы избранного
export type FavoritesTab = 'properties' | 'professionals' | 'filters' | 'notes';

// Типы фильтров для вкладок

// Фильтры для объектов
export interface FavoritesPropertiesFilters {
    // Диапазон дат добавления
    dateFrom?: Date;
    dateTo?: Date;
    // Тип отметки
    markType?: 'all' | 'like' | 'dislike' | 'unsorted';
    // Основные фильтры из листинга
    minPrice?: number;
    maxPrice?: number;
    rooms?: number[];
    minArea?: number;
    maxArea?: number;
    propertyCategory?: string[];
    // Сортировка
    sortBy?: 'addedAt' | 'price' | 'area' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

// Фильтры для профессионалов
export interface FavoritesProfessionalsFilters {
    // Фильтр по типу взаимодействия
    interactionType?: 'all' | 'viewed' | 'contacted' | 'messaged' | 'reviewed';
    // Сортировка
    sortBy?: 'addedAt' | 'lastInteraction' | 'messagesCount';
    sortOrder?: 'asc' | 'desc';
}

// Фильтры для заметок
export interface FavoritesNotesFilters {
    // Диапазон дат
    dateFrom?: Date;
    dateTo?: Date;
    // Тип заметки
    noteType?: 'all' | 'property' | 'agency' | 'general';
    // Наличие напоминания
    hasReminder?: boolean;
    // Сортировка
    sortBy?: 'createdAt' | 'updatedAt' | 'reminderDate';
    sortOrder?: 'asc' | 'desc';
}
