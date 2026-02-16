import type { SearchFilters } from '@/entities/filter';
import type { Property, PropertyGridCard } from '@/entities/property';
import type { PropertyShortListingDTO } from '@/entities/property/model/api-types';
import type { CursorPaginatedResponse } from './types';
import { generateMockGridCardsPage, generateMockProperty } from './mocks/properties-mock';
import { FEATURES } from '@/shared/config/features';

const API_BASE = process.env.BACKEND_URL || 'http://localhost:3001/api';
const API_V1_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface PropertiesListResponse {
    data: PropertyGridCard[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PropertiesListParams {
    filters: SearchFilters;
    page?: number;
    limit?: number;
    sortBy?: 'price' | 'area' | 'createdAt' | 'published_at';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Сериализация фильтров в URLSearchParams (legacy)
 */
function serializeFilters(filters: SearchFilters, params: URLSearchParams): void {
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    if (filters.rooms?.length) params.set('rooms', filters.rooms.join(','));
    if (filters.minArea) params.set('minArea', String(filters.minArea));
    if (filters.maxArea) params.set('maxArea', String(filters.maxArea));
    if (filters.categoryIds?.length) params.set('categoryIds', filters.categoryIds.join(','));
    if (filters.markerType && filters.markerType !== 'all') params.set('markerType', filters.markerType);

    // Admin levels for location
    if (filters.adminLevel2?.length) params.set('adminLevel2', filters.adminLevel2.join(','));
    if (filters.adminLevel4?.length) params.set('adminLevel4', filters.adminLevel4.join(','));
    if (filters.adminLevel6?.length) params.set('adminLevel6', filters.adminLevel6.join(','));
    if (filters.adminLevel7?.length) params.set('adminLevel7', filters.adminLevel7.join(','));
    if (filters.adminLevel8?.length) params.set('adminLevel8', filters.adminLevel8.join(','));
    if (filters.adminLevel9?.length) params.set('adminLevel9', filters.adminLevel9.join(','));
    if (filters.adminLevel10?.length) params.set('adminLevel10', filters.adminLevel10.join(','));

    // Geometry for draw/isochrone/radius
    if (filters.geometryIds?.length) params.set('geometryIds', filters.geometryIds.join(','));
}

/**
 * Сериализация фильтров для реального API (snake_case)
 */
function serializeFiltersForBackend(filters: SearchFilters, params: URLSearchParams): void {
    if (filters.dealType) params.set('property_types', filters.dealType);
    if (filters.categoryIds?.length) params.set('categories', filters.categoryIds.join(','));
    if (filters.minPrice) params.set('min_price', String(filters.minPrice));
    if (filters.maxPrice) params.set('max_price', String(filters.maxPrice));
    if (filters.minArea) params.set('min_area', String(filters.minArea));
    if (filters.maxArea) params.set('max_area', String(filters.maxArea));
    if (filters.rooms?.length) params.set('rooms', filters.rooms.join(','));

    // Локации по admin_level
    if (filters.adminLevel2?.length) params.set('country_ids', filters.adminLevel2.join(','));
    if (filters.adminLevel4?.length) params.set('region_ids', filters.adminLevel4.join(','));
    if (filters.adminLevel6?.length) params.set('province_ids', filters.adminLevel6.join(','));
    const cityIds = [...(filters.adminLevel7 || []), ...(filters.adminLevel8 || [])];
    if (cityIds.length) params.set('city_ids', cityIds.join(','));
    if (filters.adminLevel9?.length) params.set('district_ids', filters.adminLevel9.join(','));
    if (filters.adminLevel10?.length) params.set('neighborhood_ids', filters.adminLevel10.join(','));

    if (filters.geometryIds?.length) params.set('polygon_ids', filters.geometryIds.join(','));
}

/**
 * Серверная функция для получения списка объектов (для ISR/SSR)
 * Используется в Server Components
 * SSR: увеличенный limit=60 для SEO
 */
export async function getPropertiesListServer(
    params: PropertiesListParams
): Promise<PropertiesListResponse> {
    const { filters, page = 1, limit = 24, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Return mock immediately if mock mode is enabled
    if (FEATURES.USE_MOCK_PROPERTIES) {
        return generateMockGridCardsPage(page, limit, 500, {
            cardType: 'grid',
            includeAuthor: true,
            includeTransport: true
        });
    }

    // Реальный API с cursor-пагинацией
    if (FEATURES.USE_REAL_PROPERTIES) {
        try {
            const searchParams = new URLSearchParams();
            // SSR: увеличенный limit для SEO
            searchParams.set('limit', String(Math.max(limit, 60)));
            const sort_by = sortBy === 'createdAt' ? 'published_at' : sortBy;
            searchParams.set('sort_by', sort_by);
            searchParams.set('sort_order', sortOrder);
            serializeFiltersForBackend(filters, searchParams);

            const response = await fetch(
                `${API_V1_BASE}/api/v1/properties/short-listing?${searchParams.toString()}`,
                { next: { revalidate: 60 } }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const cursorResponse: CursorPaginatedResponse<PropertyShortListingDTO> = await response.json();
            return {
                data: cursorResponse.data as unknown as PropertyGridCard[],
                pagination: {
                    page: 1,
                    limit: cursorResponse.pagination.limit,
                    total: cursorResponse.pagination.total,
                    totalPages: Math.ceil(cursorResponse.pagination.total / cursorResponse.pagination.limit),
                },
            };
        } catch (error) {
            console.error('[API Server] Failed to get properties list from real API:', error);
            throw error;
        }
    }

    try {
        const searchParams = new URLSearchParams();

        // Pagination
        searchParams.set('page', String(page));
        searchParams.set('limit', String(limit));
        searchParams.set('sortBy', sortBy);
        searchParams.set('sortOrder', sortOrder);

        // Serialize filters
        serializeFilters(filters, searchParams);

        const response = await fetch(`${API_BASE}/properties?${searchParams.toString()}`, {
            next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API Server] Failed to get properties list:', error);
        throw error;
    }
}

/**
 * Серверная функция для получения количества объектов
 */
export async function getPropertiesCountServer(filters: SearchFilters): Promise<number> {
    // Return mock immediately if mock mode is enabled
    if (FEATURES.USE_MOCK_PROPERTIES) {
        return 500;
    }

    // Реальный API
    if (FEATURES.USE_REAL_PROPERTIES) {
        try {
            const params = new URLSearchParams();
            serializeFiltersForBackend(filters, params);

            const response = await fetch(`${API_V1_BASE}/api/v1/properties/count?${params.toString()}`, {
                next: { revalidate: 60 },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data?.count ?? data.count;
        } catch (error) {
            console.error('[API Server] Failed to get properties count from real API:', error);
            throw error;
        }
    }

    try {
        const params = new URLSearchParams();
        serializeFilters(filters, params);

        const response = await fetch(`${API_BASE}/properties/count?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.count;
    } catch (error) {
        console.error('[API Server] Failed to get properties count:', error);
        throw error;
    }
}

/**
 * Получить объект недвижимости по ID (для ISR/SSR)
 */
export async function getPropertyByIdServer(id: string): Promise<Property | null> {
    // Return mock immediately if mock mode is enabled
    if (FEATURES.USE_MOCK_PROPERTIES) {
        const numericId = parseInt(id.replace(/\D/g, '')) || 0;
        const mockProperty = generateMockProperty(numericId, { cardType: 'detail' });
        mockProperty.id = id;
        return mockProperty;
    }

    try {
        const response = await fetch(`${API_BASE}/properties/${id}`, {
            next: { revalidate: 21600 }, // ISR: revalidate every 6 hours
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API Server] Failed to get property ${id}:`, error);
        return null;
    }
}

/**
 * Парсинг фильтров из URL search params
 */
export function parseFiltersFromSearchParams(
    searchParams: Record<string, string | string[] | undefined>
): SearchFilters {
    const filters: SearchFilters = {};

    // Parse price
    if (searchParams.minPrice) {
        filters.minPrice = Number(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
        filters.maxPrice = Number(searchParams.maxPrice);
    }

    // Parse rooms
    if (searchParams.rooms) {
        const roomsStr = Array.isArray(searchParams.rooms) ? searchParams.rooms[0] : searchParams.rooms;
        filters.rooms = roomsStr.split(',').map(Number);
    }

    // Parse area
    if (searchParams.minArea) {
        filters.minArea = Number(searchParams.minArea);
    }
    if (searchParams.maxArea) {
        filters.maxArea = Number(searchParams.maxArea);
    }

    // Parse categories
    if (searchParams.categoryIds) {
        const catStr = Array.isArray(searchParams.categoryIds) ? searchParams.categoryIds[0] : searchParams.categoryIds;
        filters.categoryIds = catStr.split(',').map(Number);
    }

    // Parse marker type
    if (searchParams.markerType) {
        filters.markerType = searchParams.markerType as SearchFilters['markerType'];
    }

    // Parse admin levels
    const adminLevels = [2, 4, 6, 7, 8, 9, 10] as const;
    for (const level of adminLevels) {
        const key = `adminLevel${level}` as keyof SearchFilters;
        if (searchParams[key]) {
            const val = Array.isArray(searchParams[key]) ? searchParams[key][0] : searchParams[key];
            (filters as any)[key] = val?.split(',').map(Number);
        }
    }

    // Parse geometry
    if (searchParams.geometryIds) {
        const geoStr = Array.isArray(searchParams.geometryIds) ? searchParams.geometryIds[0] : searchParams.geometryIds;
        filters.geometryIds = geoStr.split(',').map(Number);
    }

    // Sort
    if (searchParams.sort) {
        filters.sort = searchParams.sort as SearchFilters['sort'];
    }
    if (searchParams.sortOrder) {
        filters.sortOrder = searchParams.sortOrder as SearchFilters['sortOrder'];
    }

    return filters;
}
