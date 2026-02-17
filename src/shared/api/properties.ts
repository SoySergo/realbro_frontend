'use client';

import type { SearchFilters } from '@/entities/filter';
import type { PropertyGridCard } from '@/entities/property';
import type { PropertyShortListingDTO } from '@/entities/property/model/api-types';
import { dtosToGridCards } from '@/entities/property/model/converters';
import type { CursorPaginatedResponse, ApiDataResponse } from './types';
import { generateMockGridCardsPage, generateMockGridCardsByIds } from './mocks/properties-mock';
import { FEATURES } from '@/shared/config/features';
import { apiClient } from './lib/api-client';

const API_BASE = '/api/properties';

export interface PropertiesCountResponse {
    count: number;
}

// Legacy пагинация (обратная совместимость)
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

// Параметры для cursor-based запроса к реальному API
export interface PropertiesCursorParams {
    filters: SearchFilters;
    limit?: number;
    cursor?: string;
    sort_by?: 'published_at' | 'price' | 'area' | 'created_at';
    sort_order?: 'asc' | 'desc';
    language?: string;
}

/**
 * Сериализует фильтры в URLSearchParams (legacy формат для моков)
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
 * Сериализует фильтры в query params для реального API (snake_case)
 */
function serializeFiltersForBackend(
    filters: SearchFilters,
    options?: { limit?: number; cursor?: string; sort_by?: string; sort_order?: string; language?: string }
): Record<string, string | number | boolean | undefined> {
    const params: Record<string, string | number | boolean | undefined> = {};

    // Тип сделки
    if (filters.dealType) params['property_types'] = filters.dealType;

    // Категории
    if (filters.categoryIds?.length) params['categories'] = filters.categoryIds.join(',');

    // Цена
    if (filters.minPrice) params['min_price'] = filters.minPrice;
    if (filters.maxPrice) params['max_price'] = filters.maxPrice;

    // Площадь
    if (filters.minArea) params['min_area'] = filters.minArea;
    if (filters.maxArea) params['max_area'] = filters.maxArea;

    // Комнаты
    if (filters.rooms?.length) params['rooms'] = filters.rooms.join(',');

    // Локации (по admin_level → snake_case поля бекенда)
    if (filters.adminLevel2?.length) params['country_ids'] = filters.adminLevel2.join(',');
    if (filters.adminLevel4?.length) params['region_ids'] = filters.adminLevel4.join(',');
    if (filters.adminLevel6?.length) params['province_ids'] = filters.adminLevel6.join(',');
    if (filters.adminLevel7?.length || filters.adminLevel8?.length) {
        const cityIds = [...(filters.adminLevel7 || []), ...(filters.adminLevel8 || [])];
        params['city_ids'] = cityIds.join(',');
    }
    if (filters.adminLevel9?.length) params['district_ids'] = filters.adminLevel9.join(',');
    if (filters.adminLevel10?.length) params['neighborhood_ids'] = filters.adminLevel10.join(',');

    // Геометрия
    if (filters.geometryIds?.length) params['polygon_ids'] = filters.geometryIds.join(',');

    // Пагинация и сортировка
    if (options?.limit) params['limit'] = options.limit;
    if (options?.cursor) params['cursor'] = options.cursor;
    if (options?.sort_by) params['sort_by'] = options.sort_by;
    if (options?.sort_order) params['sort_order'] = options.sort_order;
    if (options?.language) params['language'] = options.language;

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
    // Реальный API
    if (FEATURES.USE_REAL_PROPERTIES) {
        try {
            const params = serializeFiltersForBackend(filters);
            const response = await apiClient.get<ApiDataResponse<{ count: number }>>(
                '/properties/count',
                { params, signal }
            );
            return response.data.count;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') throw error;
            console.error('[API] Failed to get properties count:', error);
            throw error;
        }
    }

    // Мок API (legacy)
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
 * Получить список объектов с cursor-пагинацией (реальный API)
 */
export async function getPropertiesListCursor(
    params: PropertiesCursorParams
): Promise<CursorPaginatedResponse<PropertyShortListingDTO>> {
    const { filters, limit = 20, cursor, sort_by = 'published_at', sort_order = 'desc', language } = params;

    const queryParams = serializeFiltersForBackend(filters, { limit, cursor, sort_by, sort_order, language });
    return apiClient.get<CursorPaginatedResponse<PropertyShortListingDTO>>(
        '/properties/short-listing',
        { params: queryParams }
    );
}

/**
 * Получить список объектов с пагинацией (legacy — для моков)
 */
export async function getPropertiesList(params: PropertiesListParams): Promise<PropertiesListResponse> {
    const { filters, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Реальный API с cursor-пагинацией
    if (FEATURES.USE_REAL_PROPERTIES) {
        const sort_by = sortBy === 'createdAt' ? 'published_at' : sortBy;
        const response = await getPropertiesListCursor({
            filters,
            limit,
            sort_by: sort_by as PropertiesCursorParams['sort_by'],
            sort_order: sortOrder,
        });
        // Конвертируем cursor-ответ в legacy формат для обратной совместимости
        return {
            data: dtosToGridCards(response.data),
            pagination: {
                page: 1,
                limit: response.pagination.limit,
                total: response.pagination.total,
                totalPages: Math.ceil(response.pagination.total / response.pagination.limit),
            },
        };
    }

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
            return generateMockGridCardsPage(page, limit, 500, {
                cardType: 'grid',
                includeAuthor: true,
                includeTransport: true
            });
        }
        throw error;
    }
}

/**
 * Получить объекты по массиву IDs (клик по кластеру/маркеру)
 */
export async function getPropertiesByIds(ids: string[]): Promise<PropertyGridCard[]> {
    // Реальный API
    if (FEATURES.USE_REAL_PROPERTIES) {
        const response = await apiClient.get<CursorPaginatedResponse<PropertyShortListingDTO>>(
            '/properties/short-listing',
            { params: { include_ids: ids.join(',') } }
        );
        return dtosToGridCards(response.data);
    }

    try {
        const response = await fetch('/api/properties/by-ids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] Failed to get properties by ids:', error);
        if (FEATURES.USE_MOCK_PROPERTIES) {
            return generateMockGridCardsByIds(ids, {
                cardType: 'grid',
                includeAuthor: true,
                includeTransport: true,
            });
        }
        throw error;
    }
}

/**
 * Получить объект по slug
 */
export async function getPropertyBySlug(slug: string): Promise<PropertyShortListingDTO> {
    return apiClient.get<PropertyShortListingDTO>(`/properties/by-slug/${slug}`);
}

/**
 * Получить похожие объекты
 */
export async function getSimilarPropertiesApi(
    propertyId: string,
    limit: number = 10
): Promise<CursorPaginatedResponse<PropertyShortListingDTO>> {
    return apiClient.post<CursorPaginatedResponse<PropertyShortListingDTO>>(
        `/properties/${propertyId}/similar`,
        { limit }
    );
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
