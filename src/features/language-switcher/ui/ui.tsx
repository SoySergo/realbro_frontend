'use client';

import { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '@/shared/config/i18n';
import { Languages } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLanguageSwitcher } from '../model';

/**
 * Компонент для переключения языка интерфейса
 * Сохраняет текущий путь при смене языка
 */
export function LanguageSwitcher() {
    const { currentLocale, changeLanguage, isPending } = useLanguageSwitcher();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLocale);

    // Закрыть выпадающий список при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Обработчик смены языка
    const handleLanguageChange = (locale: (typeof LANGUAGES)[number]['code']) => {
        changeLanguage(locale);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'h-9 px-3 rounded-lg flex items-center justify-center gap-2',
                    'bg-background-tertiary border border-border',
                    'text-text-secondary hover:text-brand-primary hover:bg-brand-primary-light hover:border-brand-primary',
                    'transition-colors duration-150'
                )}
                aria-label="Change language"
            >
                <Languages className="w-5 h-5" />
                {currentLanguage && <span className="text-sm font-medium">{currentLanguage.nativeName}</span>}
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 py-1 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[120px]">
                    {LANGUAGES.map((lang) => {
                        const isActive = currentLocale === lang.code;

                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                disabled={isPending || isActive}
                                className={cn(
                                    'w-full px-3 py-2 text-left text-sm flex items-center gap-2',
                                    'transition-colors',
                                    isActive
                                        ? 'bg-brand-primary-light text-brand-primary font-medium'
                                        : 'text-text-primary hover:bg-background-secondary',
                                    isPending && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.nativeName}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
