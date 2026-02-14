'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useThemeSwitcher } from '../model';

/**
 * Компонент для переключения темы оформления (светлая/темная)
 * Рендерит обе иконки всегда, переключает видимость через CSS —
 * это исключает hydration mismatch между сервером и клиентом.
 */
export function ThemeSwitcher() {
    const { toggleTheme } = useThemeSwitcher();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                'text-text-secondary hover:text-brand-primary hover:bg-background-secondary',
                'transition-colors duration-150'
            )}
            aria-label="Toggle theme"
        >
            {/* Sun — видна только в dark mode */}
            <Sun className="w-[17px] h-[17px] hidden dark:block" />
            {/* Moon — видна только в light mode */}
            <Moon className="w-[17px] h-[17px] block dark:hidden" />
        </button>
    );
}
