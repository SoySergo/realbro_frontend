'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

/**
 * Компактный горизонтальный фильтр ванных комнат с Popover
 * Стиль Toggle Group - все кнопки объединены в одну группу
 */
export const BathroomsFilter = memo(() => {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const { filters, setFilters } = useSearchFilters();
    const [isOpen, setIsOpen] = useState(false);

    const bathroomOptions = useMemo(() => [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4+' },
    ], []);

    const selectedBathrooms = useMemo(() => filters.bathrooms || [], [filters.bathrooms]);

    // Конвертируем массив чисел в массив строк для ToggleGroup
    const selectedValues = useMemo(
        () => selectedBathrooms.map(String),
        [selectedBathrooms]
    );

    const handleValueChange = useCallback((values: string[]) => {
        const newBathrooms = values.map(Number);
        setFilters({ bathrooms: newBathrooms.length > 0 ? newBathrooms : undefined });
        console.log('Bathrooms updated:', newBathrooms);
    }, [setFilters]);

    const handleReset = useCallback(() => {
        setFilters({ bathrooms: undefined });
    }, [setFilters]);

    const selectedCount = selectedBathrooms.length;
    const isActive = selectedCount > 0;

    const buttonLabel = useMemo(() => {
        if (!isActive) return t('bathrooms');
        return `${t('bathrooms')} (${selectedCount})`;
    }, [isActive, selectedCount, t]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                className="w-auto p-3 bg-background border-border"
                align="start"
            >
                <div className="flex flex-col gap-3">
                    {/* Toggle Group - горизонтальный ряд кнопок */}
                    <div className="inline-flex rounded-md" role="group">
                        {bathroomOptions.map((option, index) => {
                            const isSelected = selectedValues.includes(option.value);
                            const isFirst = index === 0;
                            const isLast = index === bathroomOptions.length - 1;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        const newValues = isSelected
                                            ? selectedValues.filter((v: string) => v !== option.value)
                                            : [...selectedValues, option.value];
                                        handleValueChange(newValues);
                                    }}
                                    className={cn(
                                        "relative inline-flex items-center justify-center px-3 h-9 text-sm font-medium transition-all cursor-pointer",
                                        "text-text-primary border border-border bg-background dark:bg-input/30",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                                        "disabled:pointer-events-none disabled:opacity-50",
                                        // Углы только у первого и последнего
                                        isFirst && "rounded-l-md",
                                        isLast && "rounded-r-md",
                                        !isFirst && "-ml-px",
                                        // Состояния
                                        isSelected
                                            ? "bg-brand-primary text-white border-brand-primary z-10 dark:bg-brand-primary dark:text-white"
                                            : "hover:bg-background-secondary hover:text-text-primary dark:hover:bg-input/50"
                                    )}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Кнопка сброса */}
                    {isActive && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className={cn(
                                "w-auto cursor-pointer",
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

BathroomsFilter.displayName = 'BathroomsFilter';
