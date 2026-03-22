'use client';

import { useFilterStore } from '@/widgets/search-filters-bar/model/store';

export type LocationFilterMode = 'search' | 'draw' | 'isochrone' | 'radius';

/**
 * Re-exports location mode selectors from the main filter store.
 * This keeps location mode state centralized in one place so all
 * components (both new useFilters()-based and legacy store-based)
 * share the same activeLocationMode.
 */
export function useActiveLocationMode() {
    return useFilterStore((s) => s.activeLocationMode);
}

export function useSetLocationMode() {
    return useFilterStore((s) => s.setLocationMode);
}
