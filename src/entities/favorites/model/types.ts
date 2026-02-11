/**
 * Типы для избранного
 * Включает заметки, напоминания, сохраненные фильтры и профессионалов
 */

import type { Property, PropertyAuthor } from '@/entities/property/model/types';

// Заметка к объекту недвижимости
export interface PropertyNote {
    id: string;
    propertyId?: string; // Опциональный - заметка может быть не привязана к объекту
    userId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
    reminder?: Reminder;
    // Связанный объект для отображения в списке
    property?: Property;
    // Связанное агентство (если заметка об агентстве)
    agency?: PropertyAuthor;
    // Тип заметки
    type?: 'property' | 'agency' | 'general';
}

// Напоминание
export interface Reminder {
    id: string;
    noteId: string;
    date: Date;
    isCompleted: boolean;
    notificationSent: boolean;
}

// Профессионал (агент/агентство/владелец) в избранном
export interface FavoriteProfessional {
    id: string;
    professional: PropertyAuthor;
    addedAt: Date;
    // Дополнительная статистика
    activeListingsCount?: number;
    avgResponseTime?: string;
    // История взаимодействий
    viewedAt?: Date; // Когда просматривалась страница агента
    contactRequestedAt?: Date; // Когда запрашивали контакты
    messagesSent?: number; // Количество отправленных сообщений
    reviewWritten?: boolean; // Написан ли отзыв
}

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

// Типы для API запросов
export interface CreateNoteRequest {
    propertyId: string;
    text: string;
    reminderDate?: Date;
}

export interface UpdateNoteRequest {
    id: string;
    text?: string;
    reminderDate?: Date | null;
}

export interface CreateReminderRequest {
    noteId: string;
    date: Date;
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
