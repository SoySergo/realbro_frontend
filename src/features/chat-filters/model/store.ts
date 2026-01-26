'use client';

import { create } from 'zustand';
import type { DayFilter } from '@/entities/chat';

interface ChatFilterStore {
    dayFilter: DayFilter;
    selectedFilterIds: string[];
    showAllFilters: boolean;

    setDayFilter: (filter: DayFilter) => void;
    toggleFilterId: (filterId: string) => void;
    setShowAllFilters: (show: boolean) => void;
    resetFilters: () => void;
}

export const useChatFilterStore = create<ChatFilterStore>()((set) => ({
    dayFilter: 'all',
    selectedFilterIds: [],
    showAllFilters: true,

    setDayFilter: (dayFilter) => set({ dayFilter }),

    toggleFilterId: (filterId) =>
        set((state) => {
            const ids = state.selectedFilterIds;
            const exists = ids.includes(filterId);
            return {
                selectedFilterIds: exists
                    ? ids.filter((id) => id !== filterId)
                    : [...ids, filterId],
                showAllFilters: false,
            };
        }),

    setShowAllFilters: (showAllFilters) =>
        set({ showAllFilters, selectedFilterIds: [] }),

    resetFilters: () =>
        set({
            dayFilter: 'all',
            selectedFilterIds: [],
            showAllFilters: true,
        }),
}));
