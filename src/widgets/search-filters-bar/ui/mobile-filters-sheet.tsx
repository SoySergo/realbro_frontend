'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { X, Loader2 } from 'lucide-react';
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

// Константы
const MAX_PRICE = 20_000;
const MAX_AREA = 500;

interface MobileFiltersSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Мобильная версия панели фильтров с улучшенным UI/UX
 * 
 * Особенности:
 * - Full-screen bottom sheet
 * - Drag handle сверху
 * - Accordion-стиль для категорий фильтров
 * - Sticky footer с динамическим подсчётом результатов
 * - Локальное состояние - изменения применяются только по кнопке "Показать N вариантов"
 * - Touch-friendly размеры элементов (минимум 44px)
 */
export function MobileFiltersSheet({ open, onOpenChange }: MobileFiltersSheetProps) {
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

    // Блокировка скролла body при открытых фильтрах
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

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

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 animate-in fade-in duration-75"
                style={{ zIndex: 110 }}
                onClick={() => onOpenChange(false)}
            />

            {/* Content */}
            <div
                className="fixed inset-0 bg-background flex flex-col animate-in slide-in-from-bottom duration-300"
                style={{ zIndex: 120 }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-2 pb-1 shrink-0">
                    <div className="w-12 h-1 rounded-full bg-text-tertiary" />
                </div>

                {/* Заголовок */}
                <div className="px-4 py-3 border-b border-border shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">{t('title')}</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label={t('cancel')}
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>
                </div>

                {/* Фильтры в вертикальной компоновке со скроллом */}
                <div
                    className="flex-1 overflow-y-auto"
                    onScroll={() => {
                        // Скрываем клавиатуру при скролле на мобильных
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                    }}
                >
                    <div className="flex flex-col">
                        {/* Тип маркера */}
                        <FilterSection id="marker-type" title={t('markerType')}>
                            <div className="px-4">
                                <MarkerTypeFilterMobile
                                    value={localMarkerType}
                                    onChange={setLocalMarkerType}
                                />
                            </div>
                        </FilterSection>

                        {/* Локация */}
                        <FilterSection id="location" title={t('categories.location')}>
                            <div className="px-4">
                                <LocationFilterMobile
                                    value={localLocationMode}
                                    onChange={setLocalLocationMode}
                                    onLaunch={(mode: LocationFilterMode) => {
                                        // Активируем режим на карте и закрываем мобильное окно фильтров
                                        setLocationMode(mode);
                                        onOpenChange(false);
                                    }}
                                />
                            </div>
                        </FilterSection>

                        {/* Категория */}
                        <FilterSection id="category" title={t('category')}>
                            <div className="px-4">
                                <CategoryFilterMobile
                                    value={localCategoryIds}
                                    onChange={setLocalCategoryIds}
                                />
                            </div>
                        </FilterSection>

                        {/* Цена */}
                        <FilterSection id="price" title={t('categories.price')}>
                            <div className="px-4">
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
                            <div className="px-4">
                                <RoomsFilterMobile
                                    value={localRooms}
                                    onChange={setLocalRooms}
                                />
                            </div>
                        </FilterSection>

                        {/* Площадь */}
                        <FilterSection id="area" title={t('categories.area')}>
                            <div className="px-4">
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

                {/* Футер с кнопками "Сбросить" и "Показать N вариантов" */}
                <div className="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border shrink-0 bg-background shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleClear}
                            className="h-11 min-h-[44px] text-text-secondary"
                            variant="ghost"
                            disabled={!hasLocalChanges}
                        >
                            {t('resetAll')}
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="flex-1 h-11 min-h-[44px] bg-brand-primary hover:bg-brand-primary-hover text-white font-medium"
                            variant="default"
                            disabled={isLoadingCount}
                        >
                            {isLoadingCount ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('loading')}
                                </>
                            ) : (
                                <>
                                    {propertiesCount !== null && propertiesCount > 0
                                        ? t('showResults', { count: formatNumber(propertiesCount) })
                                        : propertiesCount === 0
                                        ? t('noResults')
                                        : t('apply')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
