'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { AgencyFilters } from '@/entities/agency';

type AgencyFilterStore = {
    filters: AgencyFilters;
    setFilters: (filters: Partial<AgencyFilters>) => void;
    resetFilters: () => void;
    clearFilter: (key: keyof AgencyFilters) => void;
    filtersCount: number;
};

const initialFilters: AgencyFilters = {};

function countActiveFilters(filters: AgencyFilters): number {
    return (
        (filters.query ? 1 : 0) +
        (filters.phone ? 1 : 0) +
        (filters.languages?.length ? 1 : 0) +
        (filters.propertyTypes?.length ? 1 : 0) +
        (filters.minRating ? 1 : 0) +
        (filters.isVerified ? 1 : 0)
    );
}

export const useAgencyFilterStore = create<AgencyFilterStore>()((set, get) => ({
    filters: initialFilters,
    filtersCount: 0,

    setFilters: (partial) => {
        set((state) => {
            const newFilters = { ...state.filters, ...partial };
            return {
                filters: newFilters,
                filtersCount: countActiveFilters(newFilters),
            };
        });
    },

    resetFilters: () => {
        set({ filters: initialFilters, filtersCount: 0 });
    },

    clearFilter: (key) => {
        set((state) => {
            const newFilters = { ...state.filters };
            delete newFilters[key];
            return {
                filters: newFilters,
                filtersCount: countActiveFilters(newFilters),
            };
        });
    },
}));

export function useAgencyFilters() {
    return useAgencyFilterStore(
        useShallow((state) => ({
            filters: state.filters,
            filtersCount: state.filtersCount,
            setFilters: state.setFilters,
            resetFilters: state.resetFilters,
            clearFilter: state.clearFilter,
        }))
    );
}
