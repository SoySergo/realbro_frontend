'use client';

import { useCallback, useMemo } from 'react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';

const ALL_VALUES = [1, 2, 3, 4];

interface BathroomsFilterMobileProps {
    value?: number[];
    onChange?: (value: number[]) => void;
    className?: string;
}

/**
 * Мобильная версия фильтра ванных комнат
 * Выбор минимального количества: клик по 2 → выбираются 2, 3, 4 (2 и более)
 */
export function BathroomsFilterMobile({ value, onChange, className }: BathroomsFilterMobileProps = {}) {
    const { filters, setFilters } = useSearchFilters();

    const bathroomOptions = useMemo(
        () => [
            { value: 1, label: '1+' },
            { value: 2, label: '2+' },
            { value: 3, label: '3+' },
            { value: 4, label: '4+' },
        ],
        []
    );

    const selectedBathrooms = useMemo(() => value ?? filters.bathrooms ?? [], [value, filters.bathrooms]);

    const minSelected = useMemo(() => {
        if (selectedBathrooms.length === 0) return null;
        return Math.min(...selectedBathrooms);
    }, [selectedBathrooms]);

    const handleSelect = useCallback(
        (bathroomValue: number) => {
            let newBathrooms: number[];
            if (minSelected === bathroomValue) {
                // Повторный клик — сброс
                newBathrooms = [];
            } else {
                // Все значения >= выбранного
                newBathrooms = ALL_VALUES.filter(v => v >= bathroomValue);
            }

            if (onChange) {
                onChange(newBathrooms);
            } else {
                setFilters({ bathrooms: newBathrooms.length > 0 ? newBathrooms : undefined });
            }
        },
        [minSelected, onChange, setFilters]
    );

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {bathroomOptions.map((option) => {
                const isSelected = minSelected !== null && option.value >= minSelected;

                return (
                    <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                            'h-8 px-3 rounded-md text-sm font-medium transition-colors',
                            'border',
                            isSelected
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'border-border text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
