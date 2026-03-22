import type { SearchFilters } from '../model/types';

/**
 * Checks if there are any active filters beyond defaults
 */
export const hasActiveFilters = (filters: SearchFilters): boolean => {
    return !!(
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined ||
        (filters.rooms && filters.rooms.length > 0) ||
        filters.minArea !== undefined ||
        filters.maxArea !== undefined ||
        (filters.categoryIds && filters.categoryIds.length > 0) ||
        (filters.subCategories && filters.subCategories.length > 0) ||
        (filters.adminLevel2 && filters.adminLevel2.length > 0) ||
        (filters.adminLevel4 && filters.adminLevel4.length > 0) ||
        (filters.adminLevel6 && filters.adminLevel6.length > 0) ||
        (filters.adminLevel7 && filters.adminLevel7.length > 0) ||
        (filters.adminLevel8 && filters.adminLevel8.length > 0) ||
        (filters.adminLevel9 && filters.adminLevel9.length > 0) ||
        (filters.adminLevel10 && filters.adminLevel10.length > 0) ||
        (filters.polygonIds && filters.polygonIds.length > 0) ||
        (filters.isochroneIds && filters.isochroneIds.length > 0) ||
        (filters.radiusIds && filters.radiusIds.length > 0) ||
        (filters.markerType && filters.markerType !== 'all')
    );
};

/**
 * Counts number of active filter groups (for badge display)
 */
export const countActiveFilters = (filters: SearchFilters): number => {
    let count = 0;
    if (filters.categoryIds && filters.categoryIds.length > 0) count++;
    if (filters.subCategories && filters.subCategories.length > 0) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.minArea !== undefined || filters.maxArea !== undefined) count++;
    if (filters.rooms && filters.rooms.length > 0) count++;
    if (filters.markerType && filters.markerType !== 'all') count++;
    const hasAdmin =
        (filters.adminLevel2?.length) || (filters.adminLevel4?.length) ||
        (filters.adminLevel6?.length) || (filters.adminLevel7?.length) ||
        (filters.adminLevel8?.length) || (filters.adminLevel9?.length) ||
        (filters.adminLevel10?.length);
    if (hasAdmin) count++;
    if (filters.polygonIds?.length || filters.isochroneIds?.length || filters.radiusIds?.length) count++;
    return count;
};

/**
 * Валидирует значения фильтров
 */
export const validateFilters = (filters: SearchFilters): boolean => {
    // Проверка цены
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        if (filters.minPrice > filters.maxPrice) return false;
    }

    // Проверка площади
    if (filters.minArea !== undefined && filters.maxArea !== undefined) {
        if (filters.minArea > filters.maxArea) return false;
    }

    return true;
};