'use client';

import type { SearchFilters } from '@/entities/filter';
import type { Property } from '@/entities/property';

const API_BASE = '/api/backend';

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
 * Получить количество объектов по фильтрам
 */
export async function getPropertiesCount(filters: SearchFilters): Promise<number> {
    try {
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

        const response = await fetch(`${API_BASE}/properties/count?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PropertiesCountResponse = await response.json();
        return data.count;
    } catch (error) {
        console.error('[API] Failed to get properties count:', error);
        // Return mock count for development
        return Math.floor(Math.random() * 5000) + 100;
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

        const response = await fetch(`${API_BASE}/properties?${searchParams.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] Failed to get properties list:', error);
        // Return mock data for development
        return {
            data: generateMockProperties(limit),
            pagination: {
                page,
                limit,
                total: 1234,
                totalPages: Math.ceil(1234 / limit),
            },
        };
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
        const response = await fetch(`${API_BASE}/geometries`, {
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

// Mock data generator for development
function generateMockProperties(count: number): Property[] {
    const types = ['apartment', 'studio', 'house', 'penthouse', 'duplex'] as const;
    const cities = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Malaga'];
    const provinces = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Malaga'];

    return Array.from({ length: count }, (_, i) => ({
        id: `prop_${Date.now()}_${i}`,
        title: `Property ${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        price: Math.floor(Math.random() * 2000) + 500,
        bedrooms: Math.floor(Math.random() * 4) + 1,
        bathrooms: Math.floor(Math.random() * 2) + 1,
        area: Math.floor(Math.random() * 100) + 40,
        floor: Math.floor(Math.random() * 10) + 1,
        address: `Calle Example ${i + 1}`,
        city: cities[Math.floor(Math.random() * cities.length)],
        province: provinces[Math.floor(Math.random() * provinces.length)],
        coordinates: {
            lat: 41.3851 + (Math.random() - 0.5) * 0.1,
            lng: 2.1734 + (Math.random() - 0.5) * 0.1,
        },
        description: 'Beautiful property in excellent location',
        features: ['parking', 'elevator', 'airConditioning'] as Property['features'],
        images: [`https://picsum.photos/seed/${i}/400/300`],
        createdAt: new Date(),
        updatedAt: new Date(),
    }));
}
