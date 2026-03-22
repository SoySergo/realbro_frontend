'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { CheckIcon } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import { getSubcategories, type Subcategory } from '@/shared/api/dictionaries';

interface SubcategoryFilterMobileProps {
    value?: number[];
    onChange?: (value: number[]) => void;
    categoryIds?: number[];
}

/**
 * Мобильная версия фильтра подкатегорий недвижимости
 * Отображается как развёрнутый список с чекбоксами (мультиселект)
 * Данные загружаются из API /dictionaries/categories/:id/subcategories
 */
export function SubcategoryFilterMobile({ value, onChange, categoryIds }: SubcategoryFilterMobileProps = {}) {
    const locale = useLocale();
    const { filters, setFilters } = useSearchFilters();

    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(false);

    // Стабильный ключ для выбранных категорий
    const resolvedCategoryIds = categoryIds || filters.categoryIds || [];
    const categoryIdsKey = resolvedCategoryIds.slice().sort().join(',');

    const prevKeyRef = useRef(categoryIdsKey);
    useEffect(() => {
        if (categoryIdsKey === '') {
            setSubcategories([]);
            prevKeyRef.current = '';
            return;
        }

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

    const items = subcategories.map(s => ({
        id: s.id,
        label: s.translated_name || s.slug,
    }));

    const selectedIds = value ?? filters.subCategories ?? [];

    const handleToggle = useCallback((id: number) => {
        const current = value ?? filters.subCategories ?? [];
        const newIds = current.includes(id)
            ? current.filter((i: number) => i !== id)
            : [...current, id];

        if (onChange) {
            onChange(newIds);
        } else {
            setFilters({
                subCategories: newIds.length > 0 ? newIds : undefined,
            });
        }
    }, [value, filters.subCategories, onChange, setFilters]);

    if (resolvedCategoryIds.length === 0 || (items.length === 0 && !loading)) {
        return null;
    }

    return (
        <div className="space-y-2">
            {loading ? (
                <div className="py-3 text-sm text-text-secondary text-center">
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
                                {item.label}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
}
