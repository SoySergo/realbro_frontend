'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchQuery, AiAgentStatus } from './types';
import { FEATURES } from '@/shared/config/features';

// ID дефолтной вкладки поиска — не удаляется
export const DEFAULT_SEARCH_QUERY_ID = 'default_search';

// Таймер для debounced сохранения на бекенд
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 3000;

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
    saveQuery: (id: string, title: string) => void;

    // Сохранение нового фильтра с переносом гостевой геометрии
    saveNewTabWithGeometry: (title: string, filters: Record<string, unknown>) => Promise<string | null>;

    // Синхронизация с фильтрами
    syncFiltersToTab: (tabId: string, filters: Record<string, unknown>) => void;

    // ИИ-агент
    setAiAgent: (queryId: string, status: AiAgentStatus) => void;

    // Селекторы
    tabsCount: () => number;
};

// Генерация ID
const generateId = () => `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Дефолтная вкладка поиска (всегда первая, не удаляется)
const createDefaultSearchQuery = (): SearchQuery => ({
    id: DEFAULT_SEARCH_QUERY_ID,
    title: '',
    queryType: 'search',
    filters: {},
    isUnsaved: false,
    is_default: true,
    createdAt: new Date(),
    lastUpdated: new Date(),
});

/**
 * Debounced сохранение таба на бекенд
 */
function debouncedSaveToBackend(tabId: string, updates: Partial<SearchQuery>) {
    if (!FEATURES.USE_REAL_TABS) return;
    if (tabId === DEFAULT_SEARCH_QUERY_ID) return;

    if (saveDebounceTimer) {
        clearTimeout(saveDebounceTimer);
    }

    saveDebounceTimer = setTimeout(async () => {
        try {
            const { updateSearchQuery } = await import('@/shared/api/search-queries');
            await updateSearchQuery(tabId, {
                title: updates.title,
                filters: updates.filters,
            });
            console.log('[SYNC] Tab saved to backend:', tabId);
        } catch (error) {
            console.error('[SYNC] Failed to save tab to backend:', { tabId, error });
        }
    }, SAVE_DEBOUNCE_MS);
}

export const useSidebarStore = create<SidebarStore>()(
    persist(
        (set, get) => ({
            // Начальное состояние
            isExpanded: false,
            queries: [],
            activeQueryId: null,

            // Методы раскрытия
            setExpanded: (expanded) => set({ isExpanded: expanded }),
            toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

            // Методы работы с запросами
            addQuery: (query) => {
                const newQuery: SearchQuery = {
                    ...query,
                    id: generateId(),
                    queryType: query.queryType ?? 'search',
                    isUnsaved: query.isUnsaved ?? true,
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                };
                set((state) => ({
                    queries: [newQuery, ...state.queries],
                    activeQueryId: newQuery.id,
                }));
            },

            removeQuery: (id) => {
                // Дефолтная вкладка поиска не удаляется
                if (id === DEFAULT_SEARCH_QUERY_ID) return;

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

            // Сохраняет вкладку с названием (переводит isUnsaved в false)
            saveQuery: (id, title) => {
                set((state) => ({
                    queries: state.queries.map((q) =>
                        q.id === id
                            ? { ...q, title, isUnsaved: false, lastUpdated: new Date() }
                            : q
                    ),
                }));

                // Сохраняем на бекенд
                const query = get().queries.find(q => q.id === id);
                if (query) {
                    debouncedSaveToBackend(id, { title, filters: query.filters });
                }
            },

            // Сохранение нового фильтра с переносом гостевой геометрии
            saveNewTabWithGeometry: async (title, filters) => {
                if (!FEATURES.USE_REAL_TABS) {
                    // В режиме моков — создаём локальную вкладку
                    const newQuery: SearchQuery = {
                        id: generateId(),
                        title,
                        filters: filters as SearchQuery['filters'],
                        queryType: 'search',
                        isUnsaved: false,
                        createdAt: new Date(),
                        lastUpdated: new Date(),
                    };
                    set((state) => ({
                        queries: [newQuery, ...state.queries],
                        activeQueryId: newQuery.id,
                    }));
                    return newQuery.id;
                }

                try {
                    const { createSearchQuery } = await import('@/shared/api/search-queries');

                    // geometry_source = 'guest' потому что при создании новой вкладки
                    // геометрия ещё в гостевом endpoint, бекенд перенесёт по polygon_ids
                    const filtersWithSource = {
                        ...filters,
                        geometry_source: 'guest',
                    };

                    const result = await createSearchQuery({
                        title,
                        filters: filtersWithSource as SearchQuery['filters'],
                    });

                    // Добавляем вкладку локально с ID от бекенда
                    const newQuery: SearchQuery = {
                        id: result.id,
                        title: result.title,
                        filters: result.filters as SearchQuery['filters'],
                        queryType: 'search',
                        isUnsaved: false,
                        createdAt: new Date(),
                        lastUpdated: new Date(),
                    };
                    set((state) => ({
                        queries: [newQuery, ...state.queries],
                        activeQueryId: newQuery.id,
                    }));

                    console.log('[SYNC] New tab created with geometry transfer:', result.id);
                    return result.id;
                } catch (error) {
                    console.error('[SYNC] Failed to create tab with geometry:', error);
                    return null;
                }
            },

            // Синхронизация фильтров в таб (вызывается из filterStore)
            syncFiltersToTab: (tabId, filters) => {
                set((state) => ({
                    queries: state.queries.map((q) =>
                        q.id === tabId
                            ? { ...q, filters: filters as SearchQuery['filters'], lastUpdated: new Date() }
                            : q
                    ),
                }));

                // Debounced сохранение на бекенд
                debouncedSaveToBackend(tabId, { filters: filters as SearchQuery['filters'] });
            },

            // Обновление статуса ИИ-агента на вкладке
            setAiAgent: (queryId, status) => {
                set((state) => ({
                    queries: state.queries.map((q) =>
                        q.id === queryId
                            ? {
                                ...q,
                                hasAiAgent: true,
                                aiAgentStatus: status,
                                lastUpdated: new Date(),
                            }
                            : q
                    ),
                }));
            },

            // Количество вкладок
            tabsCount: () => get().queries.length,
        }),
        {
            name: 'sidebar-storage',
            // Не сохраняем isExpanded - он должен быть всегда collapsed при загрузке
            partialize: (state) => ({
                queries: state.queries,
                activeQueryId: state.activeQueryId,
            }),
            // Восстановление после rehydrate — убеждаемся что activeQueryId валиден
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                // Удаляем legacy дефолтную вкладку если осталась в storage
                state.queries = state.queries.filter(q => q.id !== DEFAULT_SEARCH_QUERY_ID);
                if (state.activeQueryId === DEFAULT_SEARCH_QUERY_ID) {
                    state.activeQueryId = state.queries.length > 0 ? state.queries[0].id : null;
                }
            },
        }
    )
);
