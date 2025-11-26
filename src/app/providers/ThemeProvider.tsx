'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Провайдер темы для приложения
 * Использует next-themes для управления светлой/тёмной темой
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
