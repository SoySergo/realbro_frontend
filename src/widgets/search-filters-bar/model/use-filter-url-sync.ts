'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFilterStore } from './store';
import type { SearchFilters } from '@/entities/filter/model/types';

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
 */
export function useFilterUrlSync() {
    const router = useRouter();
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

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

        router.replace(newUrl, { scroll: false });
    }, [currentFilters, pathname, router]);
}
