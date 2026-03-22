'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useFilterStore } from './store';
import type { SearchFilters } from '@/entities/filter/model/types';
import { getGuestGeometry } from '@/shared/api/geometries';
import {
    parseFiltersFromSearchParams,
    serializeFiltersToSearchParams,
} from '@/features/search-filters/lib/search-params';

/**
 * Хук синхронизации фильтров с URL-параметрами.
 *
 * Использует единый формат URL: price=min-max, categories=1,2, polygon_ids=uuid,...
 * (тот же формат, что и search-filters/lib/search-params.ts)
 *
 * - При загрузке страницы парсит URL и применяет фильтры в стор.
 * - При изменении фильтров обновляет URL через history.replaceState.
 * - Загружает геометрии с бекенда при наличии polygon_ids в URL.
 */
export function useFilterUrlSync() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { currentFilters, setFilters } = useFilterStore();
    const isInitialLoad = useRef(true);

    // 1. При загрузке страницы — парсим URL и применяем фильтры
    useEffect(() => {
        if (!isInitialLoad.current) return;
        isInitialLoad.current = false;

        // Парсим все фильтры из URL единым парсером (включая polygon_ids)
        const filtersFromUrl = parseFiltersFromSearchParams(searchParams);

        // Загружаем геометрии с бекенда при наличии polygon_ids
        if (filtersFromUrl.polygon_ids && filtersFromUrl.polygon_ids.length > 0) {
            loadGeometriesFromBackend(filtersFromUrl.polygon_ids);
        }

        const hasUrlFilters = Object.keys(filtersFromUrl).some(
            (key) => {
                const val = filtersFromUrl[key as keyof SearchFilters];
                return val !== undefined && (!Array.isArray(val) || val.length > 0);
            }
        );

        if (hasUrlFilters) {
            setFilters(filtersFromUrl);
            console.log('[URL] Applied filters from URL:', filtersFromUrl);
        }
    }, [searchParams, setFilters]);

    // 2. При изменении фильтров — обновляем URL
    useEffect(() => {
        if (isInitialLoad.current) return;

        // Сериализуем все фильтры единым сериализатором
        const params = serializeFiltersToSearchParams(currentFilters);

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

        window.history.replaceState(null, '', newUrl);
    }, [currentFilters, pathname]);
}

/**
 * Загружает геометрии: сначала из localStorage (rehydrated store), затем с бекенда как fallback
 */
async function loadGeometriesFromBackend(polygonIds: string[]) {
    const { setLocationFilter, addGeometryMeta, locationFilter, locationGeometryMeta } = useFilterStore.getState();

    // Проверяем, есть ли уже полные данные в store (восстановлены из localStorage через zustand persist)
    if (locationFilter && locationGeometryMeta.length > 0) {
        const hasMatchingMeta = polygonIds.some(id => locationGeometryMeta.some(m => m.id === id));
        const hasCoordinateData =
            (locationFilter.mode === 'isochrone' && locationFilter.isochrone?.polygon) ||
            (locationFilter.mode === 'radius' && locationFilter.radius?.center) ||
            (locationFilter.mode === 'draw' && locationFilter.polygon?.points?.length);

        if (hasMatchingMeta && hasCoordinateData) {
            console.log('[URL] Restored geometries from localStorage (skipped backend fetch)');
            return;
        }
    }

    // Fallback: загружаем с бекенда
    try {
        const results = await Promise.all(
            polygonIds.map((id) => getGuestGeometry(id))
        );

        const validResults = results.filter(Boolean);
        if (validResults.length === 0) return;

        const firstResult = validResults[0]!;
        const geometryType = firstResult.geometry_type || 'polygon';

        // Сохраняем мета-данные
        for (const result of validResults) {
            if (!result) continue;
            addGeometryMeta({
                id: result.id,
                name: result.name || '',
                type: result.geometry_type as 'polygon' | 'isochrone' | 'radius',
            });
        }

        // Восстанавливаем locationFilter в зависимости от типа
        if (geometryType === 'radius') {
            setLocationFilter({
                mode: 'radius',
                radius: {
                    center: [firstResult.center_lng, firstResult.center_lat],
                    radiusKm: firstResult.radius,
                    name: firstResult.name || undefined,
                },
            });
        } else if (geometryType === 'isochrone') {
            // Парсим сохранённый полигон из GeoJSON
            let savedPolygon: number[][][] | undefined;
            if (firstResult.geometry) {
                try {
                    const geojson = JSON.parse(firstResult.geometry);
                    if (geojson.coordinates) {
                        savedPolygon = geojson.coordinates;
                    }
                } catch {
                    console.error('[URL] Failed to parse isochrone geometry');
                }
            }

            setLocationFilter({
                mode: 'isochrone',
                isochrone: {
                    center: [firstResult.center_lng, firstResult.center_lat],
                    profile: 'walking',
                    minutes: 15,
                    name: firstResult.name || undefined,
                    polygon: savedPolygon,
                },
            });
        } else {
            // polygon — восстанавливаем координаты из GeoJSON
            let restoredPolygon: import('@/entities/map-draw/model/types').DrawPolygon | undefined;
            if (firstResult.geometry) {
                try {
                    const geojson = JSON.parse(firstResult.geometry);
                    if (geojson.coordinates && geojson.coordinates[0]) {
                        const coords = geojson.coordinates[0] as [number, number][];
                        // Убираем замыкающую точку (дубль первой)
                        const points = coords.slice(0, -1).map(([lng, lat]) => ({ lng, lat }));
                        restoredPolygon = {
                            id: `polygon_${firstResult.id}`,
                            name: firstResult.name || '',
                            points,
                            createdAt: new Date(firstResult.created_at),
                        };
                    }
                } catch {
                    console.error('[URL] Failed to parse polygon geometry');
                }
            }

            setLocationFilter({
                mode: 'draw',
                polygon: restoredPolygon,
            });
        }

        console.log('[URL] Restored geometries from backend (fallback):', validResults.length);
    } catch (error) {
        console.error('[URL] Failed to load geometries from backend:', error);
    }
}
