'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { X } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MarkerTypeFilterMobile } from '@/features/marker-type-filter';
import { CategoryFilterMobile } from '@/features/category-filter';
import { RoomsFilterMobile } from '@/features/rooms-filter';
import { PriceFilterMobile } from '@/features/price-filter';
import { AreaFilterMobile } from '@/features/area-filter';
import { LocationFilterMobile } from '@/features/location-filter';
import type { LocationFilterMode } from '@/features/location-filter/model';

// Константы
const MAX_PRICE = 20_000;
const MAX_AREA = 500;

interface MobileFiltersSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Мобильная версия панели фильтров
 * Локальное состояние - изменения применяются только по кнопке "Применить"
 */
export function MobileFiltersSheet({ open, onOpenChange }: MobileFiltersSheetProps) {
    const t = useTranslations('filters');
    const { filters, setFilters } = useSearchFilters();

    const { activeLocationMode, setLocationMode } = useFilterStore();

    // Локальное состояние для всех фильтров
    const [localMarkerType, setLocalMarkerType] = useState(filters.markerType || 'all');
    const [localCategoryIds, setLocalCategoryIds] = useState<number[]>(filters.categoryIds || []);
    const [localRooms, setLocalRooms] = useState<number[]>(filters.rooms || []);
    const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || 0);
    const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || MAX_PRICE);
    const [localMinArea, setLocalMinArea] = useState(filters.minArea || 0);
    const [localMaxArea, setLocalMaxArea] = useState(filters.maxArea || MAX_AREA);
    const [localLocationMode, setLocalLocationMode] = useState<LocationFilterMode | null>(activeLocationMode);

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
        // TODO: применить localLocationMode через useFilterStore
        console.log('Filters applied from mobile');
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
        console.log('Local filters cleared');
    };

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-110 animate-in fade-in duration-75"
                onClick={() => onOpenChange(false)}
            />

            {/* Content */}
            <div
                className="fixed inset-0 bg-background z-120 flex flex-col animate-in slide-in-from-bottom duration-75"
            >
                {/* Заголовок */}
                <div className="px-4 py-3 border-b border-border shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">{t('title')}</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>
                </div>

                {/* Фильтры в вертикальной компоновке со скроллом */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="flex flex-col gap-6">
                        {/* Тип маркера */}
                        <div className="w-full">
                            <Label className="text-sm font-medium text-text-primary mb-3 block">
                                {t('markerType')}
                            </Label>
                            <MarkerTypeFilterMobile
                                value={localMarkerType}
                                onChange={setLocalMarkerType}
                            />
                        </div>

                        {/* Локация */}
                        <div className="w-full">
                            <Label className="text-sm font-medium text-text-primary mb-3 block">
                                {t('location')}
                            </Label>
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

                        {/* Категория */}
                        <div className="w-full">
                            <Label className="text-sm font-medium text-text-primary mb-3 block">
                                {t('category')}
                            </Label>
                            <CategoryFilterMobile
                                value={localCategoryIds}
                                onChange={setLocalCategoryIds}
                            />
                        </div>

                        {/* Цена */}
                        <div className="w-full">
                            <Label className="text-sm font-medium text-text-primary mb-3 block">
                                {t('priceRange')}
                            </Label>
                            <PriceFilterMobile
                                minPrice={localMinPrice}
                                maxPrice={localMaxPrice}
                                onMinPriceChange={setLocalMinPrice}
                                onMaxPriceChange={setLocalMaxPrice}
                            />
                        </div>



                        {/* Комнаты */}
                        <div className="w-full">
                            <Label className="text-sm font-medium text-text-primary mb-3 block">
                                {t('rooms')}
                            </Label>
                            <RoomsFilterMobile
                                value={localRooms}
                                onChange={setLocalRooms}
                            />
                        </div>

                        {/* Площадь */}
                        <div className="w-full">
                            <Label className="text-sm font-medium text-text-primary mb-3 block">
                                {t('areaRange')}
                            </Label>
                            <AreaFilterMobile
                                minArea={localMinArea}
                                maxArea={localMaxArea}
                                onMinAreaChange={setLocalMinArea}
                                onMaxAreaChange={setLocalMaxArea}
                            />
                        </div>

                    </div>
                </div>

                {/* Футер с кнопками "Очистить" и "Применить" */}
                <div className="px-4 py-3 border-t border-border shrink-0 bg-background">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleClear}
                            className="flex-1 h-11"
                            variant="ghost"
                            disabled={!hasLocalChanges}
                        >
                            {t('clear')}
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="flex-1 h-11 bg-brand-primary text-white "
                            variant="default"
                        >
                            {t('apply')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
