'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/shared/config/routing';
import { useCallback, useMemo, useTransition } from 'react';
import type { SearchFilters } from '@/entities/filter';
import {
    parseFiltersFromSearchParams,
    serializeFiltersToSearchParams,
    hasActiveFilters,
    countActiveFilters,
} from '../lib/search-params';

/**
 * Hook для работы с фильтрами поиска через URL параметры
 * 
 * @returns {Object} Объект с фильтрами и методами для их обновления
 * 
 * @example
 * const { filters, setFilters, clearFilters, updateFilter } = useSearchFilters();
 * 
 * // Установить несколько фильтров
 * setFilters({ minPrice: 500, maxPrice: 2000 });
 * 
 * // Обновить один фильтр
 * updateFilter('rooms', [2, 3]);
 * 
 * // Очистить все фильтры
 * clearFilters();
 */
export function useSearchFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Текущие фильтры из URL
    const filters = useMemo(() => {
        return parseFiltersFromSearchParams(searchParams);
    }, [searchParams]);

    /**
     * Обновляет URL с новыми параметрами фильтров
     */
    const updateURL = useCallback(
        (newParams: URLSearchParams) => {
            const url = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;

            startTransition(() => {
                router.replace(url, { scroll: false });
            });
        },
        [pathname, router]
    );

    /**
     * Устанавливает фильтры (мерджит с текущими)
     */
    const setFilters = useCallback(
        (updates: Partial<SearchFilters>) => {
            const currentFilters = parseFiltersFromSearchParams(searchParams);
            const newFilters = { ...currentFilters, ...updates };

            // Удаляем undefined значения
            Object.keys(newFilters).forEach((key) => {
                const value = newFilters[key as keyof SearchFilters];
                if (value === undefined || (Array.isArray(value) && value.length === 0)) {
                    delete newFilters[key as keyof SearchFilters];
                }
            });

            const newParams = serializeFiltersToSearchParams(newFilters);
            updateURL(newParams);
        },
        [searchParams, updateURL]
    );

    /**
     * Обновляет один конкретный фильтр
     */
    const updateFilter = useCallback(
        <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
            setFilters({ [key]: value } as Partial<SearchFilters>);
        },
        [setFilters]
    );

    /**
     * Удаляет конкретный фильтр
     */
    const clearFilter = useCallback(
        (key: keyof SearchFilters) => {
            const currentFilters = parseFiltersFromSearchParams(searchParams);
            delete currentFilters[key];

            const newParams = serializeFiltersToSearchParams(currentFilters);
            updateURL(newParams);
        },
        [searchParams, updateURL]
    );

    /**
     * Очищает все фильтры
     */
    const clearFilters = useCallback(() => {
        updateURL(new URLSearchParams());
    }, [updateURL]);

    /**
     * Заменяет все фильтры (не мерджит)
     */
    const replaceFilters = useCallback(
        (newFilters: SearchFilters) => {
            const newParams = serializeFiltersToSearchParams(newFilters);
            updateURL(newParams);
        },
        [updateURL]
    );

    // Вспомогательные утилиты
    const hasFilters = useMemo(() => hasActiveFilters(filters), [filters]);
    const filtersCount = useMemo(() => countActiveFilters(filters), [filters]);

    return {
        filters,
        setFilters,
        updateFilter,
        clearFilter,
        clearFilters,
        replaceFilters,
        hasFilters,
        filtersCount,
        isPending,
    };
}
