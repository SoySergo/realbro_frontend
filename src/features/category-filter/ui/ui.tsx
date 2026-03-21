'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDownIcon } from 'lucide-react';
import { useFilterStore, useCurrentFilters } from '@/widgets/search-filters-bar';
import { cn } from '@/shared/lib/utils';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';
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
 *
 * Выбор хранится локально. По кнопке «Применить» — пушится в стор.
 * При клике вне дропдауна — изменения отменяются.
 */
export function CategoryFilter() {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const tTypes = useTranslations('propertyTypes');
    const locale = useLocale();
    const currentFilters = useCurrentFilters();
    const storeSetFilters = useFilterStore((s) => s.setFilters);

    const [apiCategories, setApiCategories] = useState<Category[]>([]);
    const [localIds, setLocalIds] = useState<number[]>(currentFilters.categoryIds || []);
    const [open, setOpen] = useState(false);
    const prevFilterIds = useRef(currentFilters.categoryIds);

    // Загружаем категории из API
    useEffect(() => {
        getCategories(locale).then(setApiCategories);
    }, [locale]);

    // Синхронизируем локальный стейт, если фильтры изменились извне (сброс, другой компонент)
    useEffect(() => {
        const incoming = currentFilters.categoryIds || [];
        if (prevFilterIds.current !== currentFilters.categoryIds) {
            prevFilterIds.current = currentFilters.categoryIds;
            setLocalIds(incoming);
        }
    }, [currentFilters.categoryIds]);

    // При открытии — синхронизируем. При закрытии (клик вне) — отменяем изменения.
    const handleOpenChange = useCallback((nextOpen: boolean) => {
        if (nextOpen) {
            setLocalIds(currentFilters.categoryIds || []);
        } else {
            // Клик вне дропдауна — откатываем к текущим фильтрам
            setLocalIds(currentFilters.categoryIds || []);
        }
        setOpen(nextOpen);
    }, [currentFilters.categoryIds]);

    // Кнопка «Применить» — пушим и закрываем
    const handleApply = useCallback(() => {
        const current = currentFilters.categoryIds || [];
        const changed =
            localIds.length !== current.length ||
            localIds.some((id) => !current.includes(id));

        if (changed) {
            storeSetFilters({
                categoryIds: localIds.length > 0 ? localIds : undefined,
                categories: localIds.length > 0 ? localIds : undefined,
            });
        }
        setOpen(false);
    }, [currentFilters.categoryIds, localIds, storeSetFilters]);

    // Используем API категории если есть, иначе фолбэк
    const categories = apiCategories.length > 0
        ? apiCategories.map(c => ({ id: c.id, label: c.translated_name || tTypes(c.slug as Parameters<typeof tTypes>[0]) }))
        : FALLBACK_CATEGORIES.map(c => ({ id: c.id, label: tTypes(c.code as Parameters<typeof tTypes>[0]) }));

    const handleToggle = useCallback((id: number) => {
        setLocalIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }, []);

    const selectedCount = localIds.length;
    let buttonLabel: string;
    if (selectedCount > 0) {
        const selectedNames = categories
            .filter(c => localIds.includes(c.id))
            .map(c => c.label);
        const joined = selectedNames.join(', ');
        buttonLabel = joined.length > 24 ? joined.slice(0, 22) + '…' : joined;
    } else {
        buttonLabel = t('category');
    }

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[220px] p-1.5"
                align="start"
            >
                {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                        key={category.id}
                        checked={localIds.includes(category.id)}
                        onCheckedChange={() => handleToggle(category.id)}
                        onSelect={(e) => e.preventDefault()}
                        className={cn(
                            'cursor-pointer rounded-md py-2.5 text-sm',
                            localIds.includes(category.id)
                                ? 'text-brand-primary font-medium'
                                : 'text-text-secondary'
                        )}
                    >
                        {category.label}
                    </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <button
                    onClick={handleApply}
                    className="w-full h-8 rounded-md text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors cursor-pointer"
                >
                    {tCommon('apply')}
                </button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
