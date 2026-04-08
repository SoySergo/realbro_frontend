'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
    Fingerprint,
    SlidersHorizontal,
    MapPin,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth';
import { useFilters } from '@/features/search-filters/model/use-filters';
import { useActiveLocationMode, useSetLocationMode, resolveLocationMode } from '@/features/search-filters/model/use-location-mode';
import { CategoryFilter } from '@/features/category-filter';
import { SubcategoryFilter } from '@/features/subcategory-filter';
import { PriceFilter } from '@/features/price-filter';
import { RoomsFilter } from '@/features/rooms-filter';
import { BathroomsFilter } from '@/features/bathrooms-filter';
import { AreaFilter } from '@/features/area-filter';
import { LocationFilterButton } from '@/features/location-filter';
import { SearchCategorySwitcher, type SearchCategory } from '@/features/search-category';
import { FiltersDesktopPanel } from '@/widgets/search-filters-bar/ui/filters-desktop-panel';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import type { MarkerType } from '@/entities/filter';

const markerOptions: { value: MarkerType; labelKey: string }[] = [
    { value: 'all', labelKey: 'all' },
    { value: 'like', labelKey: 'like' },
    { value: 'dislike', labelKey: 'dislike' },
    { value: 'view', labelKey: 'view' },
    { value: 'no_view', labelKey: 'noView' },
    { value: 'saved', labelKey: 'saved' },
    { value: 'to_review', labelKey: 'toReview' },
    { value: 'to_think', labelKey: 'toThink' },
];

/**
 * CatalogFiltersToolbar — горизонтальная панель фильтров для каталога.
 *
 * Sticky-панель с адаптивным набором фильтров:
 * - На узких desktop-экранах: категория + кнопки локации/фильтров
 * - На широких: категория, подкатегория, цена, комнаты, ванные, площадь
 */
export function CatalogFiltersToolbar() {
    const t = useTranslations('filters');
    const locale = useLocale();
    const { isAuthenticated } = useAuth();
    const { filters, setFilters, filtersCount } = useFilters();
    const activeLocationMode = useActiveLocationMode();
    const setLocationMode = useSetLocationMode();

    const [currentCategory, setCurrentCategory] = useState<SearchCategory>('properties');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const locationCount = useMemo(() => {
        return (filters.polygonIds?.length ?? 0)
            + (filters.isochroneIds?.length ?? 0)
            + (filters.radiusIds?.length ?? 0)
            + (filters.adminLevel2?.length ?? 0)
            + (filters.adminLevel4?.length ?? 0)
            + (filters.adminLevel6?.length ?? 0)
            + (filters.adminLevel7?.length ?? 0)
            + (filters.adminLevel8?.length ?? 0)
            + (filters.adminLevel9?.length ?? 0)
            + (filters.adminLevel10?.length ?? 0);
    }, [filters]);

    return (
        <>
            <div className="hidden slug-desktop:flex items-center gap-1.5 px-4 py-3 border-b border-border bg-background sticky top-0 z-40">
                {/* AI Agent */}
                <button
                    className={cn(
                        'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                        'bg-brand-primary text-white',
                        'hover:bg-brand-primary-hover transition-colors'
                    )}
                >
                    <Fingerprint className="w-5 h-5" />
                </button>

                {/* Маркеры (auth only) */}
                {isAuthenticated && (
                    <div className="shrink-0">
                        <Select
                            value={filters.markerType || 'all'}
                            onValueChange={(value) =>
                                setFilters({ markerType: value as MarkerType })
                            }
                        >
                            <SelectTrigger className="h-9 w-[160px] text-sm border-border">
                                <SelectValue>
                                    {t(`markerType.${filters.markerType || 'all'}`) || t('markerAll')}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {markerOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {t(`markerType.${opt.labelKey}`) || opt.labelKey}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Раздел + адаптивные фильтры */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                    <div className="shrink-0 w-[180px]">
                        <SearchCategorySwitcher
                            currentCategory={currentCategory}
                            locale={locale}
                            className="h-9"
                        />
                    </div>
                    {/* Локация — с 900px */}
                    <div className="hidden filters-1:block shrink-0">
                        <LocationFilterButton />
                    </div>
                    {/* Категория — с 1100px */}
                    <div className="hidden filters-2:block shrink-0">
                        <CategoryFilter />
                    </div>
                    {/* Подкатегория — с 1100px */}
                    <SubcategoryFilter className="hidden filters-2:block shrink-0" />
                    {/* Цена — с 1200px */}
                    <div className="hidden filters-3:block shrink-0">
                        <PriceFilter />
                    </div>
                    {/* Комнаты — с 1300px */}
                    <div className="hidden filters-4:block shrink-0">
                        <RoomsFilter />
                    </div>
                    {/* Ванные — с 1300px */}
                    <div className="hidden filters-4:block shrink-0">
                        <BathroomsFilter />
                    </div>
                    {/* Площадь — с 1536px */}
                    <div className="hidden 2xl:block shrink-0">
                        <AreaFilter />
                    </div>
                </div>

                {/* Локация + фильтры */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => {
                            if (activeLocationMode) {
                                setLocationMode(null);
                            } else {
                                setLocationMode(resolveLocationMode(filters));
                            }
                        }}
                        className={cn(
                            'relative w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-all duration-200',
                            'filters-1:hidden',
                            activeLocationMode
                                ? 'bg-brand-primary text-white border border-brand-primary hover:bg-brand-primary-hover'
                                : 'border border-border bg-background text-text-secondary hover:text-brand-primary hover:bg-background-secondary'
                        )}
                    >
                        <MapPin className="w-4 h-4" />
                        {locationCount > 0 && !activeLocationMode && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-brand-primary rounded-full">
                                {locationCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsFiltersOpen(true)}
                        className={cn(
                            'relative w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                            'border border-border bg-background',
                            'text-text-secondary hover:text-brand-primary hover:bg-background-secondary',
                            'transition-colors'
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {filtersCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-brand-primary rounded-full">
                                {filtersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Панель "Все фильтры" */}
            <FiltersDesktopPanel
                open={isFiltersOpen}
                onOpenChange={setIsFiltersOpen}
                currentCategory={currentCategory}
                onCategoryChange={setCurrentCategory}
            />
        </>
    );
}
