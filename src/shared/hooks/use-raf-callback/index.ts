'use client';

import { useCallback, useRef } from 'react';

/**
 * Хук для выполнения колбэка через requestAnimationFrame
 * Обеспечивает плавные анимации и предотвращает дёрганье UI
 *
 * @param callback - Функция для выполнения
 * @returns Мемоизированная функция, которая будет выполнена в следующем кадре анимации
 *
 * @example
 * const handleRemove = useRafCallback((id: string) => {
 *   // Удаление элемента будет выполнено в следующем кадре
 *   removeItem(id);
 * });
 */
export function useRafCallback<T extends (...args: Parameters<T>) => void>(
    callback: T
): (...args: Parameters<T>) => void {
    const rafRef = useRef<number | null>(null);
    const callbackRef = useRef(callback);

    // Обновляем ref при изменении callback
    callbackRef.current = callback;

    return useCallback((...args: Parameters<T>) => {
        // Отменяем предыдущий запрос, если он есть
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }

        // Планируем выполнение на следующий кадр
        rafRef.current = requestAnimationFrame(() => {
            callbackRef.current(...args);
            rafRef.current = null;
        });
    }, []);
}

/**
 * Хук для выполнения колбэка с задержкой через requestAnimationFrame
 * Полезен когда нужно выполнить действие после завершения анимации
 *
 * @param callback - Функция для выполнения
 * @param frames - Количество кадров для ожидания (по умолчанию 2)
 * @returns Мемоизированная функция с задержкой
 */
export function useDelayedRafCallback<T extends (...args: Parameters<T>) => void>(
    callback: T,
    frames: number = 2
): (...args: Parameters<T>) => void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback((...args: Parameters<T>) => {
        let frameCount = 0;

        const tick = () => {
            frameCount++;
            if (frameCount >= frames) {
                callbackRef.current(...args);
            } else {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }, [frames]);
}
