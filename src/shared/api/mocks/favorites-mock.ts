/**
 * Моки для избранного
 * Централизованные данные для профессионалов, заметок, фильтров
 */

import type { 
    PropertyNote, 
    FavoriteProfessional, 
    SavedFilter, 
    FavoriteProperty 
} from '@/entities/favorites/model/types';
import type { PropertyAuthor } from '@/entities/property/model/types';
import { generateMockProperty } from './properties-mock';

// Моки профессионалов
const MOCK_PROFESSIONALS: PropertyAuthor[] = [
    {
        id: 'prof_1',
        name: 'Maria Garcia',
        avatar: 'https://i.pravatar.cc/150?u=maria_garcia',
        type: 'agent',
        agencyName: 'Barcelona Real Estate',
        isVerified: true,
        isSuperAgent: true,
        yearsOnPlatform: 5,
        objectsCount: 45,
        phone: '+34 600 123 456',
    },
    {
        id: 'prof_2',
        name: 'José Martinez',
        avatar: 'https://i.pravatar.cc/150?u=jose_martinez',
        type: 'agent',
        agencyName: 'Casa Perfecta',
        isVerified: true,
        isSuperAgent: false,
        yearsOnPlatform: 3,
        objectsCount: 28,
        phone: '+34 600 234 567',
    },
    {
        id: 'prof_3',
        name: 'BCN Properties Group',
        avatar: 'https://i.pravatar.cc/150?u=bcn_properties',
        type: 'agency',
        agencyName: 'BCN Properties Group',
        isVerified: true,
        isSuperAgent: false,
        yearsOnPlatform: 8,
        objectsCount: 156,
        phone: '+34 600 345 678',
    },
    {
        id: 'prof_4',
        name: 'Ana López',
        avatar: 'https://i.pravatar.cc/150?u=ana_lopez',
        type: 'owner',
        isVerified: true,
        yearsOnPlatform: 2,
        objectsCount: 3,
        phone: '+34 600 456 789',
    },
    {
        id: 'prof_5',
        name: 'Carlos Rodríguez',
        avatar: 'https://i.pravatar.cc/150?u=carlos_rodriguez',
        type: 'agent',
        agencyName: 'La Llave Inmobiliaria',
        isVerified: true,
        isSuperAgent: true,
        yearsOnPlatform: 7,
        objectsCount: 62,
        phone: '+34 600 567 890',
    },
];

/**
 * Генерация избранных профессионалов
 */
export function generateMockFavoriteProfessionals(count: number = 5): FavoriteProfessional[] {
    return MOCK_PROFESSIONALS.slice(0, count).map((professional, index) => {
        const daysAgo = index * 24 * 60 * 60 * 1000;
        const hasViewed = index % 2 === 0;
        const hasContacted = index % 3 === 0;
        const hasMessaged = index % 2 === 1;
        const hasReviewed = index === 0;

        return {
            id: `fav_prof_${index}`,
            professional,
            addedAt: new Date(Date.now() - daysAgo),
            activeListingsCount: professional.objectsCount,
            avgResponseTime: index % 2 === 0 ? '< 1 hour' : '< 24 hours',
            viewedAt: hasViewed ? new Date(Date.now() - daysAgo / 2) : undefined,
            contactRequestedAt: hasContacted ? new Date(Date.now() - daysAgo / 3) : undefined,
            messagesSent: hasMessaged ? Math.floor(Math.random() * 5) + 1 : undefined,
            reviewWritten: hasReviewed,
        };
    });
}

/**
 * Генерация заметок
 */
export function generateMockNotes(count: number = 5): PropertyNote[] {
    const noteTexts = [
        'Хорошая квартира, но нужно проверить документы. Связаться с владельцем в понедельник.',
        'Отличный район! Рядом метро и парк. Но цена высоковата, попробовать торговаться.',
        'Просмотр назначен на следующую неделю. Подготовить список вопросов.',
        'Квартира с ремонтом, мебель включена. Идеальный вариант для сдачи.',
        'Переезд возможен сразу. Коммуналка около 150€/мес.',
        'Владелец готов на скидку при долгосрочной аренде.',
        'Нужно уточнить про парковку и домашних животных.',
    ];

    return Array.from({ length: count }, (_, index) => {
        const property = generateMockProperty(index, { cardType: 'grid' });
        const hasReminder = index % 3 === 0;
        const reminderDate = hasReminder 
            ? new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)
            : undefined;

        return {
            id: `note_${index}`,
            propertyId: property.id,
            userId: 'user_1',
            text: noteTexts[index % noteTexts.length],
            createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - index * 12 * 60 * 60 * 1000),
            property,
            reminder: hasReminder ? {
                id: `reminder_${index}`,
                noteId: `note_${index}`,
                date: reminderDate!,
                isCompleted: false,
                notificationSent: false,
            } : undefined,
        };
    });
}

/**
 * Генерация сохраненных фильтров
 */
export function generateMockSavedFilters(count: number = 4): SavedFilter[] {
    const filterConfigs = [
        {
            name: 'Рядом с работой до 1200€',
            filters: { priceMax: 1200, roomsMin: 2 },
            location: {
                type: 'isochrone' as const,
                isochrone: {
                    center: [2.1734, 41.3851] as [number, number],
                    profile: 'walking' as const,
                    minutes: 15,
                },
            },
            propertiesCount: 23,
        },
        {
            name: 'Eixample 3+ комнаты',
            filters: { roomsMin: 3, areaMin: 80, propertyTypes: ['apartment'] },
            location: {
                type: 'search' as const,
                places: [{ id: 'eixample', name: 'Eixample, Barcelona' }],
            },
            propertiesCount: 45,
        },
        {
            name: 'Бюджетные варианты',
            filters: { priceMax: 800, roomsMin: 1 },
            location: {
                type: 'radius' as const,
                radius: {
                    center: [2.1734, 41.3851] as [number, number],
                    radiusKm: 5,
                },
            },
            propertiesCount: 89,
        },
        {
            name: 'Премиум с террасой',
            filters: { priceMin: 2000, features: ['terrace', 'pool'] },
            location: {
                type: 'search' as const,
                places: [
                    { id: 'sarria', name: 'Sarrià-Sant Gervasi' },
                    { id: 'pedralbes', name: 'Pedralbes' },
                ],
            },
            propertiesCount: 12,
        },
    ];

    return filterConfigs.slice(0, count).map((config, index) => ({
        id: `filter_${index}`,
        userId: 'user_1',
        name: config.name,
        createdAt: new Date(Date.now() - (index + 5) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
        lastUsedAt: index === 0 ? new Date() : new Date(Date.now() - index * 48 * 60 * 60 * 1000),
        filters: config.filters,
        location: config.location,
        propertiesCount: config.propertiesCount,
    }));
}

/**
 * Генерация избранных объектов
 */
export function generateMockFavoriteProperties(count: number = 6): FavoriteProperty[] {
    const notes = generateMockNotes(3);
    const markTypes: ('like' | 'dislike' | 'unsorted')[] = ['like', 'dislike', 'unsorted'];
    
    return Array.from({ length: count }, (_, index) => {
        const property = generateMockProperty(index * 3, { cardType: 'grid' });
        
        return {
            id: `fav_prop_${index}`,
            propertyId: property.id,
            userId: 'user_1',
            addedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
            property,
            note: index < 3 ? notes[index] : undefined,
            markType: markTypes[index % 3],
        };
    });
}

// API моки
export const favoritesApi = {
    // Заметки
    async createNote(propertyId: string, text: string, reminderDate?: Date): Promise<PropertyNote> {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const property = generateMockProperty(0, { cardType: 'grid' });
        const note: PropertyNote = {
            id: `note_${Date.now()}`,
            propertyId,
            userId: 'user_1',
            text,
            createdAt: new Date(),
            updatedAt: new Date(),
            property,
            reminder: reminderDate ? {
                id: `reminder_${Date.now()}`,
                noteId: `note_${Date.now()}`,
                date: reminderDate,
                isCompleted: false,
                notificationSent: false,
            } : undefined,
        };
        
        console.log('Note created:', note);
        return note;
    },

    async updateNote(noteId: string, text: string, reminderDate?: Date | null): Promise<PropertyNote> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const property = generateMockProperty(0, { cardType: 'grid' });
        const note: PropertyNote = {
            id: noteId,
            propertyId: property.id,
            userId: 'user_1',
            text,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            property,
            reminder: reminderDate ? {
                id: `reminder_${Date.now()}`,
                noteId,
                date: reminderDate,
                isCompleted: false,
                notificationSent: false,
            } : undefined,
        };
        
        console.log('Note updated:', note);
        return note;
    },

    async deleteNote(noteId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Note deleted:', noteId);
    },

    // Профессионалы
    async addProfessionalToFavorites(professionalId: string): Promise<FavoriteProfessional> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const professional = MOCK_PROFESSIONALS.find(p => p.id === professionalId) || MOCK_PROFESSIONALS[0];
        const favProfessional: FavoriteProfessional = {
            id: `fav_prof_${Date.now()}`,
            professional,
            addedAt: new Date(),
            activeListingsCount: professional.objectsCount,
        };
        
        console.log('Professional added to favorites:', favProfessional);
        return favProfessional;
    },

    async removeProfessionalFromFavorites(favProfessionalId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Professional removed from favorites:', favProfessionalId);
    },

    // Фильтры
    async saveFilter(filter: Omit<SavedFilter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<SavedFilter> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const savedFilter: SavedFilter = {
            ...filter,
            id: `filter_${Date.now()}`,
            userId: 'user_1',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        console.log('Filter saved:', savedFilter);
        return savedFilter;
    },

    async deleteFilter(filterId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Filter deleted:', filterId);
    },

    // Свойства
    async addPropertyToFavorites(propertyId: string): Promise<FavoriteProperty> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const property = generateMockProperty(0, { cardType: 'grid' });
        const favProperty: FavoriteProperty = {
            id: `fav_prop_${Date.now()}`,
            propertyId,
            userId: 'user_1',
            addedAt: new Date(),
            property,
        };
        
        console.log('Property added to favorites:', favProperty);
        return favProperty;
    },

    async removePropertyFromFavorites(favPropertyId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Property removed from favorites:', favPropertyId);
    },
};
