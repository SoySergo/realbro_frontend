'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { X } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';


// Импорты фильтров
import { MarkerTypeFilter } from '@/features/marker-type-filter';
import { LocationFilterButton } from '@/features/location-filter';
import { CategoryFilter } from '@/features/category-filter';
import { PriceFilter } from '@/features/price-filter';
import { RoomsFilter } from '@/features/rooms-filter';
import { AreaFilter } from '@/features/area-filter';
import { QueryTitleEditor } from '@/features/query-title-editor';


/**
 * Widget: Панель фильтров поиска недвижимости
 * 
 * Композирует все фильтры в горизонтальную панель с overflow-x-auto
 * Включает QueryTitleEditor и кнопку сброса всех фильтров
 * 
 * @example
 * <SearchFiltersBar />
 */
export function SearchFiltersBar() {
    const t = useTranslations('filters');
    const { filtersCount, clearFilters } = useSearchFilters();

    const handleReset = () => {
        clearFilters();
        console.log('Filters reset');
    };

    return (
        <div className="w-full bg-background-secondary border-b border-border">
            <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
                {/* Название текущей вкладки */}
                <div className="flex items-center gap-2 mr-2">
                    <QueryTitleEditor />
                </div>

                {/* Фильтры */}
                <MarkerTypeFilter />

                <LocationFilterButton />
                <CategoryFilter />
                <PriceFilter />
                <RoomsFilter />
                <AreaFilter />

                {/* Кнопка сброса */}
                {filtersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="ml-auto text-text-secondary hover:text-text-primary"
                    >
                        <X className="w-4 h-4 mr-1" />
                        {t('clearAll')}
                    </Button>
                )}
            </div>
        </div>
    );
}
