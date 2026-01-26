'use client';

import { useState, useEffect } from 'react';

/**
 * Хук для определения, предпочитает ли пользователь уменьшенное движение
 * Используется для отключения анимаций на слабых устройствах или по запросу пользователя
 *
 * @returns true если пользователь предпочитает уменьшенное движение
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 *
 * return (
 *   <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
 *     Content
 *   </div>
 * );
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Проверяем наличие window (SSR safety)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Устанавливаем начальное значение
        setPrefersReducedMotion(mediaQuery.matches);

        // Слушаем изменения
        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return prefersReducedMotion;
}

/**
 * Статическая проверка prefers-reduced-motion
 * Используется когда хук нельзя использовать (вне компонентов)
 *
 * @returns true если пользователь предпочитает уменьшенное движение
 */
export function getPrefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
