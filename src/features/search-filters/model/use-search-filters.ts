'use client';

import { useFilters } from './use-filters';

/**
 * @deprecated Use useFilters() directly from '@/features/search-filters/model/use-filters'
 * 
 * Backward-compatible wrapper that delegates to the new nuqs-based useFilters hook.
 */
export function useSearchFilters() {
    return useFilters();
}
