'use client';

import type { SearchFilters } from '@/entities/filter';
import type { PropertyGridCard } from '@/entities/property';
import type { PropertyShortListingDTO } from '@/entities/property/model/api-types';
import { dtosToGridCards } from '@/entities/property/model/converters';
import { filtersToBackendParams } from '@/entities/filter/lib/convert-filters';
import type { CursorPaginatedResponse, ApiDataResponse } from './types';
import { generateMockGridCardsPage, generateMockGridCardsByIds } from './mocks/properties-mock';
import { FEATURES } from '@/shared/config/features';
import { apiClient } from './lib/api-client';

const API_BASE = '/api/properties';

export interface PropertiesCountResponse {
    count: number;
}

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
    language?: string;
}

export interface PropertiesCursorParams {
    filters: SearchFilters;
    limit?: number;
    cursor?: string;
    sort_by?: 'published_at' | 'price' | 'area' | 'created_at';
    sort_order?: 'asc' | 'desc';
    language?: string;
}

/**
 * Convert SearchFilters → backend query params (Record format for apiClient)
 */
function filtersToRecord(
    filters: SearchFilters,
    options?: { limit?: number; cursor?: string; sort_by?: string; sort_order?: string; language?: string },
): Record<string, string | number | boolean | undefined> {
    const backendParams = filtersToBackendParams(filters);
    const record: Record<string, string | number | boolean | undefined> = {};
    backendParams.forEach((value, key) => {
        record[key] = value;
    });
    if (options?.limit) record['limit'] = options.limit;
    if (options?.cursor) record['cursor'] = options.cursor;
    if (options?.sort_by) record['sort_by'] = options.sort_by;
    if (options?.sort_order) record['sort_order'] = options.sort_order;
    if (options?.language) record['language'] = options.language;
    return record;
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
    if (FEATURES.USE_REAL_PROPERTIES) {
        try {
            const params = filtersToRecord(filters);
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

    try {
        const params = filtersToBackendParams(filters);
        const response = await fetch(`${API_BASE}/count?${params.toString()}`, { signal });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: PropertiesCountResponse = await response.json();
        return data.count;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') throw error;
        console.error('[API] Failed to get properties count:', error);
        if (FEATURES.USE_MOCK_PROPERTIES) return 500;
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
    const queryParams = filtersToRecord(filters, { limit, cursor, sort_by, sort_order, language });
    return apiClient.get<CursorPaginatedResponse<PropertyShortListingDTO>>(
        '/properties/short-listing',
        { params: queryParams }
    );
}

/**
 * Получить список объектов с пагинацией (legacy — для моков)
 */
export async function getPropertiesList(params: PropertiesListParams): Promise<PropertiesListResponse> {
    const { filters, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', language } = params;

    // Реальный API с cursor-пагинацией
    if (FEATURES.USE_REAL_PROPERTIES) {
        const sort_by = sortBy === 'createdAt' ? 'published_at' : sortBy;
        const response = await getPropertiesListCursor({
            filters,
            limit,
            sort_by: sort_by as PropertiesCursorParams['sort_by'],
            sort_order: sortOrder,
            language,
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
        const searchParams = filtersToBackendParams(filters);
        searchParams.set('page', String(page));
        searchParams.set('limit', String(limit));
        searchParams.set('sortBy', sortBy);
        searchParams.set('sortOrder', sortOrder);

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
export async function getPropertiesByIds(ids: string[], language?: string): Promise<PropertyGridCard[]> {
    // Реальный API
    if (FEATURES.USE_REAL_PROPERTIES) {
        const params: Record<string, any> = { include_ids: ids.join(',') };
        if (language) params.language = language;
        
        const response = await apiClient.get<CursorPaginatedResponse<PropertyShortListingDTO>>(
            '/properties/short-listing',
            { params }
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

/**\n * Получить объект по slug\n * Backend: GET /api/v1/properties/by-slug/{slug} → { data: PropertyDetailsDTO }\n */
export async function getPropertyBySlug(slug: string): Promise<PropertyShortListingDTO> {
    const response = await apiClient.get<ApiDataResponse<PropertyShortListingDTO>>(`/properties/by-slug/${slug}`);
    return response.data;
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
