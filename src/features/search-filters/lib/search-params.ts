/**
 * Search params configuration — re-exports from parsers.
 *
 * The canonical filter parsers live in ./parsers.ts (nuqs).
 * This file re-exports them and keeps backward-compat helpers.
 */

export { searchParamsConfig } from './parsers';
export { hasActiveFilters, countActiveFilters } from '@/entities/filter/lib/filter-utils';

import type { SearchFilters } from '@/entities/filter/model/types';

/**
 * Создает читабельное описание фильтров
 */
export function getFiltersDescription(filters: SearchFilters): string {
    const parts: string[] = [];

    if (filters.minPrice || filters.maxPrice) {
        const min = filters.minPrice ? `€${filters.minPrice}` : '€0';
        const max = filters.maxPrice ? `€${filters.maxPrice}` : '∞';
        parts.push(`${min} - ${max}`);
    }

    if (filters.rooms && filters.rooms.length > 0) {
        parts.push(`${filters.rooms.length} rooms`);
    }

    if (filters.minArea || filters.maxArea) {
        const min = filters.minArea ? `${filters.minArea}m²` : '0m²';
        const max = filters.maxArea ? `${filters.maxArea}m²` : '∞';
        parts.push(`${min} - ${max}`);
    }

    return parts.join(', ') || 'All properties';
}
