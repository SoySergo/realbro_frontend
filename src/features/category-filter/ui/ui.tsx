'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDownIcon } from 'lucide-react';
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
    { id: 1, slug: 'room', code: 'room' },
    { id: 2, slug: 'apartment', code: 'apartment' },
    { id: 3, slug: 'house', code: 'house' },
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
        ? apiCategories.map(c => ({ id: c.id, label: c.translated_name || tTypes(c.slug as Parameters<typeof tTypes>[0]) }))
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
    // Формируем лейбл кнопки с именами выбранных категорий
    let buttonLabel: string;
    if (selectedCount > 0) {
        const selectedNames = categories
            .filter(c => selectedIds.includes(c.id))
            .map(c => c.label);
        const joined = selectedNames.join(', ');
        buttonLabel = joined.length > 24 ? joined.slice(0, 22) + '…' : joined;
    } else {
        buttonLabel = t('category');
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'w-full cursor-pointer',
                        'bg-background-secondary',
                        'text-text-primary hover:text-text-primary',
                        'h-9 px-3 py-2 rounded-md text-sm',
                        'flex items-center justify-between gap-1',
                        'transition-all duration-200',
                        selectedCount > 0 && 'text-text-primary'
                    )}
                >
                    <span className="truncate min-w-0">{buttonLabel}</span>
                    <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'w-[220px] z-50 p-1.5',
                    'bg-background',
                    'border border-border dark:border-border',
                    'shadow-lg'
                )}
                align="start"
            >
                <div className="max-h-80 overflow-y-auto space-y-0.5">
                    {categories.map((category) => {
                        const isSelected = selectedIds.includes(category.id);

                        return (
                            <div
                                key={category.id}
                                onClick={() => handleToggle(category.id)}
                                className={cn(
                                    'relative flex w-full cursor-pointer items-center',
                                    'rounded-md py-2.5 px-3 text-sm outline-hidden select-none',
                                    'transition-colors duration-150',
                                    isSelected
                                        ? 'bg-brand-primary/10 text-brand-primary font-medium'
                                        : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                                )}
                            >
                                <span className="flex-1">{category.label}</span>
                            </div>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
