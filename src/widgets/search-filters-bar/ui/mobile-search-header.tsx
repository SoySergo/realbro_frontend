'use client';

import { useRef } from 'react';
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

/**
 * Мобильный хедер для страницы поиска
 *
 * Структура:
 * 1. Верхняя строка: кнопка выбора вкладки + кнопка фильтров
 * 2. Горизонтально скроллируемая полоса: ИИ агент, маркеры, сортировка, активные фильтры
 */
export function MobileSearchHeader({ onOpenFilters, className }: MobileSearchHeaderProps) {
    const t = useTranslations('filters');
    const scrollRef = useRef<HTMLDivElement>(null);

    const { filters, setFilters, filtersCount, clearFilter } = useSearchFilters();

    // Типы маркеров
    const markerTypes: { value: MarkerType; label: string }[] = [
        { value: 'all', label: t('markerAll') },
        { value: 'no_view', label: t('markerNoView') },
        { value: 'view', label: t('markerNotViewed') },
        { value: 'like', label: t('markerLiked') },
        { value: 'dislike', label: t('markerDisliked') },
    ];

    // Опции сортировки
    const sortOptions = [
        { value: 'createdAt', label: t('sortDate') },
        { value: 'price', label: t('price') },
        { value: 'area', label: t('area') },
    ];

    const selectedMarkerType = filters.markerType || 'all';
    const selectedSort = filters.sort || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    // Обработчик смены маркера
    const handleMarkerChange = (value: string) => {
        setFilters({ markerType: value as MarkerType });
    };

    // Обработчик смены сортировки
    const handleSortChange = (value: string) => {
        setFilters({ sort: value });
    };

    // Переключение порядка сортировки
    const toggleSortOrder = () => {
        setFilters({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    };

    // Получаем активные фильтры для отображения чипов
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

    // Удаление чипа фильтра
    const handleRemoveChip = (key: string) => {
        if (key === 'price') {
            setFilters({ minPrice: undefined, maxPrice: undefined });
        } else if (key === 'area') {
            setFilters({ minArea: undefined, maxArea: undefined });
        } else {
            clearFilter(key as keyof typeof filters);
        }
    };

    return (
        <div className={cn('bg-background-secondary border-b border-border', className)}>
            {/* Верхняя строка: Выбор вкладки + Фильтры */}
            <div className="flex items-center justify-between px-3 py-2.5 gap-2">
                {/* Компонент выбора вкладки - использует QueriesSelect */}
                <div className="flex-1 min-w-0">
                    <QueriesSelect
                        triggerClassName="h-10 text-base bg-background border border-border rounded-lg px-4 w-full justify-between"
                    />
                </div>

                {/* Кнопка фильтров */}
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

            {/* Горизонтально скроллируемая полоса */}
            <div
                ref={scrollRef}
                className="flex items-center gap-2 px-3 pb-2 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* ИИ Агент */}
                <Button
                    size="sm"
                    className="shrink-0 gap-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white h-8"
                >
                    <FingerprintIcon className="w-4 h-4" />
                    <span className="text-xs">{t('aiAgent')}</span>
                </Button>

                {/* Сортировка */}
                <div className="flex items-center shrink-0">
                    <Select value={selectedSort} onValueChange={handleSortChange}>
                        <SelectTrigger
                            size="sm"
                            className="w-fit h-8 text-xs bg-background border-border rounded-r-none border-r-0"
                        >
                            <SelectValue>
                                {sortOptions.find(s => s.value === selectedSort)?.label}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-xs">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSortOrder}
                        className="h-8 w-8 p-0 rounded-l-none bg-background border-border"
                    >
                        <ArrowUpDown className={cn(
                            'w-3.5 h-3.5',
                            sortOrder === 'asc' && 'rotate-180'
                        )} />
                    </Button>
                </div>

                {/* Активные фильтры (чипы) */}
                {activeFilterChips.map((chip) => (
                    <Button
                        key={chip.key}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveChip(chip.key)}
                        className="shrink-0 h-8 gap-1.5 text-xs bg-background border-border"
                    >
                        <span>{chip.label}</span>
                        <X className="w-3 h-3" />
                    </Button>
                ))}
            </div>
        </div>
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
