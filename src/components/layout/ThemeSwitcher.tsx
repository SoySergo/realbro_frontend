'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted] = useState(true);

    if (!mounted) {
        return (
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary bg-background-tertiary border border-border">
                <Sun className="w-5 h-5" />
            </button>
        );
    }

    const currentTheme = theme === 'system' ? systemTheme : theme;

    return (
        <button
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                'bg-background-tertiary border border-border',
                'text-text-secondary hover:text-brand-primary hover:bg-brand-primary-light hover:border-brand-primary',
                'transition-colors duration-150'
            )}
            aria-label="Toggle theme"
        >
            {currentTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
}
