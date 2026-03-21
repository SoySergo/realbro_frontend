'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useFilterStore } from './store';
import type { SearchFilters } from '@/entities/filter/model/types';
import { getGuestGeometry } from '@/shared/api/geometries';

// Маппинг ключей фильтров на URL-параметры
const FILTER_URL_MAP: Record<string, string> = {
    minPrice: 'minPrice',
    maxPrice: 'maxPrice',
    rooms: 'rooms',
    propertyCategory: 'category',
    minArea: 'area_min',
    maxArea: 'area_max',
    markerType: 'markerType',
    sortOrder: 'sortOrder',
};

// Числовые поля
const NUMERIC_KEYS = new Set(['minPrice', 'maxPrice', 'minArea', 'maxArea']);

// Массивы чисел
const NUMERIC_ARRAY_KEYS = new Set(['rooms']);

// Массивы строк
const STRING_ARRAY_KEYS = new Set(['propertyCategory']);

// Значения по умолчанию, которые не нужно сериализовать в URL
const DEFAULT_VALUES: Record<string, unknown> = {
    markerType: 'all',
    sortOrder: 'desc',
};

/**
 * Хук синхронизации фильтров с URL-параметрами.
 *
 * - При загрузке страницы парсит URL и применяет фильтры в стор.
 * - При изменении фильтров обновляет URL через router.replace (без скролла).
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

        const filtersFromUrl: Record<string, unknown> = {};
        let hasUrlFilters = false;

        for (const [filterKey, urlKey] of Object.entries(FILTER_URL_MAP)) {
            const value = searchParams.get(urlKey);
            if (value === null || value === '') continue;

            hasUrlFilters = true;

            if (NUMERIC_KEYS.has(filterKey)) {
                filtersFromUrl[filterKey] = Number(value);
            } else if (NUMERIC_ARRAY_KEYS.has(filterKey)) {
                filtersFromUrl[filterKey] = value.split(',').map(Number);
            } else if (STRING_ARRAY_KEYS.has(filterKey)) {
                filtersFromUrl[filterKey] = value.split(',');
            } else {
                filtersFromUrl[filterKey] = value;
            }
        }

        // Парсим polygon_ids из URL
        const polygonIdsParam = searchParams.get('polygon_ids');
        if (polygonIdsParam) {
            const polygonIds = polygonIdsParam.split(',').filter(Boolean);
            if (polygonIds.length > 0) {
                filtersFromUrl.polygon_ids = polygonIds;
                hasUrlFilters = true;

                // Загружаем геометрии с бекенда для восстановления на карте
                loadGeometriesFromBackend(polygonIds);
            }
        }

        if (hasUrlFilters) {
            setFilters(filtersFromUrl as Partial<SearchFilters>);
            console.log('[URL] Applied filters from URL:', filtersFromUrl);
        }
    }, [searchParams, setFilters]);

    // 2. При изменении фильтров — обновляем URL
    useEffect(() => {
        if (isInitialLoad.current) return;

        const params = new URLSearchParams();

        for (const [filterKey, urlKey] of Object.entries(FILTER_URL_MAP)) {
            const value = currentFilters[filterKey as keyof SearchFilters];

            if (value === undefined || value === null || value === '') continue;

            // Пропускаем значения по умолчанию
            if (filterKey in DEFAULT_VALUES && value === DEFAULT_VALUES[filterKey]) continue;

            if (Array.isArray(value) && value.length > 0) {
                params.set(urlKey, value.join(','));
            } else if (typeof value === 'number' || typeof value === 'string') {
                params.set(urlKey, String(value));
            }
        }

        // Сериализуем polygon_ids в URL
        if (currentFilters.polygon_ids && currentFilters.polygon_ids.length > 0) {
            params.set('polygon_ids', currentFilters.polygon_ids.join(','));
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

        window.history.replaceState(null, '', newUrl);
    }, [currentFilters, pathname]);
}

/**
 * Загружает геометрии с бекенда по ID и восстанавливает locationFilter в store
 */
async function loadGeometriesFromBackend(polygonIds: string[]) {
    const { setLocationFilter, addGeometryMeta } = useFilterStore.getState();

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
            setLocationFilter({
                mode: 'isochrone',
                isochrone: {
                    center: [firstResult.center_lng, firstResult.center_lat],
                    profile: 'walking', // По дефолту, точный профиль хранится в metadata
                    minutes: 15,
                    name: firstResult.name || undefined,
                },
            });
        } else {
            // polygon — геометрия будет отображена через polygon_ids в фильтрах
            setLocationFilter({
                mode: 'draw',
            });
        }

        console.log('[URL] Restored geometries from backend:', validResults.length);
    } catch (error) {
        console.error('[URL] Failed to load geometries from backend:', error);
    }
}
