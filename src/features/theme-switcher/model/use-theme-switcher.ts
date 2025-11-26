'use client';

import { useTheme } from 'next-themes';

/**
 * Hook для управления темой оформления
 * 
 * @returns Объект с методами и состоянием темы
 */
export function useThemeSwitcher() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    // Используем resolvedTheme вместо вычисления currentTheme
    // resolvedTheme автоматически обрабатывает system theme
    const currentTheme = resolvedTheme;

    /**
     * Переключает тему между светлой и темной
     */
    const toggleTheme = () => {
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    };

    return {
        currentTheme,
        toggleTheme,
        // Используем проверку theme !== undefined как индикатор монтирования
        // next-themes устанавливает theme только после монтирования
        mounted: theme !== undefined,
    };
}
