'use client';

import { useFilterStore } from '@/widgets/search-filters-bar/model/store';
import type { SearchFilters } from '@/entities/filter/model/types';

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

/**
 * Определяет режим локации из стора или URL-фильтров.
 * Используется при переключении режима локации в тулбарах.
 */
export function resolveLocationMode(filters: SearchFilters): LocationFilterMode {
    const { locationFilter } = useFilterStore.getState();
    const modeFromStore = locationFilter?.mode;
    let modeFromUrl: LocationFilterMode | undefined;
    if (filters.polygonIds?.length) modeFromUrl = 'draw';
    else if (filters.isochroneIds?.length) modeFromUrl = 'isochrone';
    else if (filters.radiusIds?.length) modeFromUrl = 'radius';
    return modeFromStore ?? modeFromUrl ?? 'search';
}
