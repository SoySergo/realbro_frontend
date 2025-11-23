'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

/**
 * Фильтр площади с тремя сегментами
 * 0-33% = 0-100м² (шаг 5м²)
 * 33-66% = 100-300м² (шаг 10м²)
 * 66-100% = 300-500м² (шаг 25м²)
 */

const FIRST_POINT = 100;
const SECOND_POINT = 300;
const MAX_AREA = 500;
const STEP_LOW = 5;      // шаг для 0-100м²
const STEP_MID = 10;     // шаг для 100-300м²
const STEP_HIGH = 25;    // шаг для 300-500м²

// Конвертация площади в позицию слайдера (0-100)
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

// Компонент поля ввода площади
const AreaInput = memo(({
    label,
    value,
    onChange,
    placeholder
}: {
    label: string;
    value: number;
    onChange: (value: string) => void;
    placeholder: string;
}) => (
    <div className="space-y-2">
        <Label className="text-xs text-text-secondary font-medium">
            {label}
        </Label>
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "w-full h-9 pl-3 pr-10 text-sm rounded-md transition-colors",
                    "bg-background border border-border",
                    "text-text-primary placeholder:text-text-tertiary",
                    "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent",
                    "hover:border-border-hover"
                )}
                placeholder={placeholder}
                min="0"
                max={MAX_AREA}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                м²
            </span>
        </div>
    </div>
));
AreaInput.displayName = 'AreaInput';

export const AreaFilter = memo(() => {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const { filters, setFilters } = useSearchFilters();
    const [isOpen, setIsOpen] = useState(false);

    // Локальное состояние для мгновенного UI отклика
    const [localMin, setLocalMin] = useState(() => filters.minArea || 0);
    const [localMax, setLocalMax] = useState(() => filters.maxArea || MAX_AREA);

    // Синхронизация при открытии попапа
    const handleOpenChange = useCallback((open: boolean) => {
        if (open) {
            setLocalMin(filters.minArea || 0);
            setLocalMax(filters.maxArea || MAX_AREA);
        }
        setIsOpen(open);
    }, [filters.minArea, filters.maxArea]);

    // Конвертация локальных значений в позиции слайдера
    const sliderValue = useMemo<[number, number]>(
        () => [areaToSlider(localMin), areaToSlider(localMax)],
        [localMin, localMax]
    );

    // Обработчик изменения слайдера - мгновенное обновление UI
    const handleSliderChange = useCallback(
        (newValue: number[]) => {
            if (newValue.length !== 2) return;

            const areas: [number, number] = [
                sliderToArea(newValue[0]),
                sliderToArea(newValue[1]),
            ];

            // Мгновенно обновляем UI
            setLocalMin(areas[0]);
            setLocalMax(areas[1]);
        },
        []
    );

    // Commit при завершении перетаскивания - обновление стора
    const handleSliderCommit = useCallback(
        (newValue: number[]) => {
            if (newValue.length !== 2) return;

            const areas: [number, number] = [
                sliderToArea(newValue[0]),
                sliderToArea(newValue[1]),
            ];

            setLocalMin(areas[0]);
            setLocalMax(areas[1]);

            setFilters({
                minArea: areas[0] === 0 ? undefined : areas[0],
                maxArea: areas[1] === MAX_AREA ? undefined : areas[1],
            });

            console.log('Area filter applied:', { min: areas[0], max: areas[1] });
        },
        [setFilters]
    );

    // Обработчик полей ввода
    const handleInputChange = useCallback(
        (index: 0 | 1, value: string) => {
            const numValue = parseInt(value) || 0;
            const clampedValue = Math.min(Math.max(numValue, 0), MAX_AREA);

            let newMin = localMin;
            let newMax = localMax;

            if (index === 0) {
                newMin = clampedValue;
                // Валидация: min не больше max
                if (newMin > newMax) {
                    newMax = newMin;
                }
            } else {
                newMax = clampedValue;
                // Валидация: max не меньше min
                if (newMax < newMin) {
                    newMin = newMax;
                }
            }

            setLocalMin(newMin);
            setLocalMax(newMax);

            setFilters({
                minArea: newMin === 0 ? undefined : newMin,
                maxArea: newMax === MAX_AREA ? undefined : newMax,
            });
        },
        [localMin, localMax, setFilters]
    );

    // Обработчик пресетов
    const handlePreset = useCallback(
        (min: number, max: number) => {
            setLocalMin(min);
            setLocalMax(max);
            setFilters({
                minArea: min === 0 ? undefined : min,
                maxArea: max === MAX_AREA ? undefined : max,
            });
        },
        [setFilters]
    );

    // Сброс фильтра
    const handleReset = useCallback(() => {
        setFilters({ minArea: undefined, maxArea: undefined });
    }, [setFilters]);

    const isActive = filters.minArea !== undefined || filters.maxArea !== undefined;

    const buttonLabel = useMemo(() => {
        if (!isActive) return t('area');
        return `${t('area')}: ${filters.minArea || 0} - ${filters.maxArea || MAX_AREA} м²`;
    }, [isActive, filters.minArea, filters.maxArea, t]);

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'flex h-9 items-center justify-between gap-2 rounded-md cursor-pointer',
                        'px-3 py-2 text-sm whitespace-nowrap transition-all duration-200',
                        // Светлая тема: белый фон
                        'bg-background',
                        // Тёмная тема: без бордера
                        'border border-border dark:border-transparent',
                        // Текст
                        'text-text-primary hover:text-text-primary',
                        // Активное состояние
                        isActive && 'text-text-primary'
                    )}
                >
                    {buttonLabel}
                    <ChevronDown className={cn(
                        "w-4 h-4 opacity-50 transition-transform",
                        isOpen && "rotate-180"
                    )} />
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[320px] p-4 bg-background border-border"
                align="start"
            >
                <div className="space-y-4">
                    <Label className="text-sm font-semibold text-text-primary">
                        {t('areaRange')}
                    </Label>

                    {/* Поля ввода */}
                    <div className="grid grid-cols-2 gap-3">
                        <AreaInput
                            label={t('minArea')}
                            value={localMin}
                            onChange={(value) => handleInputChange(0, value)}
                            placeholder="0"
                        />
                        <AreaInput
                            label={t('maxArea')}
                            value={localMax}
                            onChange={(value) => handleInputChange(1, value)}
                            placeholder={MAX_AREA.toString()}
                        />
                    </div>

                    {/* Слайдер */}
                    <div className="space-y-2 pt-2">
                        <Label className="text-xs text-text-secondary font-medium">
                            {t('quickSelect')}
                        </Label>
                        <div className="px-2">
                            <Slider
                                value={sliderValue}
                                onValueChange={handleSliderChange}
                                onValueCommit={handleSliderCommit}
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

                    {/* Быстрые пресеты */}
                    <div className="space-y-2">
                        <Label className="text-xs text-text-secondary font-medium">
                            {t('presets')}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { min: 0, max: 50, label: '< 50 м²' },
                                { min: 50, max: 100, label: '50-100 м²' },
                                { min: 100, max: 200, label: '100-200 м²' },
                                { min: 200, max: MAX_AREA, label: '> 200 м²' },
                            ].map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePreset(preset.min, preset.max)}
                                    className={cn(
                                        "h-8 text-xs cursor-pointer",
                                        // Светлая тема
                                        "bg-background text-text-secondary border-border",
                                        // Тёмная тема
                                        "dark:bg-background-secondary dark:text-text-primary dark:border-border",
                                        // Ховер: лёгкое осветление фона
                                        "hover:bg-background-secondary hover:text-text-primary",
                                        "dark:hover:bg-background-tertiary dark:hover:text-text-primary",
                                        // Переход
                                        "transition-colors duration-150"
                                    )}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Кнопка сброса */}
                    {isActive && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className={cn(
                                "w-full cursor-pointer",
                                // Светлая тема
                                "bg-background text-text-secondary border-border",
                                // Тёмная тема
                                "dark:bg-background-secondary dark:text-text-primary dark:border-border",
                                // Ховер: лёгкое осветление фона
                                "hover:bg-background-secondary hover:text-text-primary",
                                "dark:hover:bg-background-tertiary dark:hover:text-text-primary",
                                // Переход
                                "transition-colors duration-150"
                            )}
                        >
                            {tCommon('reset')}
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
});

AreaFilter.displayName = 'AreaFilter';
