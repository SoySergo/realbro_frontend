'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchFilters, DrawPolygon, LocationFilter } from '@/types/filter';

type FilterStore = {
    // Фильтры текущей активной вкладки
    currentFilters: SearchFilters;

    // Сохраненные полигоны (для всех вкладок)
    savedPolygons: DrawPolygon[];

    // Фильтр локации (отдельно, т.к. сложный)
    locationFilter: LocationFilter | null;

    // Активный режим локации (для показа панели деталей)
    activeLocationMode: LocationFilter['mode'] | null;

    // Действия с фильтрами
    setFilters: (filters: Partial<SearchFilters>) => void;
    resetFilters: () => void;
    clearFilter: (key: keyof SearchFilters) => void;

    // Действия с полигонами
    addPolygon: (polygon: Omit<DrawPolygon, 'id' | 'createdAt'>) => DrawPolygon;
    removePolygon: (id: string) => void;
    updatePolygon: (id: string, updates: Partial<DrawPolygon>) => void;
    clearPolygons: () => void;

    // Действия с локацией
    setLocationFilter: (location: LocationFilter | null) => void;
    setLocationMode: (mode: LocationFilter['mode'] | null) => void;

    // Синхронизация с вкладками (из sidebarStore)
    syncWithQuery: (queryId: string) => void;
    loadFiltersFromQuery: (filters: SearchFilters) => void;
};

// Генерация ID для полигона
const generatePolygonId = () => `polygon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Начальное состояние фильтров
const initialFilters: SearchFilters = {
    markerType: 'all',
    sortOrder: 'desc',
};

export const useFilterStore = create<FilterStore>()(
    persist(
        (set, get) => ({
            currentFilters: initialFilters,
            savedPolygons: [],
            locationFilter: null,
            activeLocationMode: null,

            // Установка фильтров (мердж с текущими)
            setFilters: (filters) => {
                set((state) => ({
                    currentFilters: {
                        ...state.currentFilters,
                        ...filters,
                    },
                }));
            },

            // Сброс всех фильтров
            resetFilters: () => {
                set({
                    currentFilters: initialFilters,
                    locationFilter: null,
                });
            },

            // Очистка конкретного фильтра
            clearFilter: (key) => {
                set((state) => {
                    const newFilters = { ...state.currentFilters };
                    delete newFilters[key];
                    return { currentFilters: newFilters };
                });
            },

            // Добавление полигона
            addPolygon: (polygon) => {
                const newPolygon: DrawPolygon = {
                    ...polygon,
                    id: generatePolygonId(),
                    createdAt: new Date(),
                };

                set((state) => ({
                    savedPolygons: [...state.savedPolygons, newPolygon],
                }));

                console.log('Polygon added:', newPolygon.id);
                // TODO: Отправка на бекенд (имитация)
                // sendPolygonToBackend(newPolygon);

                return newPolygon;
            },

            // Удаление полигона
            removePolygon: (id) => {
                set((state) => ({
                    savedPolygons: state.savedPolygons.filter((p) => p.id !== id),
                    // Удаляем из фильтров, если там есть
                    currentFilters: {
                        ...state.currentFilters,
                        geometryIds: state.currentFilters.geometryIds?.filter(
                            (gid) => gid !== parseInt(id.replace('polygon_', ''))
                        ),
                    },
                }));

                console.log('Polygon removed:', id);
            },

            // Обновление полигона
            updatePolygon: (id, updates) => {
                set((state) => ({
                    savedPolygons: state.savedPolygons.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                }));
            },

            // Очистка всех полигонов
            clearPolygons: () => {
                set({
                    savedPolygons: [],
                    currentFilters: {
                        ...get().currentFilters,
                        geometryIds: [],
                        rawGeometryIds: [],
                    },
                });
            },

            // Установка фильтра локации
            setLocationFilter: (location) => {
                set({ locationFilter: location });
            },

            // Установка режима локации (открывает панель деталей)
            setLocationMode: (mode) => {
                set({ activeLocationMode: mode });
                console.log('Location mode set:', mode);
            },

            // Синхронизация с вкладкой (сохранение текущих фильтров)
            syncWithQuery: (queryId) => {
                // Эта функция будет вызываться из sidebarStore
                // при смене активной вкладки
                console.log('Syncing filters with query:', queryId);
            },

            // Загрузка фильтров из вкладки
            loadFiltersFromQuery: (filters) => {
                set({ currentFilters: filters });
            },
        }),
        {
            name: 'filter-storage',
            // Сохраняем только полигоны глобально
            partialize: (state) => ({
                savedPolygons: state.savedPolygons,
            }),
        }
    )
);
