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
 * Фильтр цены аренды с трёхсегментной шкалой
 * 0-33% = 0-1000€ (шаг 100€)
 * 33-66% = 1000-5000€ (шаг 250€)
 * 66-100% = 5000-20000€ (шаг 500€)
 */

const FIRST_POINT = 1_000;
const SECOND_POINT = 5_000;
const MAX_PRICE = 20_000;
const STEP_LOW = 100;    // шаг для 0-1000€
const STEP_MID = 250;    // шаг для 1000-5000€
const STEP_HIGH = 500;   // шаг для 5000-20000€

// Конвертация цены в позицию слайдера (0-100)
const priceToSlider = (price: number): number => {
    if (price <= FIRST_POINT) {
        // Первый сегмент: 0-33%
        return (price / FIRST_POINT) * 33.33;
    } else if (price <= SECOND_POINT) {
        // Второй сегмент: 33-66%
        const priceAboveFirst = price - FIRST_POINT;
        const rangeFirstToSecond = SECOND_POINT - FIRST_POINT;
        return 33.33 + (priceAboveFirst / rangeFirstToSecond) * 33.33;
    } else {
        // Третий сегмент: 66-100%
        const priceAboveSecond = price - SECOND_POINT;
        const rangeSecondToMax = MAX_PRICE - SECOND_POINT;
        return 66.66 + (priceAboveSecond / rangeSecondToMax) * 33.34;
    }
};

// Конвертация позиции слайдера в цену
const sliderToPrice = (position: number): number => {
    if (position <= 33.33) {
        // Первый сегмент: 0-1000€
        const price = (position / 33.33) * FIRST_POINT;
        return Math.round(price / STEP_LOW) * STEP_LOW;
    } else if (position <= 66.66) {
        // Второй сегмент: 1000-5000€
        const positionInSegment = position - 33.33;
        const priceInSegment = (positionInSegment / 33.33) * (SECOND_POINT - FIRST_POINT);
        const price = FIRST_POINT + priceInSegment;
        return Math.round(price / STEP_MID) * STEP_MID;
    } else {
        // Третий сегмент: 5000-20000€
        const positionInSegment = position - 66.66;
        const priceInSegment = (positionInSegment / 33.34) * (MAX_PRICE - SECOND_POINT);
        const price = SECOND_POINT + priceInSegment;
        return Math.round(price / STEP_HIGH) * STEP_HIGH;
    }
};

// Форматирование цены
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU').format(price);
};

// Компонент поля ввода цены
const PriceInput = memo(({
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                €
            </span>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "w-full h-9 pl-7 pr-3 text-sm rounded-md transition-colors",
                    "bg-background border border-border",
                    "text-text-primary placeholder:text-text-tertiary",
                    "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent",
                    "hover:border-border-hover"
                )}
                placeholder={placeholder}
                min="0"
                max={MAX_PRICE}
            />
        </div>
    </div>
));
PriceInput.displayName = 'PriceInput';

export const PriceFilter = memo(() => {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const { filters, setFilters } = useSearchFilters();
    const [isOpen, setIsOpen] = useState(false);

    // Локальное состояние для мгновенного UI отклика
    const [localMin, setLocalMin] = useState(() => filters.minPrice || 0);
    const [localMax, setLocalMax] = useState(() => filters.maxPrice || MAX_PRICE);

    // Синхронизация при открытии попапа
    const handleOpenChange = useCallback((open: boolean) => {
        if (open) {
            setLocalMin(filters.minPrice || 0);
            setLocalMax(filters.maxPrice || MAX_PRICE);
        }
        setIsOpen(open);
    }, [filters.minPrice, filters.maxPrice]);

    // Конвертация локальных цен в позиции слайдера
    const sliderValue = useMemo<[number, number]>(
        () => [priceToSlider(localMin), priceToSlider(localMax)],
        [localMin, localMax]
    );

    // Обработчик изменения слайдера - мгновенное обновление UI
    const handleSliderChange = useCallback(
        (newValue: number[]) => {
            if (newValue.length !== 2) return;

            const prices: [number, number] = [
                sliderToPrice(newValue[0]),
                sliderToPrice(newValue[1]),
            ];

            // Мгновенно обновляем UI
            setLocalMin(prices[0]);
            setLocalMax(prices[1]);
        },
        []
    );

    // Commit при завершении перетаскивания - обновление стора
    const handleSliderCommit = useCallback(
        (newValue: number[]) => {
            if (newValue.length !== 2) return;

            const prices: [number, number] = [
                sliderToPrice(newValue[0]),
                sliderToPrice(newValue[1]),
            ];

            setLocalMin(prices[0]);
            setLocalMax(prices[1]);

            setFilters({
                minPrice: prices[0] === 0 ? undefined : prices[0],
                maxPrice: prices[1] === MAX_PRICE ? undefined : prices[1],
            });

            console.log('Price filter applied:', { min: prices[0], max: prices[1] });
        },
        [setFilters]
    );

    // Обработчик полей ввода
    const handleInputChange = useCallback(
        (index: 0 | 1, value: string) => {
            const numValue = parseInt(value) || 0;
            const clampedValue = Math.min(Math.max(numValue, 0), MAX_PRICE);

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
                minPrice: newMin === 0 ? undefined : newMin,
                maxPrice: newMax === MAX_PRICE ? undefined : newMax,
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
                minPrice: min === 0 ? undefined : min,
                maxPrice: max === MAX_PRICE ? undefined : max,
            });
        },
        [setFilters]
    );

    // Сброс фильтра
    const handleReset = useCallback(() => {
        setFilters({ minPrice: undefined, maxPrice: undefined });
    }, [setFilters]);

    const isActive = filters.minPrice !== undefined || filters.maxPrice !== undefined;

    const buttonLabel = useMemo(() => {
        if (!isActive) return t('price');
        return `${t('price')}: €${formatPrice(filters.minPrice || 0)} - €${formatPrice(filters.maxPrice || MAX_PRICE)}`;
    }, [isActive, filters.minPrice, filters.maxPrice, t]);

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
                        {t('priceRange')}
                    </Label>

                    {/* Поля ввода */}
                    <div className="grid grid-cols-2 gap-3">
                        <PriceInput
                            label={t('minPrice')}
                            value={localMin}
                            onChange={(value) => handleInputChange(0, value)}
                            placeholder="0"
                        />
                        <PriceInput
                            label={t('maxPrice')}
                            value={localMax}
                            onChange={(value) => handleInputChange(1, value)}
                            placeholder={MAX_PRICE.toString()}
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

                    {/* Быстрые пресеты */}
                    <div className="space-y-2">
                        <Label className="text-xs text-text-secondary font-medium">
                            {t('presets')}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { min: 0, max: 600, label: '€0 - €600' },
                                { min: 600, max: 1200, label: '€600 - €1.2k' },
                                { min: 1200, max: 2000, label: '€1.2k - €2k' },
                                { min: 2000, max: 4000, label: '€2k - €4k' },
                                { min: 4000, max: MAX_PRICE, label: '€4k+' },
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

PriceFilter.displayName = 'PriceFilter';
