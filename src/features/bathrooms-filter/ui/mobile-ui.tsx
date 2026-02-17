'use client';

import { useCallback, useMemo } from 'react';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';

interface BathroomsFilterMobileProps {
    value?: number[];
    onChange?: (value: number[]) => void;
}

/**
 * Мобильная версия фильтра ванных комнат
 * Отображается как сетка кнопок (мультиселект)
 * Может работать как контролируемый компонент (с пропсами) или использовать глобальный store
 */
export function BathroomsFilterMobile({ value, onChange }: BathroomsFilterMobileProps = {}) {
    const { filters, setFilters } = useSearchFilters();

    const bathroomOptions = useMemo(
        () => [
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
            { value: 4, label: '4+' },
        ],
        []
    );

    // Используем переданное значение или берём из store
    const selectedBathrooms = useMemo(() => value ?? filters.bathrooms ?? [], [value, filters.bathrooms]);

    const handleToggle = useCallback(
        (bathroomValue: number) => {
            const newBathrooms = selectedBathrooms.includes(bathroomValue)
                ? selectedBathrooms.filter((b: number) => b !== bathroomValue)
                : [...selectedBathrooms, bathroomValue];

            if (onChange) {
                // Контролируемый режим - вызываем коллбэк
                onChange(newBathrooms);
            } else {
                // Неконтролируемый режим - обновляем store
                setFilters({ bathrooms: newBathrooms.length > 0 ? newBathrooms : undefined });
                console.log('Bathrooms updated:', newBathrooms);
            }
        },
        [selectedBathrooms, onChange, setFilters]
    );

    return (
        <div className="grid grid-cols-3 gap-2">
            {bathroomOptions.map((option) => {
                const isSelected = selectedBathrooms.includes(option.value);

                return (
                    <button
                        key={option.value}
                        onClick={() => handleToggle(option.value)}
                        className={cn(
                            'px-3 py-3 rounded-lg text-sm font-medium transition-all',
                            'border border-border',
                            isSelected
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-background text-text-secondary hover:bg-background-secondary'
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
