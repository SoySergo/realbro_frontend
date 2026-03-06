'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckIcon } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import { getCategories, type Category } from '@/shared/api/dictionaries';

// Фолбэк категории
const FALLBACK_CATEGORIES = [
    { id: 1, name: '', code: 'apartment' },
    { id: 2, name: '', code: 'house' },
    { id: 3, name: '', code: 'villa' },
    { id: 4, name: '', code: 'studio' },
    { id: 5, name: '', code: 'penthouse' },
    { id: 6, name: '', code: 'townhouse' },
];

interface CategoryFilterMobileProps {
    value?: number[];
    onChange?: (value: number[]) => void;
}

/**
 * Мобильная версия фильтра категорий недвижимости
 * Отображается как развёрнутый список с чекбоксами (мультиселект)
 * Данные загружаются из API /dictionaries/categories
 */
export function CategoryFilterMobile({ value, onChange }: CategoryFilterMobileProps = {}) {
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

    // Используем переданное значение или берём из store
    const selectedIds = value ?? filters.categoryIds ?? [];

    const handleToggle = (id: number) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter((i: number) => i !== id)
            : [...selectedIds, id];

        if (onChange) {
            // Контролируемый режим - вызываем коллбэк
            onChange(newIds);
        } else {
            // Неконтролируемый режим - обновляем store
            setFilters({
                categoryIds: newIds.length > 0 ? newIds : undefined,
                categories: newIds.length > 0 ? newIds : undefined,
            });
            console.log('Categories updated:', newIds);
        }
    };

    return (
        <div className="space-y-2">
            {categories.map((category) => {
                const isSelected = selectedIds.includes(category.id);

                return (
                    <div
                        key={category.id}
                        onClick={() => handleToggle(category.id)}
                        className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all',
                            'border border-border',
                            isSelected
                                ? 'bg-brand-primary-light border-brand-primary'
                                : 'bg-background hover:bg-background-secondary'
                        )}
                    >
                        <div
                            className={cn(
                                'size-5 shrink-0 rounded-md border shadow-sm transition-all',
                                'flex items-center justify-center',
                                isSelected
                                    ? 'bg-brand-primary border-brand-primary text-white'
                                    : 'border-border bg-background'
                            )}
                        >
                            {isSelected && <CheckIcon className="size-3.5" strokeWidth={2.5} />}
                        </div>
                        <span
                            className={cn(
                                'text-sm font-medium',
                                isSelected ? 'text-brand-primary' : 'text-text-primary'
                            )}
                        >
                            {category.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
