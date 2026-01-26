'use client';

import { useRef, useCallback, useEffect } from 'react';

/**
 * Хук для управления AbortController
 * Автоматически отменяет предыдущие запросы при новом вызове
 *
 * @returns Объект с методами для управления запросами
 *
 * @example
 * const { getSignal, abort } = useAbortController();
 *
 * const fetchData = async () => {
 *   try {
 *     const response = await fetch('/api/data', { signal: getSignal() });
 *     const data = await response.json();
 *   } catch (error) {
 *     if (error.name === 'AbortError') {
 *       console.log('Request was aborted');
 *       return;
 *     }
 *     throw error;
 *   }
 * };
 */
export function useAbortController() {
    const controllerRef = useRef<AbortController | null>(null);

    // Отменяем запрос при unmount
    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    /**
     * Получает signal для нового запроса
     * Автоматически отменяет предыдущий запрос
     */
    const getSignal = useCallback((): AbortSignal => {
        // Отменяем предыдущий запрос
        controllerRef.current?.abort();

        // Создаём новый controller
        controllerRef.current = new AbortController();

        return controllerRef.current.signal;
    }, []);

    /**
     * Отменяет текущий запрос вручную
     */
    const abort = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
    }, []);

    /**
     * Проверяет, был ли запрос отменён
     */
    const isAborted = useCallback((): boolean => {
        return controllerRef.current?.signal.aborted ?? false;
    }, []);

    return {
        getSignal,
        abort,
        isAborted,
    };
}

/**
 * Хук для дебаунсированных запросов с автоматической отменой
 * Комбинирует debounce и AbortController
 *
 * @param fetchFn - Асинхронная функция запроса
 * @param delay - Задержка debounce в миллисекундах (по умолчанию 50ms)
 * @returns Объект с методами для управления запросами
 *
 * @example
 * const { execute, cancel, isLoading } = useDebouncedFetch(
 *   async (signal, filters) => {
 *     const response = await fetch('/api/count', { signal, body: JSON.stringify(filters) });
 *     return response.json();
 *   },
 *   50
 * );
 *
 * // При изменении фильтров
 * execute(filters).then(count => setCount(count));
 */
export function useDebouncedFetch<TArgs extends unknown[], TResult>(
    fetchFn: (signal: AbortSignal, ...args: TArgs) => Promise<TResult>,
    delay: number = 50
) {
    const controllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLoadingRef = useRef(false);
    const fetchFnRef = useRef(fetchFn);

    // Обновляем ref при изменении fetchFn
    fetchFnRef.current = fetchFn;

    // Очищаем при unmount
    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    /**
     * Выполняет запрос с debounce и автоматической отменой предыдущего
     */
    const execute = useCallback((...args: TArgs): Promise<TResult> => {
        return new Promise((resolve, reject) => {
            // Отменяем предыдущий запрос и timeout
            controllerRef.current?.abort();
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }

            // Создаём новый controller
            controllerRef.current = new AbortController();
            const signal = controllerRef.current.signal;

            // Планируем выполнение
            timeoutRef.current = setTimeout(async () => {
                isLoadingRef.current = true;

                try {
                    const result = await fetchFnRef.current(signal, ...args);
                    if (!signal.aborted) {
                        resolve(result);
                    }
                } catch (error) {
                    if (!signal.aborted) {
                        reject(error);
                    }
                } finally {
                    isLoadingRef.current = false;
                    timeoutRef.current = null;
                }
            }, delay);
        });
    }, [delay]);

    /**
     * Отменяет текущий запрос и очищает timeout
     */
    const cancel = useCallback(() => {
        controllerRef.current?.abort();
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        isLoadingRef.current = false;
    }, []);

    return {
        execute,
        cancel,
        get isLoading() {
            return isLoadingRef.current;
        },
    };
}
