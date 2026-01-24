'use client';

import { create } from 'zustand';

export type PropertySidebarView = 'map' | 'list';
export type PropertySortBy = 'price' | 'area' | 'createdAt';
export type PropertySortOrder = 'asc' | 'desc';

type PropertySidebarStore = {
    // Текущий режим отображения
    view: PropertySidebarView;
    // Открыт ли сайдбар
    isOpen: boolean;
    // Сортировка
    sortBy: PropertySortBy;
    sortOrder: PropertySortOrder;
    // Пагинация
    page: number;
    // Действия
    setView: (view: PropertySidebarView) => void;
    toggleView: () => void;
    setIsOpen: (isOpen: boolean) => void;
    toggle: () => void;
    setSortBy: (sortBy: PropertySortBy) => void;
    setSortOrder: (sortOrder: PropertySortOrder) => void;
    setPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    resetPage: () => void;
};

export const usePropertySidebarStore = create<PropertySidebarStore>((set) => ({
    view: 'map',
    isOpen: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,

    setView: (view) => set({ view }),
    toggleView: () => set((state) => ({ view: state.view === 'map' ? 'list' : 'map' })),
    setIsOpen: (isOpen) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    setSortBy: (sortBy) => set({ sortBy, page: 1 }),
    setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }),
    setPage: (page) => set({ page }),
    nextPage: () => set((state) => ({ page: state.page + 1 })),
    prevPage: () => set((state) => ({ page: Math.max(1, state.page - 1) })),
    resetPage: () => set({ page: 1 }),
}));
