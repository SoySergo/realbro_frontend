'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { getSubcategories, type Subcategory } from '@/shared/api/dictionaries';

/**
 * Фильтр подкатегорий недвижимости
 * Мультиселект — загружает подкатегории для выбранных категорий
 * Данные загружаются из API /dictionaries/categories/:id/subcategories
 */
export interface SubcategoryFilterProps {
    className?: string;
}

export function SubcategoryFilter({ className }: SubcategoryFilterProps) {
    const t = useTranslations('filters');
    const locale = useLocale();
    const { filters, setFilters } = useSearchFilters();

    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(false);

    // Стабильный ключ для выбранных категорий (не пересоздаётся на каждый рендер)
    const categoryIds = filters.categories || filters.categoryIds || [];
    const categoryIdsKey = categoryIds.slice().sort().join(',');

    // Загружаем подкатегории только когда меняются категории или локаль
    const prevKeyRef = useRef(categoryIdsKey);
    useEffect(() => {
        if (categoryIdsKey === '') {
            setSubcategories([]);
            prevKeyRef.current = '';
            return;
        }

        // Не перезагружаем если ключ не изменился
        if (prevKeyRef.current === categoryIdsKey) return;
        prevKeyRef.current = categoryIdsKey;

        setLoading(true);
        const ids = categoryIdsKey.split(',').map(Number);
        Promise.all(
            ids.map(id => getSubcategories(id, locale))
        )
            .then(results => {
                setSubcategories(results.flat());
            })
            .finally(() => setLoading(false));
    }, [categoryIdsKey, locale]);

    const items = useMemo(() => subcategories.map(s => ({
        id: s.id,
        label: s.translated_name || s.slug,
    })), [subcategories]);

    const selectedIds = filters.sub_categories || [];

    const handleToggle = useCallback((id: number) => {
        const current = filters.sub_categories || [];
        const newIds = current.includes(id)
            ? current.filter((i: number) => i !== id)
            : [...current, id];

        setFilters({
            sub_categories: newIds.length > 0 ? newIds : undefined,
        });
    }, [filters.sub_categories, setFilters]);

    // Не показываем, если нет категорий или нет подкатегорий
    if (categoryIds.length === 0 || (items.length === 0 && !loading)) {
        return null;
    }

    // Формируем лейбл кнопки с именами выбранных подкатегорий
    const selectedCount = selectedIds.length;
    let buttonLabel: string;
    if (selectedCount > 0) {
        const selectedNames = items
            .filter(item => selectedIds.includes(item.id))
            .map(item => item.label);
        const joined = selectedNames.join(', ');
        buttonLabel = joined.length > 24 ? joined.slice(0, 22) + '…' : joined;
    } else {
        buttonLabel = t('subcategory');
    }

    return (
        <div className={className}>
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className={cn(
                            'max-w-[160px] cursor-pointer',
                        'bg-background',
                        'border border-border dark:border-transparent',
                        'text-text-primary hover:text-text-primary',
                        'h-9 px-3 py-2 rounded-md text-sm',
                        'flex items-center justify-between gap-2',
                        'transition-all duration-200',
                        selectedCount > 0 && 'text-text-primary'
                    )}
                >
                    <span className="truncate">{buttonLabel}</span>
                    <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'w-[280px] z-50 p-1',
                    'bg-background',
                    'border border-border dark:border-border',
                    'shadow-lg'
                )}
                align="start"
            >
                <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="py-3 px-2 text-sm text-text-secondary text-center">
                            Loading...
                        </div>
                    ) : (
                        items.map((item) => {
                            const isSelected = selectedIds.includes(item.id);

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleToggle(item.id)}
                                    className={cn(
                                        'relative flex w-full cursor-pointer items-center gap-2.5',
                                        'rounded-sm py-2 px-2 text-sm outline-hidden select-none',
                                        'text-text-secondary',
                                        'hover:bg-brand-primary-light hover:text-brand-primary',
                                        'dark:hover:bg-brand-primary dark:hover:text-white',
                                        'transition-colors duration-150',
                                        isSelected && 'text-brand-primary'
                                    )}
                                >
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
                                    <span className="flex-1">{item.label}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
        </div>
    );
}
