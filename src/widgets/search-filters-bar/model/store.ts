'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchFilters } from '@/entities/filter/model/types';
import type { DrawPolygon } from '@/entities/map-draw/model/types';
import type { LocationFilter } from '@/features/location-filter/model/types';
import type { LocationItem } from '@/entities/location/model/types';
import { useSidebarStore } from '@/widgets/sidebar';

// Режим отображения поиска: карта (с сайдбаром) или список (без карты)
export type SearchViewMode = 'map' | 'list';

// Режим отображения карточек в листинге: плитка или горизонтальный список
export type ListingViewMode = 'grid' | 'list';

type FilterStore = {
    // Режим отображения поиска
    searchViewMode: SearchViewMode;

    // Режим отображения карточек в листинге
    listingViewMode: ListingViewMode;

    // Фильтры текущей активной вкладки
    currentFilters: SearchFilters;

    // Сохраненные полигоны (для всех вкладок)
    savedPolygons: DrawPolygon[];

    // Фильтр локации (отдельно, т.к. сложный)
    locationFilter: LocationFilter | null;

    // Активный режим локации (для показа панели деталей)
    activeLocationMode: LocationFilter['mode'] | null;

    // Выбранные wikidata ID локаций на карте (для подсветки полигонов)
    // Используем wikidata для синхронизации с OSM полигонами
    selectedBoundaryWikidata: Set<string>;

    // ID активной вкладки для синхронизации с sidebarStore
    activeQueryId: string | null;

    // Состояние загрузки фильтров
    isLoadingFilters: boolean;

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
    addSelectedBoundary: (wikidata: string) => void;
    removeSelectedBoundary: (wikidata: string) => void;
    toggleSelectedBoundary: (wikidata: string) => void;
    clearSelectedBoundaries: () => void;

    // Синхронизация с вкладками (из sidebarStore)
    setActiveQueryId: (queryId: string | null) => void;
    syncWithQuery: (queryId: string) => void;
    loadFiltersFromQuery: (filters: SearchFilters) => void;

    // Действия с режимом отображения поиска
    setSearchViewMode: (mode: SearchViewMode) => void;
    toggleSearchViewMode: () => void;

    // Действия с режимом отображения карточек в листинге
    setListingViewMode: (mode: ListingViewMode) => void;
    toggleListingViewMode: () => void;
};

// Генерация ID для полигона
const generatePolygonId = () => `polygon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Начальное состояние фильтров
const initialFilters: SearchFilters = {
    markerType: 'all',
    sortOrder: 'desc',
};

// Преобразует LocationFilter в структуру SearchFilters
function convertLocationFilterToFilters(locationFilter: LocationFilter): Partial<SearchFilters> {
    const result: Partial<SearchFilters> = {};

    if (locationFilter.mode === 'search' && locationFilter.selectedLocations) {
        // Группируем по adminLevel
        const groupedByLevel: Record<number, number[]> = {};
        const locationsMeta: Array<{ id: number; wikidata?: string; adminLevel?: number }> = [];

        locationFilter.selectedLocations.forEach((loc) => {
            if (loc.adminLevel && loc.id) {
                if (!groupedByLevel[loc.adminLevel]) {
                    groupedByLevel[loc.adminLevel] = [];
                }
                groupedByLevel[loc.adminLevel].push(loc.id);

                // Сохраняем мета-информацию для восстановления границ
                locationsMeta.push({
                    id: loc.id,
                    wikidata: loc.wikidata,
                    adminLevel: loc.adminLevel,
                });
            }
        });

        // Применяем к нужным полям
        if (groupedByLevel[2]) result.adminLevel2 = groupedByLevel[2];
        if (groupedByLevel[4]) result.adminLevel4 = groupedByLevel[4];
        if (groupedByLevel[6]) result.adminLevel6 = groupedByLevel[6];
        if (groupedByLevel[7]) result.adminLevel7 = groupedByLevel[7];
        if (groupedByLevel[8]) result.adminLevel8 = groupedByLevel[8];
        if (groupedByLevel[9]) result.adminLevel9 = groupedByLevel[9];
        if (groupedByLevel[10]) result.adminLevel10 = groupedByLevel[10];

        // Сохраняем мета-информацию
        result.locationsMeta = locationsMeta;
    }

    if (locationFilter.mode === 'draw' && locationFilter.polygon) {
        result.geometryIds = [parseInt(locationFilter.polygon.id.replace('polygon_', ''))];
    }

    // TODO: isochrone и radius когда будут реализованы

    return result;
}

// Преобразует SearchFilters обратно в LocationFilter
function convertFiltersToLocationFilter(
    filters: SearchFilters,
    savedPolygons: DrawPolygon[]
): LocationFilter | null {
    // Проверяем наличие adminLevel полей
    const hasAdminLevels =
        filters.adminLevel2 ||
        filters.adminLevel4 ||
        filters.adminLevel6 ||
        filters.adminLevel7 ||
        filters.adminLevel8 ||
        filters.adminLevel9 ||
        filters.adminLevel10;

    if (hasAdminLevels && filters.locationsMeta) {
        // Восстанавливаем локации из мета-информации
        const selectedLocations: LocationItem[] = filters.locationsMeta.map((meta) => {
            // Определяем тип локации по adminLevel
            let type: 'city' | 'province' | 'district' | 'country' | 'neighborhood' = 'city';
            if (meta.adminLevel === 2) type = 'country';
            else if (meta.adminLevel === 4) type = 'province';
            else if (meta.adminLevel === 6) type = 'province';
            else if (meta.adminLevel === 7 || meta.adminLevel === 8) type = 'city';
            else if (meta.adminLevel === 9) type = 'district';
            else if (meta.adminLevel === 10) type = 'neighborhood';

            return {
                id: meta.id,
                name: '', // Название будет загружено позже
                type,
                adminLevel: meta.adminLevel,
                wikidata: meta.wikidata,
            };
        });

        return {
            mode: 'search',
            selectedLocations,
        };
    }

    // Проверяем полигоны
    if (filters.geometryIds && filters.geometryIds.length > 0) {
        const polygonId = `polygon_${filters.geometryIds[0]}`;
        const polygon = savedPolygons.find((p) => p.id === polygonId);

        if (polygon) {
            return {
                mode: 'draw',
                polygon,
            };
        }
    }

    return null;
}

export const useFilterStore = create<FilterStore>()(
    persist(
        (set, get) => ({
            searchViewMode: 'map' as SearchViewMode,
            listingViewMode: 'grid' as ListingViewMode,
            currentFilters: initialFilters,
            savedPolygons: [],
            locationFilter: null,
            activeLocationMode: null,
            selectedBoundaryWikidata: new Set<string>(),
            activeQueryId: null,
            isLoadingFilters: false,

            // Установка фильтров (мердж с текущими)
            setFilters: (filters) => {
                set((state) => ({
                    currentFilters: {
                        ...state.currentFilters,
                        ...filters,
                    },
                }));

                // Синхронизируем с активной вкладкой
                const { activeQueryId, syncWithQuery } = get();
                if (activeQueryId) {
                    syncWithQuery(activeQueryId);
                }
            },

            // Сброс всех фильтров
            resetFilters: () => {
                set({
                    currentFilters: initialFilters,
                    locationFilter: null,
                    selectedBoundaryWikidata: new Set<string>(),
                });

                // Очищаем localStorage для всех режимов локации
                try {
                    localStorage.removeItem('local-location-states');
                    console.log('[LOCAL] Cleared localStorage on reset');
                } catch (error) {
                    console.error('[LOCAL] Failed to clear localStorage on reset:', error);
                }

                console.log('All filters reset, including location and boundaries');

                // Синхронизируем с активной вкладкой
                const { activeQueryId, syncWithQuery } = get();
                if (activeQueryId) {
                    syncWithQuery(activeQueryId);
                }
            },

            // Очистка конкретного фильтра
            clearFilter: (key) => {
                set((state) => {
                    const newFilters = { ...state.currentFilters };
                    delete newFilters[key];
                    return { currentFilters: newFilters };
                });

                // Синхронизируем с активной вкладкой
                const { activeQueryId, syncWithQuery } = get();
                if (activeQueryId) {
                    syncWithQuery(activeQueryId);
                }
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
                try {
                    set({ locationFilter: location });

                    // Преобразуем selectedLocations в фильтры по admin_level
                    if (location?.selectedLocations && location.selectedLocations.length > 0) {
                        const filterUpdates: Partial<SearchFilters> = {};

                        // Группируем локации по admin_level
                        const groupedByLevel: Record<number, number[]> = {};
                        location.selectedLocations.forEach((loc) => {
                            if (loc.adminLevel) {
                                if (!groupedByLevel[loc.adminLevel]) {
                                    groupedByLevel[loc.adminLevel] = [];
                                }
                                groupedByLevel[loc.adminLevel].push(loc.id);
                            }
                        });

                        // Применяем к фильтрам
                        if (groupedByLevel[2]) filterUpdates.adminLevel2 = groupedByLevel[2];
                        if (groupedByLevel[4]) filterUpdates.adminLevel4 = groupedByLevel[4];
                        if (groupedByLevel[6]) filterUpdates.adminLevel6 = groupedByLevel[6];
                        if (groupedByLevel[7]) filterUpdates.adminLevel7 = groupedByLevel[7];
                        if (groupedByLevel[8]) filterUpdates.adminLevel8 = groupedByLevel[8];
                        if (groupedByLevel[9]) filterUpdates.adminLevel9 = groupedByLevel[9];
                        if (groupedByLevel[10]) filterUpdates.adminLevel10 = groupedByLevel[10];

                        console.log('Applying admin_level filters:', filterUpdates);

                        set((state) => ({
                            currentFilters: {
                                ...state.currentFilters,
                                ...filterUpdates,
                            },
                        }));
                    }

                    // Синхронизируем с активной вкладкой
                    const { activeQueryId, syncWithQuery } = get();
                    if (activeQueryId) {
                        syncWithQuery(activeQueryId);
                    }
                } catch (error) {
                    console.error('[SYNC] Failed to set location filter:', error);
                }
            },

            // Установка режима локации (открывает панель деталей)
            setLocationMode: (mode) => {
                set({ activeLocationMode: mode });
                console.log('Location mode set:', mode);
            },

            // Синхронизация с вкладками (из sidebarStore)
            syncWithQuery: (queryId) => {
                try {
                    const { currentFilters, locationFilter } = get();
                    const sidebarStore = useSidebarStore.getState();

                    // Преобразуем locationFilter в структуру фильтров
                    const locationFiltersData = locationFilter
                        ? convertLocationFilterToFilters(locationFilter)
                        : {};

                    // Сохраняем текущие фильтры в активную вкладку
                    sidebarStore.updateQuery(queryId, {
                        filters: {
                            ...currentFilters,
                            ...locationFiltersData,
                        },
                    });

                    console.log('[SYNC] Synced filters with query:', queryId);
                } catch (error) {
                    console.error('[SYNC] Failed to sync filters with query:', error);
                }
            },

            // Загрузка фильтров из вкладки
            loadFiltersFromQuery: (filters) => {
                set({ isLoadingFilters: true });

                try {
                    set({ currentFilters: filters });

                    // Преобразуем фильтры обратно в locationFilter
                    const savedPolygons = get().savedPolygons;
                    const locationFilter = convertFiltersToLocationFilter(filters, savedPolygons);

                    if (locationFilter) {
                        set({ locationFilter });

                        // Восстанавливаем границы на карте для режима search
                        if (locationFilter.mode === 'search' && locationFilter.selectedLocations) {
                            // Очищаем старые границы
                            set({ selectedBoundaryWikidata: new Set<string>() });

                            // Добавляем новые границы
                            locationFilter.selectedLocations.forEach((loc) => {
                                if (loc.wikidata) {
                                    get().addSelectedBoundary(loc.wikidata);
                                }
                            });

                            console.log(
                                '[SYNC] Restored boundaries:',
                                locationFilter.selectedLocations.length
                            );
                        }
                    } else {
                        set({ locationFilter: null });
                    }

                    console.log('[SYNC] Loaded filters from query');
                    set({ isLoadingFilters: false });
                } catch (error) {
                    console.error('[SYNC] Failed to load filters from query:', error);
                    set({ isLoadingFilters: false });
                }
            },

            // Добавление выбранной границы (по wikidata)
            addSelectedBoundary: (wikidata) => {
                set((state) => {
                    const newSet = new Set(state.selectedBoundaryWikidata);
                    newSet.add(wikidata);
                    return { selectedBoundaryWikidata: newSet };
                });
            },

            // Удаление выбранной границы (по wikidata)
            removeSelectedBoundary: (wikidata) => {
                set((state) => {
                    const newSet = new Set(state.selectedBoundaryWikidata);
                    newSet.delete(wikidata);
                    return { selectedBoundaryWikidata: newSet };
                });
            },

            // Переключение выбранной границы (по wikidata)
            toggleSelectedBoundary: (wikidata) => {
                set((state) => {
                    const newSet = new Set(state.selectedBoundaryWikidata);
                    if (newSet.has(wikidata)) {
                        newSet.delete(wikidata);
                    } else {
                        newSet.add(wikidata);
                    }
                    return { selectedBoundaryWikidata: newSet };
                });
            },

            // Очистка всех выбранных границ
            clearSelectedBoundaries: () => {
                set({ selectedBoundaryWikidata: new Set<string>() });
            },

            // Установка ID активной вкладки
            setActiveQueryId: (queryId) => {
                set({ activeQueryId: queryId });
                console.log('[SYNC] Active query ID set:', queryId);
            },

            // Установка режима отображения поиска
            setSearchViewMode: (mode) => {
                set({ searchViewMode: mode });
                console.log('[VIEW] Search view mode set:', mode);
            },

            // Переключение режима отображения
            toggleSearchViewMode: () => {
                set((state) => ({
                    searchViewMode: state.searchViewMode === 'map' ? 'list' : 'map',
                }));
            },

            // Установка режима отображения карточек в листинге
            setListingViewMode: (mode) => {
                set({ listingViewMode: mode });
                console.log('[VIEW] Listing view mode set:', mode);
            },

            // Переключение режима отображения карточек
            toggleListingViewMode: () => {
                set((state) => ({
                    listingViewMode: state.listingViewMode === 'grid' ? 'list' : 'grid',
                }));
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
