'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { SearchFilters } from '@/entities/filter/model/types';
import type { LocationFilter } from '@/features/location-filter/model/types';
import type { LocationItem } from '@/entities/location/model/types';
import { adminLevelToLocationField } from '@/entities/boundary';
import type { GeometryType } from '@/shared/api/geometries';
import { deleteGuestGeometry, deleteFilterGeometry } from '@/shared/api/geometries';
import { removeGeometryFromStorage } from '@/shared/lib/geometry-storage';

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

    // Мета-информация о сохранённых геометриях (id + name, без координат)
    locationGeometryMeta: Array<{ id: string; name: string; type: GeometryType }>;

    // Фильтр локации (отдельно, т.к. сложный)
    locationFilter: LocationFilter | null;

    // Активный режим локации (для показа панели деталей)
    activeLocationMode: LocationFilter['mode'] | null;

    // Выбранные wikidata ID локаций на карте (для подсветки полигонов)
    selectedBoundaryWikidata: Set<string>;

    // ID активной вкладки для синхронизации с sidebarStore
    activeQueryId: string | null;

    // Состояние загрузки фильтров
    isLoadingFilters: boolean;

    // Действия с фильтрами
    setFilters: (filters: Partial<SearchFilters>) => void;
    resetFilters: () => void;
    clearFilter: (key: keyof SearchFilters) => void;

    // Действия с геометриями
    addGeometryMeta: (meta: { id: string; name: string; type: GeometryType }) => void;
    removeGeometryMeta: (id: string) => void;
    clearGeometryMeta: () => void;

    // Действия с локацией
    setLocationFilter: (location: LocationFilter | null) => void;
    setLocationMode: (mode: LocationFilter['mode'] | null) => void;
    addSelectedBoundary: (wikidata: string) => void;
    removeSelectedBoundary: (wikidata: string) => void;
    toggleSelectedBoundary: (wikidata: string) => void;
    clearSelectedBoundaries: () => void;

    // Удаление геометрий с бекенда
    deleteLocationGeometries: (isAuthenticated: boolean) => Promise<void>;

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

// Начальное состояние фильтров
const initialFilters: SearchFilters = {
    markerType: 'all',
    order: 'desc',
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

        // Также заполняем snake_case поля бекенда
        for (const [levelStr, ids] of Object.entries(groupedByLevel)) {
            const field = adminLevelToLocationField(Number(levelStr));
            const existing = result[field as keyof SearchFilters] as number[] | undefined;
            if (existing) {
                (result as Record<string, unknown>)[field] = [...existing, ...ids];
            } else {
                (result as Record<string, unknown>)[field] = ids;
            }
        }

        // Сохраняем мета-информацию
        (result as Record<string, unknown>).locationsMeta = locationsMeta;
    }

    // draw, isochrone, radius — polygon_ids уже установлены в currentFilters через handleApply

    if (locationFilter.mode === 'radius' && locationFilter.radius) {
        (result as Record<string, unknown>).radiusCenter = locationFilter.radius.center;
        (result as Record<string, unknown>).radiusKm = locationFilter.radius.radiusKm;
    }

    // Изохрон (время до точки)
    if (locationFilter.mode === 'isochrone' && locationFilter.isochrone) {
        (result as Record<string, unknown>).isochroneCenter = locationFilter.isochrone.center;
        (result as Record<string, unknown>).isochroneMinutes = locationFilter.isochrone.minutes;
        (result as Record<string, unknown>).isochroneProfile = locationFilter.isochrone.profile;
    }

    return result;
}

// Преобразует SearchFilters обратно в LocationFilter
function convertFiltersToLocationFilter(
    filters: SearchFilters
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

    if (hasAdminLevels && (filters as Record<string, unknown>).locationsMeta) {
        // Восстанавливаем локации из мета-информации
        const selectedLocations: LocationItem[] = ((filters as Record<string, unknown>).locationsMeta as Array<{ id: number; wikidata?: string; adminLevel?: number }>).map((meta) => {
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
                name: '',
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

    // Проверяем полигоны (geometry IDs в URL → будут загружены с бекенда при открытии мода)
    if (filters.polygonIds && filters.polygonIds.length > 0) {
        return {
            mode: 'draw',
        };
    }

    // Проверяем радиус
    if ((filters as Record<string, unknown>).radiusCenter && (filters as Record<string, unknown>).radiusKm) {
        return {
            mode: 'radius',
            radius: {
                center: (filters as Record<string, unknown>).radiusCenter as [number, number],
                radiusKm: (filters as Record<string, unknown>).radiusKm as number,
            },
        };
    }

    // Проверяем изохрон
    if ((filters as Record<string, unknown>).isochroneCenter && (filters as Record<string, unknown>).isochroneMinutes) {
        return {
            mode: 'isochrone',
            isochrone: {
                center: (filters as Record<string, unknown>).isochroneCenter as [number, number],
                minutes: (filters as Record<string, unknown>).isochroneMinutes as number,
                profile: ((filters as Record<string, unknown>).isochroneProfile as 'walking' | 'cycling' | 'driving') || 'walking',
            },
        };
    }

    return null;
}

export const useFilterStore = create<FilterStore>()(
        (set, get) => ({
            searchViewMode: 'map' as SearchViewMode,
            listingViewMode: 'grid' as ListingViewMode,
            currentFilters: initialFilters,
            locationGeometryMeta: [],
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
                    activeLocationMode: null,
                    selectedBoundaryWikidata: new Set<string>(),
                });

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

            // Добавление мета-информации о геометрии (id + name, без координат)
            addGeometryMeta: (meta) => {
                set((state) => ({
                    locationGeometryMeta: [...state.locationGeometryMeta, meta],
                }));
                console.log('[GEO] Geometry meta added:', meta.id, meta.type);
            },

            // Удаление мета-информации о геометрии
            removeGeometryMeta: (id) => {
                set((state) => ({
                    locationGeometryMeta: state.locationGeometryMeta.filter((m) => m.id !== id),
                    currentFilters: {
                        ...state.currentFilters,
                        polygonIds: state.currentFilters.polygonIds?.filter((pid: string) => pid !== id),
                    },
                }));
                console.log('[GEO] Geometry meta removed:', id);
            },

            // Очистка всех мета-данных геометрий
            clearGeometryMeta: () => {
                set((state) => ({
                    locationGeometryMeta: [],
                    currentFilters: {
                        ...state.currentFilters,
                        polygonIds: [],
                    },
                }));
            },

            // Установка фильтра локации
            setLocationFilter: (location) => {
                try {
                    set({ locationFilter: location });

                    // Если null — очищаем все location-related поля из currentFilters
                    if (!location) {
                        set((state) => {
                            const cleaned = { ...state.currentFilters };
                            // Search mode fields
                            delete (cleaned as Record<string, unknown>).adminLevel2;
                            delete (cleaned as Record<string, unknown>).adminLevel4;
                            delete (cleaned as Record<string, unknown>).adminLevel6;
                            delete (cleaned as Record<string, unknown>).adminLevel7;
                            delete (cleaned as Record<string, unknown>).adminLevel8;
                            delete (cleaned as Record<string, unknown>).adminLevel9;
                            delete (cleaned as Record<string, unknown>).adminLevel10;
                            // Isochrone fields
                            delete (cleaned as Record<string, unknown>).isochroneCenter;
                            delete (cleaned as Record<string, unknown>).isochroneMinutes;
                            delete (cleaned as Record<string, unknown>).isochroneProfile;
                            // Radius fields
                            delete (cleaned as Record<string, unknown>).radiusCenter;
                            delete (cleaned as Record<string, unknown>).radiusKm;
                            // Geometry fields
                            delete (cleaned as Record<string, unknown>).polygonIds;
                            delete (cleaned as Record<string, unknown>).geoSrc;
                            return { currentFilters: cleaned };
                        });
                        return;
                    }

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

                        // Устанавливаем snake_case поля бекенда через единый маппинг
                        for (const [levelStr, ids] of Object.entries(groupedByLevel)) {
                            const field = adminLevelToLocationField(Number(levelStr));
                            const existing = filterUpdates[field as keyof SearchFilters] as number[] | undefined;
                            if (existing) {
                                (filterUpdates as Record<string, unknown>)[field] = [...existing, ...ids];
                            } else {
                                (filterUpdates as Record<string, unknown>)[field] = ids;
                            }
                        }

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

            // Удаление геометрий с бекенда с учётом авторизации
            deleteLocationGeometries: async (isAuthenticated) => {
                const { locationGeometryMeta, currentFilters } = get();
                const polygonIds = currentFilters.polygonIds || [];
                const geometrySource = currentFilters.geoSrc;

                // Удаляем из localStorage
                for (const meta of locationGeometryMeta) {
                    removeGeometryFromStorage(meta.id);
                }
                for (const id of polygonIds) {
                    removeGeometryFromStorage(id);
                }

                // Очищаем локальное состояние сразу
                set({
                    locationGeometryMeta: [],
                });

                if (isAuthenticated) {
                    // Авторизован → удаляем с бекенда
                    const deletePromises = polygonIds.map((id: string) => {
                        if (geometrySource === 'filter') {
                            return deleteFilterGeometry(id).catch((e) => {
                                console.error('[GEO] Failed to delete filter geometry:', id, e);
                            });
                        }
                        return deleteGuestGeometry(id).catch((e) => {
                            console.error('[GEO] Failed to delete guest geometry:', id, e);
                        });
                    });
                    await Promise.allSettled(deletePromises);
                    console.log('[GEO] Deleted geometries from backend:', polygonIds);
                } else {
                    // Гость → НЕ удаляем с бекенда (URL мог быть расшарен)
                    console.log('[GEO] Guest: cleared local meta only, backend geometries kept');
                }
            },

            // Синхронизация с вкладками — no-op (tabs removed, URL is source of truth)
            syncWithQuery: (_queryId) => {
                // No-op: filters live in URL now
            },

            // Загрузка фильтров из вкладки
            loadFiltersFromQuery: (filters) => {
                set({ isLoadingFilters: true });

                try {
                    set({ currentFilters: filters });

                    // Преобразуем фильтры обратно в locationFilter
                    const locationFilter = convertFiltersToLocationFilter(filters);

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
);

// ==========================================
// Оптимизированные селекторы с shallow сравнением
// ==========================================

/**
 * Селектор для режима отображения (карта/список)
 * Оптимизирован: обновляется только при изменении searchViewMode
 */
export function useSearchViewMode() {
    return useFilterStore((state) => state.searchViewMode);
}

/**
 * Селектор для активного режима локации
 * Оптимизирован: обновляется только при изменении activeLocationMode
 */
export function useActiveLocationMode() {
    return useFilterStore((state) => state.activeLocationMode);
}

/**
 * Селектор для текущих фильтров
 * Использует shallow сравнение для предотвращения лишних ререндеров
 */
export function useCurrentFilters() {
    return useFilterStore(useShallow((state) => state.currentFilters));
}

/**
 * Селектор для действий с локацией
 * Экшены стабильны, но useShallow гарантирует отсутствие лишних ререндеров
 */
export function useLocationActions() {
    return useFilterStore(
        useShallow((state) => ({
            setLocationFilter: state.setLocationFilter,
            setLocationMode: state.setLocationMode,
            addSelectedBoundary: state.addSelectedBoundary,
            removeSelectedBoundary: state.removeSelectedBoundary,
            toggleSelectedBoundary: state.toggleSelectedBoundary,
            clearSelectedBoundaries: state.clearSelectedBoundaries,
        }))
    );
}

/**
 * Селектор для действий с фильтрами
 * Экшены стабильны, но useShallow гарантирует отсутствие лишних ререндеров
 */
export function useFilterActions() {
    return useFilterStore(
        useShallow((state) => ({
            setFilters: state.setFilters,
            resetFilters: state.resetFilters,
            clearFilter: state.clearFilter,
        }))
    );
}

/**
 * Селектор для фильтра локации
 */
export function useLocationFilter() {
    return useFilterStore((state) => state.locationFilter);
}

/**
 * Селектор для выбранных границ (wikidata IDs)
 */
export function useSelectedBoundaryWikidata() {
    return useFilterStore((state) => state.selectedBoundaryWikidata);
}

/**
 * Селектор для мета-данных геометрий (id + name)
 */
export function useLocationGeometryMeta() {
    return useFilterStore(useShallow((state) => state.locationGeometryMeta));
}

/**
 * Селектор для действий с геометриями
 */
export function useGeometryActions() {
    return useFilterStore(
        useShallow((state) => ({
            addGeometryMeta: state.addGeometryMeta,
            removeGeometryMeta: state.removeGeometryMeta,
            clearGeometryMeta: state.clearGeometryMeta,
            deleteLocationGeometries: state.deleteLocationGeometries,
        }))
    );
}

/**
 * Селектор для режима отображения и его переключения
 */
export function useViewModeActions() {
    return useFilterStore(
        useShallow((state) => ({
            searchViewMode: state.searchViewMode,
            setSearchViewMode: state.setSearchViewMode,
            toggleSearchViewMode: state.toggleSearchViewMode,
        }))
    );
}

/**
 * Селектор для режима отображения карточек в листинге (grid/list)
 */
export function useListingViewMode() {
    return useFilterStore(
        useShallow((state) => ({
            listingViewMode: state.listingViewMode,
            setListingViewMode: state.setListingViewMode,
            toggleListingViewMode: state.toggleListingViewMode,
        }))
    );
}
