'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { X, Search } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { useFilterStore } from '../model/store';
import { getPropertiesCount } from '@/shared/api';
import { cn } from '@/shared/lib/utils';

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
 * Включает QueryTitleEditor, кнопку "Показать" с счётчиком и кнопку сброса
 *
 * @example
 * <SearchFiltersBar />
 */
function SearchFiltersBarContent() {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const { filtersCount, clearFilters, filters } = useSearchFilters();
    const { currentFilters } = useFilterStore();

    const [propertiesCount, setPropertiesCount] = useState<number | null>(null);
    const [isLoadingCount, setIsLoadingCount] = useState(false);

    // Функция для получения количества объектов
    const fetchPropertiesCount = useCallback(async () => {
        setIsLoadingCount(true);
        try {
            const mergedFilters = { ...filters, ...currentFilters };
            const count = await getPropertiesCount(mergedFilters);
            setPropertiesCount(count);
        } catch (error) {
            console.error('Failed to fetch properties count:', error);
            setPropertiesCount(null);
        } finally {
            setIsLoadingCount(false);
        }
    }, [filters, currentFilters]);

    // Обновляем счётчик при изменении фильтров (с debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPropertiesCount();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [fetchPropertiesCount]);

    const handleReset = () => {
        clearFilters();
        console.log('Filters reset');
    };

    const handleShowResults = () => {
        // Можно добавить дополнительную логику при клике на "Показать"
        // Например, скролл к результатам или открытие сайдбара
        console.log('Show results clicked');
    };

    // Форматирование числа с разделителями
    const formatNumber = (num: number): string => {
        return num.toLocaleString('ru-RU');
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

                {/* Spacer для правой части */}
                <div className="flex-1" />

                {/* Кнопка "Очистить" */}
                {filtersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-text-secondary hover:text-text-primary shrink-0"
                    >
                        <X className="w-4 h-4 mr-1" />
                        {t('clearAll')}
                    </Button>
                )}

                {/* Кнопка "Показать" с счётчиком */}
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleShowResults}
                    disabled={isLoadingCount}
                    className={cn(
                        'bg-brand-primary hover:bg-brand-primary/90 text-white shrink-0',
                        'min-w-[120px] justify-center'
                    )}
                >
                    <Search className="w-4 h-4 mr-2" />
                    {isLoadingCount ? (
                        <span className="animate-pulse">{tCommon('loading')}</span>
                    ) : (
                        <span>
                            {tCommon('showMore').split(' ')[0]} {propertiesCount !== null && formatNumber(propertiesCount)}
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}

export function SearchFiltersBar() {
    return (
        <Suspense fallback={
            <div className="w-full bg-background-secondary border-b border-border">
                <div className="flex items-center gap-2 px-4 py-3">
                    <div className="h-8 w-32 bg-background animate-pulse rounded" />
                </div>
            </div>
        }>
            <SearchFiltersBarContent />
        </Suspense>
    );
}
