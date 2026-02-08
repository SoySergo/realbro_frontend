'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CompareButton } from './compare-button';
import { Scale, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { useComparisonStore, useIsInComparison, COMPARISON_MAX_ITEMS } from '../model';
import type { Property } from '@/entities/property';

interface PropertyCompareButtonProps {
    property: Property;
    variant?: 'icon' | 'text' | 'full';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * PropertyCompareButton - Готовая кнопка сравнения с переводами из контекста
 * 
 * Использует useTranslations для получения переводов автоматически.
 * Используется как слот actions в карточках.
 */
export function PropertyCompareButton({
    property,
    variant = 'icon',
    size = 'sm',
    className,
}: PropertyCompareButtonProps) {
    const t = useTranslations('comparison');
    const tToasts = useTranslations('toasts');

    const translations = {
        compare: t('compare'),
        inComparison: t('inComparison'),
        limitReached: t('limitReached'),
        addedToComparison: tToasts('addedToComparison'),
        removedFromComparison: tToasts('removedFromComparison'),
    };

    return (
        <CompareButton
            property={property}
            translations={translations}
            variant={variant}
            size={size}
            className={className}
        />
    );
}

interface PropertyCompareMenuItemProps {
    property: Property;
    className?: string;
}

/**
 * PropertyCompareMenuItem - Пункт меню для добавления в сравнение
 * 
 * Используется внутри DropdownMenu для карточек.
 */
export function PropertyCompareMenuItem({
    property,
    className,
}: PropertyCompareMenuItemProps) {
    const t = useTranslations('comparison');
    const tToasts = useTranslations('toasts');
    const { toggleComparison, getComparisonCount, setComparisonPanelOpen } = useComparisonStore();
    const isInComparison = useIsInComparison(property.id);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        const count = getComparisonCount();
        
        if (isInComparison) {
            toggleComparison(property);
            toast(tToasts('removedFromComparison'), { icon: <Scale className="w-4 h-4" /> });
            return;
        }

        if (count >= COMPARISON_MAX_ITEMS) {
            setComparisonPanelOpen(true);
            toast.warning(tToasts('comparisonLimitReached'));
            return;
        }

        toggleComparison(property);
        toast.success(tToasts('addedToComparison'), { icon: <Scale className="w-4 h-4" /> });
    };

    const label = isInComparison ? t('inComparison') : t('compare');
    const Icon = isInComparison ? Check : Scale;

    return (
        <DropdownMenuItem
            onClick={handleClick}
            className={cn(
                'gap-2 cursor-pointer',
                isInComparison && 'text-brand-primary',
                className
            )}
        >
            <Icon className={cn('w-4 h-4', isInComparison && 'fill-current')} />
            {label}
        </DropdownMenuItem>
    );
}
