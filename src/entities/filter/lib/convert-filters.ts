import type { SearchFilters } from '../model/types';
import { adminLevelToLocationField } from '@/entities/boundary';

/**
 * Converts SearchFilters (URL state) → URLSearchParams for backend API calls and MVT tile URLs.
 * Maps frontend field names → backend snake_case field names.
 */
export function filtersToBackendParams(filters: SearchFilters): URLSearchParams {
    const params = new URLSearchParams();

    // Categories
    if (filters.categoryIds?.length) params.set('categories', filters.categoryIds.join(','));
    if (filters.subCategories?.length) params.set('sub_categories', filters.subCategories.join(','));

    // Admin levels → backend location fields (using shared mapping)
    const adminLevels: [string, number[], number][] = [
        ['adminLevel2', filters.adminLevel2 ?? [], 2],
        ['adminLevel4', filters.adminLevel4 ?? [], 4],
        ['adminLevel6', filters.adminLevel6 ?? [], 6],
        ['adminLevel7', filters.adminLevel7 ?? [], 7],
        ['adminLevel8', filters.adminLevel8 ?? [], 8],
        ['adminLevel9', filters.adminLevel9 ?? [], 9],
        ['adminLevel10', filters.adminLevel10 ?? [], 10],
    ];

    const locationBuckets: Record<string, number[]> = {};
    for (const [, values, level] of adminLevels) {
        if (values.length > 0) {
            const backendField = adminLevelToLocationField(level);
            if (locationBuckets[backendField]) {
                locationBuckets[backendField].push(...values);
            } else {
                locationBuckets[backendField] = [...values];
            }
        }
    }
    for (const [field, ids] of Object.entries(locationBuckets)) {
        params.set(field, ids.join(','));
    }

    // Price
    if (filters.minPrice !== undefined) params.set('min_price', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('max_price', String(filters.maxPrice));

    // Area
    if (filters.minArea !== undefined) params.set('min_area', String(filters.minArea));
    if (filters.maxArea !== undefined) params.set('max_area', String(filters.maxArea));

    // Rooms
    if (filters.rooms?.length) params.set('rooms', filters.rooms.join(','));

    // Geometries — all UUID types merge into polygon_ids for backend
    const allGeometryIds = [
        ...(filters.polygonIds ?? []),
        ...(filters.isochroneIds ?? []),
        ...(filters.radiusIds ?? []),
    ];
    if (allGeometryIds.length > 0) {
        params.set('polygon_ids', allGeometryIds.join(','));
        if (filters.geoSrc) params.set('geometry_source', filters.geoSrc);
    }

    // Bounding box
    if (filters.bbox) params.set('bbox', filters.bbox.join(','));

    // Marker type → exclude_marker_types (backend inverts the logic)
    if (filters.markerType && filters.markerType !== 'all') {
        params.set('marker_type', filters.markerType);
    }

    // Sort
    if (filters.sort) {
        const sortBy = filters.sort === 'createdAt' ? 'published_at' : filters.sort;
        params.set('sort_by', sortBy);
    }
    if (filters.order) params.set('sort_order', filters.order);

    return params;
}

/**
 * Convenience: returns query string for tile URLs.
 * Excludes bbox — tiles are already spatially filtered by z/x/y.
 */
export function filtersToQueryString(filters: SearchFilters): string {
    const params = filtersToBackendParams(filters);
    params.delete('bbox');
    return params.toString();
}

