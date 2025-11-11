'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchQuery, SidebarVariant } from '@/types/sidebar';

type SidebarStore = {
    // Состояние раскрытия
    isExpanded: boolean;
    setExpanded: (expanded: boolean) => void;
    toggleExpanded: () => void;

    // Поисковые запросы
    queries: SearchQuery[];
    activeQueryId: string | null;

    // Действия с запросами
    addQuery: (query: Omit<SearchQuery, 'id' | 'createdAt' | 'lastUpdated'>) => void;
    removeQuery: (id: string) => void;
    setActiveQuery: (id: string | null) => void;
    updateQuery: (id: string, updates: Partial<SearchQuery>) => void;

    // Вариант отображения
    variant: SidebarVariant;
    setVariant: (variant: SidebarVariant) => void;
};

// Генерация ID
const generateId = () => `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSidebarStore = create<SidebarStore>()(
    persist(
        (set, get) => ({
            // Начальное состояние
            isExpanded: false,
            queries: [],
            activeQueryId: null,
            variant: 'minimal',

            // Методы раскрытия
            setExpanded: (expanded) => set({ isExpanded: expanded }),
            toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

            // Методы работы с запросами
            addQuery: (query) => {
                const newQuery: SearchQuery = {
                    ...query,
                    id: generateId(),
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                };
                set((state) => ({
                    queries: [newQuery, ...state.queries],
                    activeQueryId: newQuery.id,
                }));
            },

            removeQuery: (id) => {
                const state = get();
                const newQueries = state.queries.filter((q) => q.id !== id);

                // Если удаляем активный, выбираем предыдущий или null
                let newActiveId = state.activeQueryId;
                if (state.activeQueryId === id) {
                    const currentIndex = state.queries.findIndex((q) => q.id === id);
                    if (newQueries.length > 0) {
                        const newIndex = Math.max(0, currentIndex - 1);
                        newActiveId = newQueries[newIndex]?.id || null;
                    } else {
                        newActiveId = null;
                    }
                }

                set({ queries: newQueries, activeQueryId: newActiveId });
            },

            setActiveQuery: (id) => set({ activeQueryId: id }),

            updateQuery: (id, updates) => {
                set((state) => ({
                    queries: state.queries.map((q) =>
                        q.id === id
                            ? { ...q, ...updates, lastUpdated: new Date() }
                            : q
                    ),
                }));
            },

            setVariant: (variant) => set({ variant }),
        }),
        {
            name: 'sidebar-storage',
            // Не сохраняем isExpanded - он должен быть всегда collapsed при загрузке
            partialize: (state) => ({
                queries: state.queries,
                activeQueryId: state.activeQueryId,
                variant: state.variant,
            }),
        }
    )
);
