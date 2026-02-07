/**
 * Типы для избранного
 * Включает заметки, напоминания, сохраненные фильтры и профессионалов
 */

import type { Property, PropertyAuthor } from '@/entities/property/model/types';

// Заметка к объекту недвижимости
export interface PropertyNote {
    id: string;
    propertyId: string;
    userId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
    reminder?: Reminder;
    // Связанный объект для отображения в списке
    property?: Property;
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
