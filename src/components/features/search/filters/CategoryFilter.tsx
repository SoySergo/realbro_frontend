'use client';

import { useTranslations } from 'next-intl';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

/**
 * Фильтр категорий недвижимости
 * Мультиселект для выбора нескольких категорий
 */
export function CategoryFilter() {
    const t = useTranslations('filters');
    const tTypes = useTranslations('propertyTypes');
    const { currentFilters, setFilters } = useFilterStore();

    // TODO: Эти категории должны приходить с бекенда
    // Пока захардкодим для примера
    const categories = [
        { id: 1, label: tTypes('apartment') },
        { id: 2, label: tTypes('house') },
        { id: 3, label: tTypes('villa') },
        { id: 4, label: tTypes('studio') },
        { id: 5, label: tTypes('penthouse') },
        { id: 6, label: tTypes('townhouse') },
    ];

    const selectedIds = currentFilters.categoryIds || [];

    const handleToggle = (id: number) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];

        setFilters({ categoryIds: newIds });
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
                        'border-input focus-visible:border-ring focus-visible:ring-ring/50',
                        'flex h-9 items-center justify-between gap-2 rounded-md border cursor-pointer',
                        'bg-background dark:bg-input/30 dark:hover:bg-input/50',
                        'px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow]',
                        'outline-none focus-visible:ring-[3px] hover:bg-accent/50',
                        selectedCount > 0 && 'bg-brand-primary-light text-brand-primary border-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary dark:border-brand-primary/30'
                    )}
                >
                    {buttonLabel}
                    <ChevronDownIcon className="size-4 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[280px] z-50 p-1"
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
                                    'transition-colors hover:bg-accent hover:text-accent-foreground',
                                    isSelected && 'bg-accent/50'
                                )}
                            >
                                <div
                                    className={cn(
                                        'size-4 shrink-0 rounded-[4px] border shadow-xs transition-all',
                                        'flex items-center justify-center',
                                        isSelected
                                            ? 'bg-brand-primary border-brand-primary text-white dark:text-white'
                                            : 'border-input bg-background dark:bg-input/30'
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
