'use client';

import { memo, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import { Label } from '@/shared/ui/label';
import { Slider } from '@/shared/ui/slider';

/**
 * Константы для фильтра цен
 */
const FIRST_POINT = 1_000;
const SECOND_POINT = 5_000;
const MAX_PRICE = 20_000;
const STEP_LOW = 100;
const STEP_MID = 250;
const STEP_HIGH = 500;

// Конвертация цены в позицию слайдера
const priceToSlider = (price: number): number => {
    if (price <= FIRST_POINT) {
        return (price / FIRST_POINT) * 33.33;
    } else if (price <= SECOND_POINT) {
        const priceAboveFirst = price - FIRST_POINT;
        const rangeFirstToSecond = SECOND_POINT - FIRST_POINT;
        return 33.33 + (priceAboveFirst / rangeFirstToSecond) * 33.33;
    } else {
        const priceAboveSecond = price - SECOND_POINT;
        const rangeSecondToMax = MAX_PRICE - SECOND_POINT;
        return 66.66 + (priceAboveSecond / rangeSecondToMax) * 33.34;
    }
};

// Конвертация позиции слайдера в цену
const sliderToPrice = (position: number): number => {
    if (position <= 33.33) {
        const price = (position / 33.33) * FIRST_POINT;
        return Math.round(price / STEP_LOW) * STEP_LOW;
    } else if (position <= 66.66) {
        const positionInSegment = position - 33.33;
        const priceInSegment = (positionInSegment / 33.33) * (SECOND_POINT - FIRST_POINT);
        const price = FIRST_POINT + priceInSegment;
        return Math.round(price / STEP_MID) * STEP_MID;
    } else {
        const positionInSegment = position - 66.66;
        const priceInSegment = (positionInSegment / 33.34) * (MAX_PRICE - SECOND_POINT);
        const price = SECOND_POINT + priceInSegment;
        return Math.round(price / STEP_HIGH) * STEP_HIGH;
    }
};

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU').format(price);
};

interface PriceFilterMobileProps {
    minPrice?: number;
    maxPrice?: number;
    onMinPriceChange?: (value: number) => void;
    onMaxPriceChange?: (value: number) => void;
}

/**
 * Мобильная версия фильтра цены
 * Может работать как controlled компонент (с пропсами) или использовать глобальный store
 */
export const PriceFilterMobile = memo(({
    minPrice: propMinPrice,
    maxPrice: propMaxPrice,
    onMinPriceChange,
    onMaxPriceChange
}: PriceFilterMobileProps) => {
    const t = useTranslations('filters');
    const { filters, setFilters } = useSearchFilters();

    // Используем пропсы если есть, иначе берём из store
    const minPrice = propMinPrice !== undefined ? propMinPrice : (filters.minPrice || 0);
    const maxPrice = propMaxPrice !== undefined ? propMaxPrice : (filters.maxPrice || MAX_PRICE);

    const isControlled = onMinPriceChange !== undefined && onMaxPriceChange !== undefined;

    // Конвертация локальных цен в позиции слайдера
    const sliderValue = useMemo<[number, number]>(
        () => [priceToSlider(minPrice), priceToSlider(maxPrice)],
        [minPrice, maxPrice]
    );

    // Обработчик изменения слайдера
    const handleSliderChange = useCallback((newValue: number[]) => {
        if (newValue.length !== 2) return;
        const prices: [number, number] = [sliderToPrice(newValue[0]), sliderToPrice(newValue[1])];

        if (isControlled) {
            onMinPriceChange(prices[0]);
            onMaxPriceChange(prices[1]);
        } else {
            setFilters({
                minPrice: prices[0] === 0 ? undefined : prices[0],
                maxPrice: prices[1] === MAX_PRICE ? undefined : prices[1],
            });
        }
    }, [isControlled, onMinPriceChange, onMaxPriceChange, setFilters]);

    // Обработчик полей ввода
    const handleInputChange = useCallback(
        (index: 0 | 1, value: string) => {
            const numValue = parseInt(value) || 0;
            const clampedValue = Math.min(Math.max(numValue, 0), MAX_PRICE);

            let newMin = minPrice;
            let newMax = maxPrice;

            if (index === 0) {
                newMin = clampedValue;
                if (newMin > newMax) newMax = newMin;
            } else {
                newMax = clampedValue;
                if (newMax < newMin) newMin = newMax;
            }

            if (isControlled) {
                onMinPriceChange(newMin);
                onMaxPriceChange(newMax);
            } else {
                setFilters({
                    minPrice: newMin === 0 ? undefined : newMin,
                    maxPrice: newMax === MAX_PRICE ? undefined : newMax,
                });
            }
        },
        [minPrice, maxPrice, isControlled, onMinPriceChange, onMaxPriceChange, setFilters]
    );

    return (
        <div className="space-y-4">
            {/* Поля ввода */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-xs text-text-secondary font-medium">
                        {t('minPrice')}
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                            €
                        </span>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => handleInputChange(0, e.target.value)}
                            className={cn(
                                'w-full h-10 pl-7 pr-3 text-sm rounded-lg transition-colors',
                                'bg-background border border-border',
                                'text-text-primary placeholder:text-text-tertiary',
                                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                            )}
                            placeholder="0"
                            min="0"
                            max={MAX_PRICE}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-text-secondary font-medium">
                        {t('maxPrice')}
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                            €
                        </span>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => handleInputChange(1, e.target.value)}
                            className={cn(
                                'w-full h-10 pl-7 pr-3 text-sm rounded-lg transition-colors',
                                'bg-background border border-border',
                                'text-text-primary placeholder:text-text-tertiary',
                                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                            )}
                            placeholder={MAX_PRICE.toString()}
                            min="0"
                            max={MAX_PRICE}
                        />
                    </div>
                </div>
            </div>

            {/* Слайдер */}
            <div className="space-y-3 pt-2">
                <div className="px-2">
                    <Slider
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        onValueCommit={handleSliderChange}
                        max={100}
                        min={0}
                        step={0.1}
                        aria-label={t('priceRange')}
                    />
                </div>
                <div className="flex justify-between text-xs text-text-tertiary px-1">
                    <span>€0</span>
                    <span>€1k</span>
                    <span>€5k</span>
                    <span>€20k</span>
                </div>
            </div>

            {/* Диапазон */}
            <div className="text-center py-2 px-3 rounded-lg bg-background-secondary">
                <span className="text-sm font-medium text-text-primary">
                    €{formatPrice(minPrice)} - €{formatPrice(maxPrice)}
                </span>
            </div>
        </div>
    );
});

PriceFilterMobile.displayName = 'PriceFilterMobile';
