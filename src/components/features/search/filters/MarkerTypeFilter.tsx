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
                    'w-fit whitespace-nowrap cursor-pointer',
                    // Светлая тема: белый фон
                    'bg-background',
                    // Тёмная тема: без бордера
                    'border border-border dark:border-transparent',
                    // Текст
                    'text-text-primary hover:text-text-primary',
                    // Переходы
                    'transition-all duration-200',
                    // Активное состояние
                    isActive && 'text-text-primary'
                )}
            >
                <SelectValue placeholder={t('markerAll')}>
                    {selectedLabel}
                </SelectValue>
            </SelectTrigger>
            <SelectContent
                align="start"
                className={cn(
                    // Светлая тема: белый фон
                    'bg-background',
                    'border border-border dark:border-border',
                    'shadow-lg'
                )}
            >
                {markerTypes.map((type) => (
                    <SelectItem
                        key={type.value}
                        value={type.value}
                        className={cn(
                            'cursor-pointer',
                            // Текст
                            'text-text-secondary',
                            // Ховер: синий фон в обеих темах
                            'hover:bg-brand-primary-light hover:text-brand-primary',
                            'dark:hover:bg-brand-primary dark:hover:text-white',
                            // Фокус
                            'focus:bg-brand-primary-light focus:text-brand-primary',
                            'dark:focus:bg-brand-primary dark:focus:text-white',
                            // Переход
                            'transition-colors duration-150',
                            // Выбранный элемент: синий чекер (стилизуется через data-state)
                            'data-[state=checked]:text-brand-primary',
                            // Иконка чекера синяя
                            '[&_span_svg]:text-brand-primary'
                        )}
                    >
                        {type.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
