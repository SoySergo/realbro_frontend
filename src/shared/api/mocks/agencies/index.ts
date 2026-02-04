/**
 * Agency API - Mock/Real API Switching
 *
 * Этот модуль предоставляет API функции для работы с агентствами недвижимости.
 * Поддерживает переключение между мок-данными и реальным API.
 *
 * Использование:
 *   - NEXT_PUBLIC_USE_MOCKS=true для мок-данных
 *   - NEXT_PUBLIC_USE_MOCKS=false для реального API
 */

import type {
    Agency,
    AgencyCardData,
    AgencyFilters,
    AgencyReview,
} from '@/entities/agency';
import type { Property } from '@/entities/property';
import {
    generateMockAgency,
    generateMockAgencyCards,
    generateMockAgenciesPage,
} from './agencies-mock';
import { generateMockProperties, type MockPropertyConfig } from '../properties-mock';

// Реэкспорт типов и моков
export * from './agencies-mock';

// ============================================================================
// Configuration
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

// ============================================================================
// API Functions
// ============================================================================

/**
 * Получить агентство по ID
 */
export async function getAgencyById(id: string, locale: string = 'ru'): Promise<Agency | null> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Извлекаем индекс из ID
        const index = parseInt(id.replace('agency_', ''), 10) || 0;
        const agency = generateMockAgency(index, { 
            locale: locale as 'ru' | 'en' | 'es' | 'fr',
            includeAgents: true,
            includeReviews: true,
        });
        
        return { ...agency, id };
    }

    try {
        const response = await fetch(`${API_BASE}/agencies/${id}?lang=${locale}`, {
            next: { revalidate: 3600 }, // ISR: 1 час
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Failed to get agency ${id}:`, error);
        return null;
    }
}

/**
 * Получить агентство по slug
 */
export async function getAgencyBySlug(slug: string, locale: string = 'ru'): Promise<Agency | null> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Ищем агентство по slug в моках
        for (let i = 0; i < 15; i++) {
            const agency = generateMockAgency(i, { 
                locale: locale as 'ru' | 'en' | 'es' | 'fr',
                includeAgents: true,
                includeReviews: true,
            });
            if (agency.slug === slug) {
                return agency;
            }
        }
        return null;
    }

    try {
        const response = await fetch(`${API_BASE}/agencies/slug/${slug}?lang=${locale}`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Failed to get agency by slug ${slug}:`, error);
        return null;
    }
}

/**
 * Получить список агентств с фильтрами
 */
export async function getAgenciesList(
    filters: AgencyFilters = {},
    page: number = 1,
    limit: number = 12,
    locale: string = 'ru'
): Promise<{
    data: AgencyCardData[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        let allAgencies = generateMockAgencyCards(50, { 
            locale: locale as 'ru' | 'en' | 'es' | 'fr' 
        });

        // Применяем фильтры
        if (filters.query) {
            const query = filters.query.toLowerCase();
            allAgencies = allAgencies.filter(a => 
                a.name.toLowerCase().includes(query)
            );
        }

        if (filters.languages && filters.languages.length > 0) {
            allAgencies = allAgencies.filter(a =>
                filters.languages!.some(lang => a.languages.includes(lang))
            );
        }

        if (filters.propertyTypes && filters.propertyTypes.length > 0) {
            allAgencies = allAgencies.filter(a =>
                filters.propertyTypes!.some(type => a.propertyTypes.includes(type))
            );
        }

        if (filters.minRating) {
            allAgencies = allAgencies.filter(a => a.rating >= filters.minRating!);
        }

        if (filters.isVerified !== undefined) {
            allAgencies = allAgencies.filter(a => a.isVerified === filters.isVerified);
        }

        // Сортировка
        if (filters.sort) {
            const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
            allAgencies.sort((a, b) => {
                switch (filters.sort) {
                    case 'rating':
                        return (a.rating - b.rating) * sortOrder;
                    case 'reviewsCount':
                        return (a.reviewsCount - b.reviewsCount) * sortOrder;
                    case 'objectsCount':
                        return (a.objectsCount - b.objectsCount) * sortOrder;
                    case 'name':
                        return a.name.localeCompare(b.name) * sortOrder;
                    default:
                        return 0;
                }
            });
        }

        const total = allAgencies.length;
        const offset = (page - 1) * limit;
        const data = allAgencies.slice(offset, offset + limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            lang: locale,
        });

        if (filters.query) params.append('query', filters.query);
        if (filters.languages) params.append('languages', filters.languages.join(','));
        if (filters.propertyTypes) params.append('propertyTypes', filters.propertyTypes.join(','));
        if (filters.minRating) params.append('minRating', filters.minRating.toString());
        if (filters.isVerified !== undefined) params.append('isVerified', filters.isVerified.toString());
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

        const response = await fetch(`${API_BASE}/agencies?${params}`, {
            next: { revalidate: 300 }, // ISR: 5 минут
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] Failed to get agencies list:', error);
        return {
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
        };
    }
}

/**
 * Получить объекты недвижимости агентства
 */
export async function getAgencyProperties(
    agencyId: string,
    page: number = 1,
    limit: number = 12,
    filters: {
        minPrice?: number;
        maxPrice?: number;
        rooms?: number[];
        propertyType?: string[];
    } = {}
): Promise<{
    data: Property[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Генерируем объекты для агентства
        const config: MockPropertyConfig = {
            includeAuthor: true,
            includeTransport: true,
            cardType: 'grid',
        };

        const total = 30 + (parseInt(agencyId.replace('agency_', ''), 10) % 50);
        let properties = generateMockProperties(total, config);

        // Применяем фильтры
        if (filters.minPrice) {
            properties = properties.filter(p => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice) {
            properties = properties.filter(p => p.price <= filters.maxPrice!);
        }
        if (filters.rooms && filters.rooms.length > 0) {
            properties = properties.filter(p => filters.rooms!.includes(p.rooms));
        }

        const offset = (page - 1) * limit;
        const data = properties.slice(offset, offset + limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total: properties.length,
                totalPages: Math.ceil(properties.length / limit),
            },
        };
    }

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.rooms) params.append('rooms', filters.rooms.join(','));

        const response = await fetch(`${API_BASE}/agencies/${agencyId}/properties?${params}`, {
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Failed to get agency properties for ${agencyId}:`, error);
        return {
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
        };
    }
}

/**
 * Получить отзывы агентства
 */
export async function getAgencyReviews(
    agencyId: string,
    page: number = 1,
    limit: number = 10,
    locale: string = 'ru'
): Promise<{
    data: AgencyReview[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    averageRating: number;
}> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const agency = generateMockAgency(
            parseInt(agencyId.replace('agency_', ''), 10) || 0,
            { locale: locale as 'ru' | 'en' | 'es' | 'fr', includeReviews: true }
        );

        const reviews = agency.reviews || [];
        const total = reviews.length;
        const offset = (page - 1) * limit;
        const data = reviews.slice(offset, offset + limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            averageRating: agency.rating,
        };
    }

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            lang: locale,
        });

        const response = await fetch(`${API_BASE}/agencies/${agencyId}/reviews?${params}`, {
            next: { revalidate: 600 }, // ISR: 10 минут
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Failed to get agency reviews for ${agencyId}:`, error);
        return {
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            averageRating: 0,
        };
    }
}

/**
 * Поиск агентств по телефону
 */
export async function searchAgenciesByPhone(
    phone: string,
    locale: string = 'ru'
): Promise<AgencyCardData[]> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Нормализуем телефон
        const normalizedPhone = phone.replace(/\D/g, '');
        
        const allAgencies = generateMockAgencyCards(50, { 
            locale: locale as 'ru' | 'en' | 'es' | 'fr' 
        });

        // В моках просто возвращаем первое агентство, если телефон похож
        if (normalizedPhone.length >= 6) {
            return allAgencies.slice(0, 1);
        }
        
        return [];
    }

    try {
        const response = await fetch(
            `${API_BASE}/agencies/search/phone?phone=${encodeURIComponent(phone)}&lang=${locale}`,
            { next: { revalidate: 300 } }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] Failed to search agencies by phone:', error);
        return [];
    }
}
