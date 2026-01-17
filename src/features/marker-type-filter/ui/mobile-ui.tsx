'use client';

import { useTranslations } from 'next-intl';
import { useSearchFilters } from '@/features/search-filters/model';
import type { MarkerType } from '@/entities/filter';
import { cn } from '@/shared/lib/utils';

interface MarkerTypeFilterMobileProps {
    value?: MarkerType;
    onChange?: (value: MarkerType) => void;
}

/**
 * Мобильная версия фильтра типов маркеров
 * Отображается как развёрнутая сетка кнопок (2 колонки)
 * Может работать как контролируемый компонент (с пропсами) или использовать глобальный store
 */
export function MarkerTypeFilterMobile({ value, onChange }: MarkerTypeFilterMobileProps = {}) {
    const t = useTranslations('filters');
    const { filters, setFilters } = useSearchFilters();

    const markerTypes: { value: MarkerType; label: string }[] = [
        { value: 'all', label: t('markerAll') },
        { value: 'no_view', label: t('markerNoView') },
        { value: 'view', label: t('markerNotViewed') },
        { value: 'like', label: t('markerLiked') },
        { value: 'dislike', label: t('markerDisliked') },
    ];

    // Используем переданное значение или берём из store
    const selectedType = value ?? filters.markerType ?? 'all';

    const handleSelect = (newValue: MarkerType) => {
        if (onChange) {
            // Контролируемый режим - вызываем коллбэк
            onChange(newValue);
        } else {
            // Неконтролируемый режим - обновляем store
            setFilters({ markerType: newValue });
            console.log('Marker type changed:', newValue);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            {markerTypes.map((type) => {
                const isSelected = selectedType === type.value;

                return (
                    <button
                        key={type.value}
                        onClick={() => handleSelect(type.value)}
                        className={cn(
                            'px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            'border border-border',
                            isSelected
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-background text-text-secondary hover:bg-background-secondary'
                        )}
                    >
                        {type.label}
                    </button>
                );
            })}
        </div>
    );
}
