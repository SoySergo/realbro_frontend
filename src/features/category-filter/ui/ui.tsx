'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { getCategories, type Category } from '@/shared/api/dictionaries';

// Фолбэк категории (если API недоступен)
const FALLBACK_CATEGORIES = [
    { id: 1, name: '', code: 'apartment' },
    { id: 2, name: '', code: 'house' },
    { id: 3, name: '', code: 'villa' },
    { id: 4, name: '', code: 'studio' },
    { id: 5, name: '', code: 'penthouse' },
    { id: 6, name: '', code: 'townhouse' },
];

/**
 * Фильтр категорий недвижимости
 * Мультиселект для выбора нескольких категорий
 * Данные загружаются из API /dictionaries/categories
 */
export function CategoryFilter() {
    const t = useTranslations('filters');
    const tTypes = useTranslations('propertyTypes');
    const locale = useLocale();
    const { filters, setFilters } = useSearchFilters();

    const [apiCategories, setApiCategories] = useState<Category[]>([]);

    // Загружаем категории из API
    useEffect(() => {
        getCategories(locale).then(setApiCategories);
    }, [locale]);

    // Используем API категории если есть, иначе фолбэк
    const categories = apiCategories.length > 0
        ? apiCategories.map(c => ({ id: c.id, label: c.name || tTypes(c.code as Parameters<typeof tTypes>[0]) }))
        : FALLBACK_CATEGORIES.map(c => ({ id: c.id, label: tTypes(c.code as Parameters<typeof tTypes>[0]) }));

    const selectedIds = filters.categoryIds || [];

    const handleToggle = (id: number) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter((i: number) => i !== id)
            : [...selectedIds, id];

        setFilters({
            categoryIds: newIds.length > 0 ? newIds : undefined,
            categories: newIds.length > 0 ? newIds : undefined,
        });
        console.log('Categories updated:', newIds);
    };

    const selectedCount = selectedIds.length;
    const buttonLabel = selectedCount > 0
        ? `${t('category')} (${selectedCount})`
        : t('category');

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'w-fit whitespace-nowrap cursor-pointer',
                        // Светлая тема: белый фон
                        'bg-background',
                        // Тёмная тема: без бордера
                        'border border-border dark:border-transparent',
                        // Текст
                        'text-text-primary hover:text-text-primary',
                        // Размеры и отступы
                        'h-9 px-3 py-2 rounded-md text-sm',
                        // Флекс для иконки
                        'flex items-center justify-between gap-2',
                        // Переходы
                        'transition-all duration-200',
                        // Активное состояние
                        selectedCount > 0 && 'text-text-primary'
                    )}
                >
                    {buttonLabel}
                    <ChevronDownIcon className="size-4 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'w-[280px] z-50 p-1',
                    // Светлая тема: белый фон
                    'bg-background',
                    'border border-border dark:border-border',
                    'shadow-lg'
                )}
                align="start"
            >
                <div className="max-h-80 overflow-y-auto">
                    {categories.map((category) => {
                        const isSelected = selectedIds.includes(category.id);

                        return (
                            <div
                                key={category.id}
                                onClick={() => handleToggle(category.id)}
                                className={cn(
                                    'relative flex w-full cursor-pointer items-center gap-2.5',
                                    'rounded-sm py-2 px-2 text-sm outline-hidden select-none',
                                    // Текст
                                    'text-text-secondary',
                                    // Ховер: синий фон в обеих темах
                                    'hover:bg-brand-primary-light hover:text-brand-primary',
                                    'dark:hover:bg-brand-primary dark:hover:text-white',
                                    // Переход
                                    'transition-colors duration-150',
                                    // Выбранный элемент
                                    isSelected && 'text-brand-primary'
                                )}
                            >
                                {/* Чекбокс для мультиселекта */}
                                <div
                                    className={cn(
                                        'size-4 shrink-0 rounded-[4px] border shadow-xs transition-all',
                                        'flex items-center justify-center',
                                        isSelected
                                            ? 'bg-brand-primary border-brand-primary text-white dark:text-white'
                                            : 'border-input bg-background dark:bg-background'
                                    )}
                                >
                                    {isSelected && (
                                        <CheckIcon className="size-3.5" strokeWidth={2.5} />
                                    )}
                                </div>
                                <span className="flex-1">{category.label}</span>
                            </div>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
