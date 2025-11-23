'use client';

import { useTranslations } from 'next-intl';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useSearchFilters } from '@/hooks/useSearchFilters';
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
    const { filters, setFilters } = useSearchFilters();

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

    const selectedIds = filters.categoryIds || [];

    const handleToggle = (id: number) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter((i: number) => i !== id)
            : [...selectedIds, id];

        setFilters({ categoryIds: newIds.length > 0 ? newIds : undefined });
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
