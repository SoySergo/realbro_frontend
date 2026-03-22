'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

const ALL_VALUES = [1, 2, 3, 4];

/**
 * Компактный горизонтальный фильтр ванных комнат с Popover
 * Выбор минимального количества: клик по 2 → выбираются 2, 3, 4 (2 и более)
 */
export const BathroomsFilter = memo(() => {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const { filters, setFilters } = useSearchFilters();
    const [isOpen, setIsOpen] = useState(false);

    const bathroomOptions = useMemo(() => [
        { value: 1, label: '1+' },
        { value: 2, label: '2+' },
        { value: 3, label: '3+' },
        { value: 4, label: '4+' },
    ], []);

    // Минимальное выбранное значение (null если ничего не выбрано)
    const minSelected = useMemo(() => {
        const baths = filters.bathrooms;
        if (!baths || baths.length === 0) return null;
        return Math.min(...baths);
    }, [filters.bathrooms]);

    const isActive = minSelected !== null;

    const handleSelect = useCallback((value: number) => {
        if (minSelected === value) {
            // Повторный клик — сброс
            setFilters({ bathrooms: undefined });
        } else {
            // Выбираем все значения >= value
            const newBathrooms = ALL_VALUES.filter(v => v >= value);
            setFilters({ bathrooms: newBathrooms });
        }
    }, [minSelected, setFilters]);

    const handleReset = useCallback(() => {
        setFilters({ bathrooms: undefined });
    }, [setFilters]);

    const buttonLabel = useMemo(() => {
        if (!isActive) return t('bathroomsMin');
        return `${t('bathroomsMin')} ${minSelected}+`;
    }, [isActive, minSelected, t]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'flex h-9 items-center justify-between gap-2 rounded-md cursor-pointer',
                        'px-3 py-2 text-sm max-w-[160px] transition-all duration-200',
                        'bg-background',
                        'border border-border dark:border-transparent',
                        'text-text-primary hover:text-text-primary',
                        isActive && 'text-text-primary'
                    )}
                >
                    <span className="truncate">{buttonLabel}</span>
                    <ChevronDown className={cn(
                        "w-4 h-4 opacity-50 shrink-0 transition-transform",
                        isOpen && "rotate-180"
                    )} />
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="w-auto p-3 bg-background border-border"
                align="start"
            >
                <div className="flex flex-col gap-3">
                    <div className="inline-flex rounded-md" role="group">
                        {bathroomOptions.map((option, index) => {
                            const isSelected = minSelected !== null && option.value >= minSelected;
                            const isFirst = index === 0;
                            const isLast = index === bathroomOptions.length - 1;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "relative inline-flex items-center justify-center px-3 h-9 text-sm font-medium transition-all cursor-pointer",
                                        "text-text-primary border border-border bg-background dark:bg-input/30",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                                        "disabled:pointer-events-none disabled:opacity-50",
                                        isFirst && "rounded-l-md",
                                        isLast && "rounded-r-md",
                                        !isFirst && "-ml-px",
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

                    {isActive && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className={cn(
                                "w-auto cursor-pointer",
                                "bg-background text-text-secondary border-border",
                                "dark:bg-background-secondary dark:text-text-primary dark:border-border",
                                "hover:bg-background-secondary hover:text-text-primary",
                                "dark:hover:bg-background-tertiary dark:hover:text-text-primary",
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
