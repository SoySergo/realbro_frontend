'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';



/**
 * Компактный горизонтальный фильтр комнат с Popover
 * Стиль Toggle Group - все кнопки объединены в одну группу
 */
export const RoomsFilter = memo(() => {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const { currentFilters, setFilters } = useFilterStore();
    const [isOpen, setIsOpen] = useState(false);

    const roomOptions = useMemo(() => [
        { value: '0', label: t('studio') },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5+' },
    ], [t]);

    const selectedRooms = useMemo(() => currentFilters.rooms || [], [currentFilters.rooms]);

    // Конвертируем массив чисел в массив строк для ToggleGroup
    const selectedValues = useMemo(
        () => selectedRooms.map(String),
        [selectedRooms]
    );

    const handleValueChange = useCallback((values: string[]) => {
        const newRooms = values.map(Number);
        setFilters({ rooms: newRooms.length > 0 ? newRooms : undefined });
        console.log('Rooms updated:', newRooms);
    }, [setFilters]);

    const handleReset = useCallback(() => {
        setFilters({ rooms: undefined });
    }, [setFilters]);

    const selectedCount = selectedRooms.length;
    const isActive = selectedCount > 0;

    const buttonLabel = useMemo(() => {
        if (!isActive) return t('rooms');
        return `${t('rooms')} (${selectedCount})`;
    }, [isActive, selectedCount, t]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'border-input focus-visible:border-ring focus-visible:ring-ring/50',
                        'flex h-9 items-center justify-between gap-2 rounded-md border cursor-pointer',
                        'bg-background dark:bg-input/30 dark:hover:bg-input/50',
                        'px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow]',
                        'outline-none focus-visible:ring-[3px] hover:bg-accent/50',
                        isActive && 'bg-brand-primary-light text-brand-primary border-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary dark:border-brand-primary/30'
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
                        {roomOptions.map((option, index) => {
                            const isSelected = selectedValues.includes(option.value);
                            const isFirst = index === 0;
                            const isLast = index === roomOptions.length - 1;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        const newValues = isSelected
                                            ? selectedValues.filter(v => v !== option.value)
                                            : [...selectedValues, option.value];
                                        handleValueChange(newValues);
                                    }}
                                    className={cn(
                                        "relative inline-flex items-center justify-center px-3 h-9 text-sm font-semibold transition-all cursor-pointer",
                                        "border border-border bg-background dark:bg-input/30",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                                        "disabled:pointer-events-none disabled:opacity-50",
                                        // Углы только у первого и последнего
                                        isFirst && "rounded-l-md",
                                        isLast && "rounded-r-md",
                                        !isFirst && "-ml-px", // Перекрытие тонких границ
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
                            className="w-auto "
                        >
                            {tCommon('reset')}
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
});

RoomsFilter.displayName = 'RoomsFilter';
