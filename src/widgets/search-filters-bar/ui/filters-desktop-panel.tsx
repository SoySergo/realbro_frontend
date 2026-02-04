'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { X, Loader2, SlidersHorizontal } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MarkerTypeFilterMobile } from '@/features/marker-type-filter';
import { CategoryFilterMobile } from '@/features/category-filter';
import { RoomsFilterMobile } from '@/features/rooms-filter';
import { PriceFilterMobile } from '@/features/price-filter';
import { AreaFilterMobile } from '@/features/area-filter';
import { LocationFilterMobile } from '@/features/location-filter';
import type { LocationFilterMode } from '@/features/location-filter/model';
import { FilterSection } from './filter-section';
import { getPropertiesCount } from '@/shared/api';
import { cn } from '@/shared/lib/utils';

// Константы
const MAX_PRICE = 20_000;
const MAX_AREA = 500;

interface FiltersDesktopPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Desktop версия панели фильтров с улучшенным UI/UX
 * 
 * Особенности:
 * - Выпадающая панель с анимацией slide down + fade
 * - Sticky header с количеством активных фильтров
 * - Кнопки "Сбросить все" и "Применить"
 * - Разделение фильтров по категориям с возможностью сворачивания
 * - Максимальная высота с прокруткой внутри панели
 * - Поддержка светлой/тёмной темы через CSS variables
 * - Keyboard navigation (Tab, Enter, Escape)
 */
export function FiltersDesktopPanel({ open, onOpenChange }: FiltersDesktopPanelProps) {
    const t = useTranslations('filters');
    const { filters, setFilters } = useSearchFilters();
    const { activeLocationMode, setLocationMode, currentFilters } = useFilterStore();

    // Локальное состояние для всех фильтров
    const [localMarkerType, setLocalMarkerType] = useState(filters.markerType || 'all');
    const [localCategoryIds, setLocalCategoryIds] = useState<number[]>(filters.categoryIds || []);
    const [localRooms, setLocalRooms] = useState<number[]>(filters.rooms || []);
    const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || 0);
    const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || MAX_PRICE);
    const [localMinArea, setLocalMinArea] = useState(filters.minArea || 0);
    const [localMaxArea, setLocalMaxArea] = useState(filters.maxArea || MAX_AREA);
    const [localLocationMode, setLocalLocationMode] = useState<LocationFilterMode | null>(activeLocationMode);

    // Состояние для подсчёта результатов
    const [propertiesCount, setPropertiesCount] = useState<number | null>(null);
    const [isLoadingCount, setIsLoadingCount] = useState(false);

    // Синхронизация локального состояния при открытии
    useEffect(() => {
        if (open) {
            setLocalMarkerType(filters.markerType || 'all');
            setLocalCategoryIds(filters.categoryIds || []);
            setLocalRooms(filters.rooms || []);
            setLocalMinPrice(filters.minPrice || 0);
            setLocalMaxPrice(filters.maxPrice || MAX_PRICE);
            setLocalMinArea(filters.minArea || 0);
            setLocalMaxArea(filters.maxArea || MAX_AREA);
            setLocalLocationMode(activeLocationMode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Функция для получения количества объектов
    const fetchPropertiesCount = useCallback(async () => {
        setIsLoadingCount(true);
        try {
            const mergedFilters = {
                ...currentFilters,
                markerType: localMarkerType !== 'all' ? localMarkerType : undefined,
                categoryIds: localCategoryIds.length > 0 ? localCategoryIds : undefined,
                rooms: localRooms.length > 0 ? localRooms : undefined,
                minPrice: localMinPrice !== 0 ? localMinPrice : undefined,
                maxPrice: localMaxPrice !== MAX_PRICE ? localMaxPrice : undefined,
                minArea: localMinArea !== 0 ? localMinArea : undefined,
                maxArea: localMaxArea !== MAX_AREA ? localMaxArea : undefined,
            };
            const count = await getPropertiesCount(mergedFilters);
            setPropertiesCount(count);
        } catch (error) {
            console.error('Failed to fetch properties count:', error);
            setPropertiesCount(null);
        } finally {
            setIsLoadingCount(false);
        }
    }, [localMarkerType, localCategoryIds, localRooms, localMinPrice, localMaxPrice, localMinArea, localMaxArea, currentFilters]);

    // Обновляем счётчик при изменении фильтров (с debounce)
    useEffect(() => {
        if (open) {
            const timeoutId = setTimeout(() => {
                fetchPropertiesCount();
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [open, fetchPropertiesCount]);

    // Проверка наличия изменений в локальном состоянии
    const hasLocalChanges =
        localMarkerType !== 'all' ||
        localCategoryIds.length > 0 ||
        localRooms.length > 0 ||
        localMinPrice !== 0 ||
        localMaxPrice !== MAX_PRICE ||
        localMinArea !== 0 ||
        localMaxArea !== MAX_AREA ||
        localLocationMode !== null;

    // Подсчёт активных фильтров
    const activeFiltersCount = [
        localMarkerType !== 'all',
        localCategoryIds.length > 0,
        localRooms.length > 0,
        localMinPrice !== 0 || localMaxPrice !== MAX_PRICE,
        localMinArea !== 0 || localMaxArea !== MAX_AREA,
        localLocationMode !== null,
    ].filter(Boolean).length;

    // Применение фильтров
    const handleApply = () => {
        setFilters({
            markerType: localMarkerType !== 'all' ? localMarkerType : undefined,
            categoryIds: localCategoryIds.length > 0 ? localCategoryIds : undefined,
            rooms: localRooms.length > 0 ? localRooms : undefined,
            minPrice: localMinPrice !== 0 ? localMinPrice : undefined,
            maxPrice: localMaxPrice !== MAX_PRICE ? localMaxPrice : undefined,
            minArea: localMinArea !== 0 ? localMinArea : undefined,
            maxArea: localMaxArea !== MAX_AREA ? localMaxArea : undefined,
        });
        onOpenChange(false);
    };

    // Очистка фильтров
    const handleClear = () => {
        setLocalMarkerType('all');
        setLocalCategoryIds([]);
        setLocalRooms([]);
        setLocalMinPrice(0);
        setLocalMaxPrice(MAX_PRICE);
        setLocalMinArea(0);
        setLocalMaxArea(MAX_AREA);
        setLocalLocationMode(null);
    };

    // Форматирование числа с разделителями
    const formatNumber = (num: number): string => {
        return num.toLocaleString('ru-RU');
    };

    // Обработка нажатия Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal по центру */}
            <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-20">
                <div
                    className={cn(
                        'bg-background rounded-xl shadow-2xl w-full max-w-2xl flex flex-col',
                        'animate-in zoom-in-95 fade-in slide-in-from-top-4 duration-200',
                        'max-h-[calc(100vh-10rem)]'
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div className="px-6 py-4 border-b border-border shrink-0 sticky top-0 bg-background rounded-t-xl z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <SlidersHorizontal className="w-5 h-5 text-brand-primary" />
                                <h2 className="text-lg font-semibold text-text-primary">{t('title')}</h2>
                                {activeFiltersCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-brand-primary/10 text-brand-primary rounded-full">
                                        {t('activeFilters', { count: activeFiltersCount })}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-2 rounded-lg hover:bg-background-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                aria-label={t('cancel')}
                            >
                                <X className="w-5 h-5 text-text-secondary" />
                            </button>
                        </div>
                    </div>

                    {/* Фильтры со скроллом */}
                    <div className="flex-1 overflow-y-auto px-6 py-2">
                        <div className="flex flex-col">
                            {/* Тип маркера */}
                            <FilterSection id="marker-type" title={t('markerType')}>
                                <div className="pb-2">
                                    <MarkerTypeFilterMobile
                                        value={localMarkerType}
                                        onChange={setLocalMarkerType}
                                    />
                                </div>
                            </FilterSection>

                            {/* Локация */}
                            <FilterSection id="location" title={t('categories.location')}>
                                <div className="pb-2">
                                    <LocationFilterMobile
                                        value={localLocationMode}
                                        onChange={setLocalLocationMode}
                                        onLaunch={(mode: LocationFilterMode) => {
                                            setLocationMode(mode);
                                            onOpenChange(false);
                                        }}
                                    />
                                </div>
                            </FilterSection>

                            {/* Категория */}
                            <FilterSection id="category" title={t('category')}>
                                <div className="pb-2">
                                    <CategoryFilterMobile
                                        value={localCategoryIds}
                                        onChange={setLocalCategoryIds}
                                    />
                                </div>
                            </FilterSection>

                            {/* Цена */}
                            <FilterSection id="price" title={t('categories.price')}>
                                <div className="pb-2">
                                    <PriceFilterMobile
                                        minPrice={localMinPrice}
                                        maxPrice={localMaxPrice}
                                        onMinPriceChange={setLocalMinPrice}
                                        onMaxPriceChange={setLocalMaxPrice}
                                    />
                                </div>
                            </FilterSection>

                            {/* Комнаты */}
                            <FilterSection id="rooms" title={t('categories.rooms')}>
                                <div className="pb-2">
                                    <RoomsFilterMobile
                                        value={localRooms}
                                        onChange={setLocalRooms}
                                    />
                                </div>
                            </FilterSection>

                            {/* Площадь */}
                            <FilterSection id="area" title={t('categories.area')}>
                                <div className="pb-2">
                                    <AreaFilterMobile
                                        minArea={localMinArea}
                                        maxArea={localMaxArea}
                                        onMinAreaChange={setLocalMinArea}
                                        onMaxAreaChange={setLocalMaxArea}
                                    />
                                </div>
                            </FilterSection>
                        </div>
                    </div>

                    {/* Футер с кнопками */}
                    <div className="px-6 py-4 border-t border-border shrink-0 bg-background rounded-b-xl">
                        <div className="flex gap-3">
                            <Button
                                onClick={handleClear}
                                className="text-text-secondary hover:text-error hover:bg-error/10"
                                variant="ghost"
                                disabled={!hasLocalChanges}
                            >
                                {t('resetAll')}
                            </Button>
                            <Button
                                onClick={handleApply}
                                className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium"
                                variant="default"
                                disabled={isLoadingCount}
                            >
                                {isLoadingCount ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('loading')}
                                    </>
                                ) : (
                                    t('apply')
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
