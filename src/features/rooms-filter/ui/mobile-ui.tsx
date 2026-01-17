'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchFilters } from '@/features/search-filters/model';
import { cn } from '@/shared/lib/utils';

interface RoomsFilterMobileProps {
    value?: number[];
    onChange?: (value: number[]) => void;
}

/**
 * Мобильная версия фильтра комнат
 * Отображается как сетка кнопок (3 колонки, мультиселект)
 * Может работать как контролируемый компонент (с пропсами) или использовать глобальный store
 */
export function RoomsFilterMobile({ value, onChange }: RoomsFilterMobileProps = {}) {
    const t = useTranslations('filters');
    const { filters, setFilters } = useSearchFilters();

    const roomOptions = useMemo(
        () => [
            { value: 0, label: t('studio') },
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
            { value: 4, label: '4' },
            { value: 5, label: '5+' },
        ],
        [t]
    );

    // Используем переданное значение или берём из store
    const selectedRooms = useMemo(() => value ?? filters.rooms ?? [], [value, filters.rooms]);

    const handleToggle = useCallback(
        (roomValue: number) => {
            const newRooms = selectedRooms.includes(roomValue)
                ? selectedRooms.filter((r: number) => r !== roomValue)
                : [...selectedRooms, roomValue];

            if (onChange) {
                // Контролируемый режим - вызываем коллбэк
                onChange(newRooms);
            } else {
                // Неконтролируемый режим - обновляем store
                setFilters({ rooms: newRooms.length > 0 ? newRooms : undefined });
                console.log('Rooms updated:', newRooms);
            }
        },
        [selectedRooms, onChange, setFilters]
    );

    return (
        <div className="grid grid-cols-3 gap-2">
            {roomOptions.map((option) => {
                const isSelected = selectedRooms.includes(option.value);

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
