'use client';

import { useTranslations } from 'next-intl';
import { useFilterStore } from '@/store/filterStore';
import type { MarkerType } from '@/types/filter';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/**
 * Фильтр типа маркеров на карте
 * Единичный выбор: все/не видел/понравились/не понравились
 */
export function MarkerTypeFilter() {
    const t = useTranslations('filters');
    const { currentFilters, setFilters } = useFilterStore();

    const markerTypes: { value: MarkerType; label: string }[] = [
        { value: 'all', label: t('markerAll') },
        { value: 'no_view', label: t('markerNoView') },
        { value: 'view', label: t('markerNotViewed') },
        { value: 'like', label: t('markerLiked') },
        { value: 'dislike', label: t('markerDisliked') },
    ];

    const selectedType = currentFilters.markerType || 'all';

    const handleSelect = (value: string) => {
        setFilters({ markerType: value as MarkerType });
        console.log('Marker type changed:', value);
    };

    const isActive = selectedType !== 'all';
    const selectedLabel = markerTypes.find(type => type.value === selectedType)?.label || t('markerAll');

    return (
        <Select value={selectedType} onValueChange={handleSelect}>
            <SelectTrigger
                size="default"
                className={cn(
                    'w-fit whitespace-nowrap cursor-pointer dark:bg-input/30 dark:hover:bg-input/50',
                    isActive && 'bg-brand-primary-light text-brand-primary border-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary dark:border-brand-primary/30'
                )}
            >
                <SelectValue placeholder={t('markerAll')}>
                    {selectedLabel}
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
                {markerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className='cursor-pointer'>
                        {type.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
