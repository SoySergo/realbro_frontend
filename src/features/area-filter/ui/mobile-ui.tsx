'use client';

import { memo, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import { Label } from '@/shared/ui/label';
import { Slider } from '@/shared/ui/slider';

/**
 * Константы для фильтра площади
 */
const FIRST_POINT = 100;
const SECOND_POINT = 300;
const MAX_AREA = 500;
const STEP_LOW = 5;
const STEP_MID = 10;
const STEP_HIGH = 25;

// Конвертация площади в позицию слайдера
const areaToSlider = (area: number): number => {
    if (area <= FIRST_POINT) {
        return (area / FIRST_POINT) * 33.33;
    } else if (area <= SECOND_POINT) {
        const areaAboveFirst = area - FIRST_POINT;
        const rangeFirstToSecond = SECOND_POINT - FIRST_POINT;
        return 33.33 + (areaAboveFirst / rangeFirstToSecond) * 33.33;
    } else {
        const areaAboveSecond = area - SECOND_POINT;
        const rangeSecondToMax = MAX_AREA - SECOND_POINT;
        return 66.66 + (areaAboveSecond / rangeSecondToMax) * 33.34;
    }
};

// Конвертация позиции слайдера в площадь
const sliderToArea = (position: number): number => {
    if (position <= 33.33) {
        const area = (position / 33.33) * FIRST_POINT;
        return Math.round(area / STEP_LOW) * STEP_LOW;
    } else if (position <= 66.66) {
        const positionInSegment = position - 33.33;
        const areaInSegment = (positionInSegment / 33.33) * (SECOND_POINT - FIRST_POINT);
        const area = FIRST_POINT + areaInSegment;
        return Math.round(area / STEP_MID) * STEP_MID;
    } else {
        const positionInSegment = position - 66.66;
        const areaInSegment = (positionInSegment / 33.34) * (MAX_AREA - SECOND_POINT);
        const area = SECOND_POINT + areaInSegment;
        return Math.round(area / STEP_HIGH) * STEP_HIGH;
    }
};

interface AreaFilterMobileProps {
    minArea?: number;
    maxArea?: number;
    onMinAreaChange?: (value: number) => void;
    onMaxAreaChange?: (value: number) => void;
}

/**
 * Мобильная версия фильтра площади
 * Может работать как controlled компонент (с пропсами) или использовать глобальный store
 */
export const AreaFilterMobile = memo(({
    minArea: propMinArea,
    maxArea: propMaxArea,
    onMinAreaChange,
    onMaxAreaChange
}: AreaFilterMobileProps) => {
    const t = useTranslations('filters');
    const { filters, setFilters } = useSearchFilters();

    // Используем пропсы если есть, иначе берём из store
    const minArea = propMinArea !== undefined ? propMinArea : (filters.minArea || 0);
    const maxArea = propMaxArea !== undefined ? propMaxArea : (filters.maxArea || MAX_AREA);

    const isControlled = onMinAreaChange !== undefined && onMaxAreaChange !== undefined;

    // Конвертация в позиции слайдера
    const sliderValue = useMemo<[number, number]>(
        () => [areaToSlider(minArea), areaToSlider(maxArea)],
        [minArea, maxArea]
    );

    // Обработчик изменения слайдера
    const handleSliderChange = useCallback((newValue: number[]) => {
        if (newValue.length !== 2) return;
        const areas: [number, number] = [sliderToArea(newValue[0]), sliderToArea(newValue[1])];

        if (isControlled) {
            onMinAreaChange(areas[0]);
            onMaxAreaChange(areas[1]);
        } else {
            setFilters({
                minArea: areas[0] === 0 ? undefined : areas[0],
                maxArea: areas[1] === MAX_AREA ? undefined : areas[1],
            });
        }
    }, [isControlled, onMinAreaChange, onMaxAreaChange, setFilters]);

    // Обработчик полей ввода
    const handleInputChange = useCallback(
        (index: 0 | 1, value: string) => {
            const numValue = parseInt(value) || 0;
            const clampedValue = Math.min(Math.max(numValue, 0), MAX_AREA);

            let newMin = minArea;
            let newMax = maxArea;

            if (index === 0) {
                newMin = clampedValue;
                if (newMin > newMax) newMax = newMin;
            } else {
                newMax = clampedValue;
                if (newMax < newMin) newMin = newMax;
            }

            if (isControlled) {
                onMinAreaChange(newMin);
                onMaxAreaChange(newMax);
            } else {
                setFilters({
                    minArea: newMin === 0 ? undefined : newMin,
                    maxArea: newMax === MAX_AREA ? undefined : newMax,
                });
            }
        },
        [minArea, maxArea, isControlled, onMinAreaChange, onMaxAreaChange, setFilters]
    );

    return (
        <div className="space-y-4">
            {/* Поля ввода */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-xs text-text-secondary font-medium">
                        {t('minArea')}
                    </Label>
                    <div className="relative">
                        <input
                            type="number"
                            value={minArea}
                            onChange={(e) => handleInputChange(0, e.target.value)}
                            className={cn(
                                'w-full h-10 pl-3 pr-10 text-sm rounded-lg transition-colors',
                                'bg-background border border-border',
                                'text-text-primary placeholder:text-text-tertiary',
                                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                            )}
                            placeholder="0"
                            min="0"
                            max={MAX_AREA}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                            м²
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs text-text-secondary font-medium">
                        {t('maxArea')}
                    </Label>
                    <div className="relative">
                        <input
                            type="number"
                            value={maxArea}
                            onChange={(e) => handleInputChange(1, e.target.value)}
                            className={cn(
                                'w-full h-10 pl-3 pr-10 text-sm rounded-lg transition-colors',
                                'bg-background border border-border',
                                'text-text-primary placeholder:text-text-tertiary',
                                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent'
                            )}
                            placeholder={MAX_AREA.toString()}
                            min="0"
                            max={MAX_AREA}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                            м²
                        </span>
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
                        aria-label={t('areaRange')}
                    />
                </div>
                <div className="flex justify-between text-xs text-text-tertiary px-1">
                    <span>0 м²</span>
                    <span>100 м²</span>
                    <span>300 м²</span>
                    <span>500 м²</span>
                </div>
            </div>

            {/* Диапазон */}
            <div className="text-center py-2 px-3 rounded-lg bg-background-secondary">
                <span className="text-sm font-medium text-text-primary">
                    {minArea} - {maxArea} м²
                </span>
            </div>
        </div>
    );
});

AreaFilterMobile.displayName = 'AreaFilterMobile';
