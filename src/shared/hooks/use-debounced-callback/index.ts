'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Хук для debounce колбэка
 * Предотвращает множественные вызовы при быстрых последовательных кликах
 *
 * @param callback - Функция для выполнения
 * @param delay - Задержка в миллисекундах (по умолчанию 50ms)
 * @returns Мемоизированная функция с debounce
 *
 * @example
 * const handleClick = useDebouncedCallback((id: string) => {
 *   removeItem(id);
 * }, 50);
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number = 50
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);

    // Обновляем ref при изменении callback
    callbackRef.current = callback;

    // Очищаем timeout при unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback((...args: Parameters<T>) => {
        // Отменяем предыдущий timeout, если он есть
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        // Устанавливаем новый timeout
        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
            timeoutRef.current = null;
        }, delay);
    }, [delay]);
}

/**
 * Хук для throttle колбэка
 * Ограничивает частоту вызовов функции
 *
 * @param callback - Функция для выполнения
 * @param limit - Минимальный интервал между вызовами в миллисекундах
 * @returns Мемоизированная функция с throttle
 *
 * @example
 * const handleScroll = useThrottledCallback(() => {
 *   updateScrollPosition();
 * }, 100);
 */
export function useThrottledCallback<T extends (...args: Parameters<T>) => void>(
    callback: T,
    limit: number = 100
): (...args: Parameters<T>) => void {
    const lastRunRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);

    // Обновляем ref при изменении callback
    callbackRef.current = callback;

    // Очищаем timeout при unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        const timeSinceLastRun = now - lastRunRef.current;

        if (timeSinceLastRun >= limit) {
            // Можно выполнить сразу
            lastRunRef.current = now;
            callbackRef.current(...args);
        } else {
            // Планируем выполнение на конец интервала
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                lastRunRef.current = Date.now();
                callbackRef.current(...args);
                timeoutRef.current = null;
            }, limit - timeSinceLastRun);
        }
    }, [limit]);
}
