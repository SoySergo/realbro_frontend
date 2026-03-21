'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDownIcon } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
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
 * Данные загружаются из API /dictionaries/categories
 *
 * Выбор хранится локально, пушится в URL только при закрытии дропдауна.
 */
export function CategoryFilter() {
    const t = useTranslations('filters');
    const tTypes = useTranslations('propertyTypes');
    const locale = useLocale();
    const { filters, setFilters } = useSearchFilters();

    const [apiCategories, setApiCategories] = useState<Category[]>([]);
    // Локальный стейт выбранных категорий (не трогает URL до закрытия)
    const [localIds, setLocalIds] = useState<number[]>(filters.categoryIds || []);
    const [open, setOpen] = useState(false);
    const prevFilterIds = useRef(filters.categoryIds);

    // Загружаем категории из API
    useEffect(() => {
        getCategories(locale).then(setApiCategories);
    }, [locale]);

    // Синхронизируем локальный стейт, если фильтры изменились извне (сброс, URL навигация)
    useEffect(() => {
        const incoming = filters.categoryIds || [];
        if (prevFilterIds.current !== filters.categoryIds) {
            prevFilterIds.current = filters.categoryIds;
            setLocalIds(incoming);
        }
    }, [filters.categoryIds]);

    // При открытии — синхронизируем локальный стейт с текущими фильтрами
    // При закрытии — пушим локальный выбор в URL
    const handleOpenChange = useCallback((nextOpen: boolean) => {
        if (nextOpen) {
            setLocalIds(filters.categoryIds || []);
        } else {
            // Пушим только если реально изменилось
            const current = filters.categoryIds || [];
            const changed =
                localIds.length !== current.length ||
                localIds.some((id) => !current.includes(id));

            if (changed) {
                setFilters({
                    categoryIds: localIds.length > 0 ? localIds : undefined,
                    categories: localIds.length > 0 ? localIds : undefined,
                });
            }
        }
        setOpen(nextOpen);
    }, [filters.categoryIds, localIds, setFilters]);

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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
