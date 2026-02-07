import type { SearchFilters } from '@/entities/filter';
import type { Property } from '@/entities/property';
import { generateMockPropertiesPage, generateMockProperty } from './mocks/properties-mock';
import { FEATURES } from '@/shared/config/features';

const API_BASE = process.env.BACKEND_URL || 'http://localhost:3001/api';

export interface PropertiesListResponse {
    data: Property[];
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
    sortBy?: 'price' | 'area' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Сериализация фильтров в URLSearchParams
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
 * Серверная функция для получения списка объектов (для ISR/SSR)
 * Используется в Server Components
 */
export async function getPropertiesListServer(
    params: PropertiesListParams
): Promise<PropertiesListResponse> {
    const { filters, page = 1, limit = 24, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Return mock immediately if mock mode is enabled
    if (FEATURES.USE_MOCK_PROPERTIES) {
        return generateMockPropertiesPage(page, limit, 500, {
            cardType: 'grid',
            includeAuthor: true,
            includeTransport: true
        });
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
