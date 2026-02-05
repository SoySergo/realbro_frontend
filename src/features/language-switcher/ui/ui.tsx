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
    SelectValue,
} from '@/shared/ui/select/ui';

/**
 * Компонент для переключения языка интерфейса
 * Использует shadcn/ui Select для лучшего UX
 * Сохраняет текущий путь при смене языка
 */
export function LanguageSwitcher() {
    const { currentLocale, changeLanguage, isPending } = useLanguageSwitcher();

    const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLocale);

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
                    'h-9 px-3 rounded-lg gap-2 border-border',
                    'bg-background-tertiary',
                    'text-text-secondary hover:text-brand-primary hover:bg-brand-primary-light hover:border-brand-primary',
                    'transition-colors duration-150',
                    'focus-visible:ring-brand-primary/20'
                )}
                aria-label="Change language"
            >
                <Languages className="w-5 h-5" />
                <SelectValue>
                    {currentLanguage && (
                        <span className="text-sm font-medium">
                            {currentLanguage.nativeName}
                        </span>
                    )}
                </SelectValue>
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
