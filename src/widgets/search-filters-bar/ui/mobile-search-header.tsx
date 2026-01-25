'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import {
    SlidersHorizontal,
    FingerprintIcon,
    ArrowUpDown,
    X,
    Map,
    List,
} from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { useFilterStore } from '../model/store';
import { QueriesSelect } from '@/widgets/sidebar/ui/queries-select';
import { cn } from '@/shared/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import type { MarkerType } from '@/entities/filter';

type MobileSearchHeaderProps = {
    onOpenFilters: () => void;
    className?: string;
};

// Высота основного хедера
const HEADER_HEIGHT = 56;

/**
 * Мобильный хедер для страницы поиска
 */
export function MobileSearchHeader({ onOpenFilters, className }: MobileSearchHeaderProps) {
    const { filtersCount } = useSearchFilters();
    const { searchViewMode } = useFilterStore();

    const isMapMode = searchViewMode === 'map';

    return (
        <div className={cn('', className)}>
            {/* Фиксированный хедер */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background-secondary border-b border-border">
                <div className="flex items-center justify-between px-3 py-2 gap-2">
                    <div className="flex-1 min-w-0">
                        <QueriesSelect
                            triggerClassName="h-10 text-base bg-background border border-border rounded-lg px-4 w-full justify-between"
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={onOpenFilters}
                        className={cn(
                            'h-10 gap-2 bg-background border-border shrink-0 relative',
                            filtersCount > 0 && 'border-brand-primary text-brand-primary'
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {filtersCount > 0 && (
                            <span className="bg-brand-primary absolute -top-1 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {filtersCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Отступ для фиксированного хедера */}
            <div style={{ height: HEADER_HEIGHT }} />

            {/* Плавающий блок фильтров */}
            <MobileFiltersFloatingBar isMapMode={isMapMode} />
        </div>
    );
}

type MobileFiltersFloatingBarProps = {
    isMapMode: boolean;
};

/**
 * Плавающий блок с фильтрами
 * - В режиме карты: всегда поверх карты, без фона
 * - В режиме списка: sticky под хедером, скрывается при скролле вниз
 */
function MobileFiltersFloatingBar({ isMapMode }: MobileFiltersFloatingBarProps) {
    const t = useTranslations('filters');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { filters, setFilters, clearFilter } = useSearchFilters();

    // Состояние видимости (только для режима списка)
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    const sortOptions = [
        { value: 'createdAt', label: t('sortDate') },
        { value: 'price', label: t('price') },
        { value: 'area', label: t('area') },
    ];

    const selectedSort = filters.sort || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const handleSortChange = (value: string) => {
        setFilters({ sort: value });
    };

    const toggleSortOrder = () => {
        setFilters({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    };

    // Активные фильтры
    const activeFilterChips: { key: string; label: string }[] = [];

    if (filters.categoryIds && filters.categoryIds.length > 0) {
        activeFilterChips.push({ key: 'categoryIds', label: `${t('category')}: ${filters.categoryIds.length}` });
    }
    if (filters.minPrice || filters.maxPrice) {
        const priceLabel = filters.minPrice && filters.maxPrice
            ? `${filters.minPrice}-${filters.maxPrice}€`
            : filters.minPrice
                ? `от ${filters.minPrice}€`
                : `до ${filters.maxPrice}€`;
        activeFilterChips.push({ key: 'price', label: priceLabel });
    }
    if (filters.rooms && filters.rooms.length > 0) {
        activeFilterChips.push({ key: 'rooms', label: `${t('rooms')}: ${filters.rooms.join(', ')}` });
    }
    if (filters.minArea || filters.maxArea) {
        const areaLabel = filters.minArea && filters.maxArea
            ? `${filters.minArea}-${filters.maxArea} м²`
            : filters.minArea
                ? `от ${filters.minArea} м²`
                : `до ${filters.maxArea} м²`;
        activeFilterChips.push({ key: 'area', label: areaLabel });
    }

    const handleRemoveChip = (key: string) => {
        if (key === 'price') {
            setFilters({ minPrice: undefined, maxPrice: undefined });
        } else if (key === 'area') {
            setFilters({ minArea: undefined, maxArea: undefined });
        } else {
            clearFilter(key as keyof typeof filters);
        }
    };

    // Обработчик скролла (только для режима списка)
    const handleScroll = useCallback(() => {
        if (isMapMode || ticking.current) return;

        ticking.current = true;
        requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const scrollDiff = currentScrollY - lastScrollY.current;

            // Скролл вниз > 5px - скрываем, вверх - показываем
            if (scrollDiff > 5) {
                setIsVisible(false);
            } else if (scrollDiff < -5) {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
            ticking.current = false;
        });
    }, [isMapMode]);

    // Сброс видимости при смене режима
    useEffect(() => {
        if (isMapMode) return;

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll, isMapMode]);

    // Показываем панель при переключении в режим карты
    useEffect(() => {
        if (isMapMode) {
            lastScrollY.current = 0;
        }
    }, [isMapMode]);

    // Режим карты: фиксированный поверх карты, без фона
    if (isMapMode) {
        return (
            <div
                className="fixed left-0 right-0 z-40 pointer-events-none"
                style={{ top: HEADER_HEIGHT }}
            >
                <div
                    ref={scrollContainerRef}
                    className="flex items-center gap-2 px-3 py-2 overflow-x-auto pointer-events-auto"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <FilterButtons
                        t={t}
                        sortOptions={sortOptions}
                        selectedSort={selectedSort}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        onToggleSortOrder={toggleSortOrder}
                        activeFilterChips={activeFilterChips}
                        onRemoveChip={handleRemoveChip}
                        withShadow
                    />
                </div>
            </div>
        );
    }

    // Режим списка: fixed с анимацией скрытия
    return (
        <>
            {/* Плейсхолдер для отступа контента */}
            <div className="h-[52px]" />

            {/* Фиксированная панель */}
            <div
                className={cn(
                    'fixed left-0 right-0 z-40 transition-transform duration-200 ease-out',
                    isVisible ? 'translate-y-0' : '-translate-y-full'
                )}
                style={{ top: HEADER_HEIGHT }}
            >
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto bg-background-secondary/95 backdrop-blur-sm border-b border-border"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <div className="flex items-center gap-2 px-3 py-2 w-max min-w-full">
                        <FilterButtons
                            t={t}
                            sortOptions={sortOptions}
                            selectedSort={selectedSort}
                            sortOrder={sortOrder}
                            onSortChange={handleSortChange}
                            onToggleSortOrder={toggleSortOrder}
                            activeFilterChips={activeFilterChips}
                            onRemoveChip={handleRemoveChip}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

type FilterButtonsProps = {
    t: (key: string) => string;
    sortOptions: { value: string; label: string }[];
    selectedSort: string;
    sortOrder: string;
    onSortChange: (value: string) => void;
    onToggleSortOrder: () => void;
    activeFilterChips: { key: string; label: string }[];
    onRemoveChip: (key: string) => void;
    withShadow?: boolean;
};

/**
 * Кнопки фильтров - вынесены отдельно для переиспользования
 */
function FilterButtons({
    t,
    sortOptions,
    selectedSort,
    sortOrder,
    onSortChange,
    onToggleSortOrder,
    activeFilterChips,
    onRemoveChip,
    withShadow = false,
}: FilterButtonsProps) {
    const shadowClass = withShadow ? 'shadow-md' : '';

    return (
        <>
            {/* ИИ Агент */}
            <Button
                className={cn(
                    'shrink-0 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white h-9 px-4',
                    shadowClass
                )}
            >
                <FingerprintIcon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{t('aiAgent')}</span>
            </Button>

            {/* Сортировка */}
            <div className={cn('flex items-center shrink-0', shadowClass && 'shadow-md rounded-lg')}>
                <Select value={selectedSort} onValueChange={onSortChange}>
                    <SelectTrigger
                        className="w-fit h-9 text-sm bg-background border-border rounded-r-none border-r-0 px-3"
                    >
                        <SelectValue>
                            {sortOptions.find(s => s.value === selectedSort)?.label}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-sm">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={onToggleSortOrder}
                    className="h-9 w-9 p-0 rounded-l-none bg-background border-border"
                >
                    <ArrowUpDown className={cn(
                        'w-4 h-4',
                        sortOrder === 'asc' && 'rotate-180'
                    )} />
                </Button>
            </div>

            {/* Активные фильтры */}
            {activeFilterChips.map((chip) => (
                <Button
                    key={chip.key}
                    variant="outline"
                    onClick={() => onRemoveChip(chip.key)}
                    className={cn(
                        'shrink-0 h-9 gap-2 text-sm bg-background border-border px-3',
                        shadowClass
                    )}
                >
                    <span className="whitespace-nowrap">{chip.label}</span>
                    <X className="w-3.5 h-3.5 shrink-0" />
                </Button>
            ))}
        </>
    );
}

/**
 * Плавающая кнопка переключения карта/список
 */
export function MobileViewToggle() {
    const t = useTranslations('filters');
    const { searchViewMode, toggleSearchViewMode } = useFilterStore();

    const isMapMode = searchViewMode === 'map';

    return (
        <Button
            onClick={toggleSearchViewMode}
            className={cn(
                'fixed left-4 bottom-20 z-40 gap-2 shadow-lg',
                'bg-brand-primary hover:bg-brand-primary/90 text-white',
                'h-10 px-4 rounded-lg'
            )}
        >
            {isMapMode ? (
                <>
                    <List className="w-5 h-5" />
                    <span className="font-medium">{t('viewList')}</span>
                </>
            ) : (
                <>
                    <Map className="w-5 h-5" />
                    <span className="font-medium">{t('viewMap')}</span>
                </>
            )}
        </Button>
    );
}
