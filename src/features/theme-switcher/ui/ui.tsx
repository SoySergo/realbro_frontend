'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useThemeSwitcher } from '../model';

/**
 * Компонент для переключения темы оформления (светлая/темная)
 */
export function ThemeSwitcher() {
    const { currentTheme, toggleTheme, mounted } = useThemeSwitcher();

    // Показываем fallback UI до монтирования компонента (избегаем гидратации несовпадений)
    if (!mounted) {
        return (
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary">
                <Sun className="w-[17px] h-[17px]" />
            </button>
        );
    }

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
            {currentTheme === 'dark' ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
        </button>
    );
}
