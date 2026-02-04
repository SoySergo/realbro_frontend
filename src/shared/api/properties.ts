'use client';

import type { SearchFilters } from '@/entities/filter';
import type { Property } from '@/entities/property';
import { generateMockPropertiesPage } from './mocks/properties-mock';
import { FEATURES } from '@/shared/config/features';

const API_BASE = '/api/properties';

export interface PropertiesCountResponse {
    count: number;
}

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
 * Сериализует фильтры в URLSearchParams
 */
function serializeFiltersToParams(filters: SearchFilters): URLSearchParams {
    const params = new URLSearchParams();

    // Serialize filters to query params
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

    return params;
}

/**
 * Получить количество объектов по фильтрам
 * @param filters - Фильтры для поиска
 * @param signal - AbortSignal для отмены запроса
 */
export async function getPropertiesCount(
    filters: SearchFilters,
    signal?: AbortSignal
): Promise<number> {
    try {
        const params = serializeFiltersToParams(filters);

        const response = await fetch(`${API_BASE}/count?${params.toString()}`, {
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PropertiesCountResponse = await response.json();
        return data.count;
    } catch (error) {
        // Игнорируем ошибки отмены
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        console.error('[API] Failed to get properties count:', error);
        // Return mock count in development
        if (FEATURES.USE_MOCK_PROPERTIES) {
            return 500; // Константный mock для стабильности
        }
        throw error;
    }
}

/**
 * Получить список объектов с пагинацией
 */
export async function getPropertiesList(params: PropertiesListParams): Promise<PropertiesListResponse> {
    const { filters, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    try {
        const searchParams = new URLSearchParams();

        // Pagination
        searchParams.set('page', String(page));
        searchParams.set('limit', String(limit));
        searchParams.set('sortBy', sortBy);
        searchParams.set('sortOrder', sortOrder);

        // Serialize filters
        if (filters.minPrice) searchParams.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice) searchParams.set('maxPrice', String(filters.maxPrice));
        if (filters.rooms?.length) searchParams.set('rooms', filters.rooms.join(','));
        if (filters.minArea) searchParams.set('minArea', String(filters.minArea));
        if (filters.maxArea) searchParams.set('maxArea', String(filters.maxArea));
        if (filters.categoryIds?.length) searchParams.set('categoryIds', filters.categoryIds.join(','));
        if (filters.markerType && filters.markerType !== 'all') searchParams.set('markerType', filters.markerType);

        // Admin levels
        if (filters.adminLevel2?.length) searchParams.set('adminLevel2', filters.adminLevel2.join(','));
        if (filters.adminLevel4?.length) searchParams.set('adminLevel4', filters.adminLevel4.join(','));
        if (filters.adminLevel6?.length) searchParams.set('adminLevel6', filters.adminLevel6.join(','));
        if (filters.adminLevel7?.length) searchParams.set('adminLevel7', filters.adminLevel7.join(','));
        if (filters.adminLevel8?.length) searchParams.set('adminLevel8', filters.adminLevel8.join(','));
        if (filters.adminLevel9?.length) searchParams.set('adminLevel9', filters.adminLevel9.join(','));
        if (filters.adminLevel10?.length) searchParams.set('adminLevel10', filters.adminLevel10.join(','));

        // Geometry
        if (filters.geometryIds?.length) searchParams.set('geometryIds', filters.geometryIds.join(','));

        const response = await fetch(`${API_BASE}?${searchParams.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] Failed to get properties list:', error);
        // Return mock data in development
        if (FEATURES.USE_MOCK_PROPERTIES) {
            return generateMockPropertiesPage(page, limit, 500, {
                cardType: 'grid',
                includeAuthor: true,
                includeTransport: true
            });
        }
        throw error;
    }
}

/**
 * Сохранить геометрию (polygon/isochrone/radius) на бекенд
 */
export async function saveGeometry(geometry: {
    type: 'polygon' | 'isochrone' | 'radius';
    coordinates: number[][][] | { center: [number, number]; radius: number };
    metadata?: Record<string, unknown>;
}): Promise<{ id: number }> {
    try {
        const response = await fetch(`/api/geometries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(geometry),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] Failed to save geometry:', error);
        // Return mock ID for development
        return { id: Date.now() };
    }
}
