'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSearchFilters } from '@/hooks/useSearchFilters';


// Импорты фильтров
import { MarkerTypeFilter } from './filters/MarkerTypeFilter';
import { LocationFilter } from './filters/LocationFilter';
import { CategoryFilter } from './filters/CategoryFilter';
import { PriceFilter } from './filters/PriceFilter';
import { RoomsFilter } from './filters/RoomsFilter';
import { AreaFilter } from './filters/AreaFilter';
import { QueryTitleEditor } from './filters/QueryTitleEditor';


/**
 * Компонент панели фильтров поиска недвижимости
 * Горизонтальная панель с кнопками-фильтрами
 */
export function FilterBar() {
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

                <LocationFilter />
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
