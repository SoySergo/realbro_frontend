'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchFilters } from '@/entities/filter';
import { getPropertiesCount } from '@/shared/api';

const DEBOUNCE_DELAY = 50;

type UsePropertiesCountOptions = {
    /** Задержка debounce в миллисекундах (по умолчанию 50ms) */
    debounceDelay?: number;
    /** Автоматически запрашивать count при изменении фильтров */
    autoFetch?: boolean;
};

type UsePropertiesCountResult = {
    /** Количество объектов */
    count: number | null;
    /** Идёт ли загрузка */
    isLoading: boolean;
    /** Ошибка запроса */
    error: Error | null;
    /** Вручную запросить count */
    refetch: () => void;
    /** Отменить текущий запрос */
    cancel: () => void;
};

/**
 * Хук для получения количества объектов по фильтрам
 * с debounce и автоматической отменой предыдущих запросов
 *
 * @param filters - Текущие фильтры
 * @param options - Опции хука
 *
 * @example
 * const { count, isLoading, error, refetch } = usePropertiesCount(filters);
 *
 * // Показываем количество в UI
 * <Button disabled={isLoading}>
 *   {isLoading ? <Loader /> : `Показать ${count} вариантов`}
 * </Button>
 */
export function usePropertiesCount(
    filters: SearchFilters,
    options: UsePropertiesCountOptions = {}
): UsePropertiesCountResult {
    const { debounceDelay = DEBOUNCE_DELAY, autoFetch = true } = options;

    const [count, setCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Refs для управления запросами
    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const filtersRef = useRef(filters);

    // Обновляем ref при изменении фильтров
    filtersRef.current = filters;

    /**
     * Отменяет текущий запрос и timeout
     */
    const cancel = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;

        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setIsLoading(false);
    }, []);

    /**
     * Выполняет запрос count с debounce
     */
    const fetchCount = useCallback(async () => {
        // Отменяем предыдущий запрос
        cancel();

        // Создаём новый AbortController
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);
        setError(null);

        // Запускаем с debounce
        timeoutRef.current = setTimeout(async () => {
            try {
                const result = await getPropertiesCount(filtersRef.current, signal);

                // Проверяем, не был ли запрос отменён
                if (!signal.aborted) {
                    setCount(result);
                    setError(null);
                }
            } catch (err) {
                // Игнорируем ошибки отмены
                if (err instanceof Error && err.name === 'AbortError') {
                    return;
                }

                if (!signal.aborted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch count'));
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                    timeoutRef.current = null;
                }
            }
        }, debounceDelay);
    }, [cancel, debounceDelay]);

    /**
     * Вручную перезапросить count
     */
    const refetch = useCallback(() => {
        fetchCount();
    }, [fetchCount]);

    // Автоматический запрос при изменении фильтров
    useEffect(() => {
        if (autoFetch) {
            fetchCount();
        }

        // Отмена при unmount
        return () => {
            cancel();
        };
    }, [filters, autoFetch, fetchCount, cancel]);

    return {
        count,
        isLoading,
        error,
        refetch,
        cancel,
    };
}
