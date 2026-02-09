'use client';

import { LANGUAGES } from '@/shared/config/i18n';
import { Languages } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLanguageSwitcher } from '../model';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/shared/ui/select/ui';

/**
 * Компонент для переключения языка интерфейса
 * Иконка-кнопка, открывающая Select при клике (стиль demo-7)
 */
export function LanguageSwitcher() {
    const { currentLocale, changeLanguage, isPending } = useLanguageSwitcher();

    // Обработчик смены языка
    const handleLanguageChange = (locale: string) => {
        changeLanguage(locale as (typeof LANGUAGES)[number]['code']);
    };

    return (
        <Select
            value={currentLocale}
            onValueChange={handleLanguageChange}
            disabled={isPending}
        >
            <SelectTrigger
                className={cn(
                    'w-9 h-9 p-0 rounded-lg border-0 shadow-none',
                    'bg-transparent flex items-center justify-center',
                    'text-text-secondary hover:text-brand-primary hover:bg-background-secondary',
                    'transition-colors duration-150',
                    'focus-visible:ring-0 focus-visible:ring-offset-0',
                    '[&>svg:last-child]:hidden'
                )}
                aria-label="Change language"
            >
                <Languages className="w-[17px] h-[17px]" />
            </SelectTrigger>
            <SelectContent
                className="max-h-[300px] overflow-y-auto"
                align="end"
            >
                {LANGUAGES.map((lang) => (
                    <SelectItem
                        key={lang.code}
                        value={lang.code}
                        className={cn(
                            'cursor-pointer',
                            currentLocale === lang.code &&
                                'bg-brand-primary-light text-brand-primary font-medium'
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.nativeName}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
