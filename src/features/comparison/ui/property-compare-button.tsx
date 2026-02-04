'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CompareButton } from './compare-button';
import { GitCompareArrows, Check } from 'lucide-react';
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu';
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

    const translations = {
        compare: t('compare'),
        inComparison: t('inComparison'),
        limitReached: t('limitReached'),
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
    const { toggleComparison, getComparisonCount, setComparisonPanelOpen } = useComparisonStore();
    const isInComparison = useIsInComparison(property.id);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        const count = getComparisonCount();
        
        if (isInComparison) {
            toggleComparison(property);
            return;
        }

        if (count >= COMPARISON_MAX_ITEMS) {
            setComparisonPanelOpen(true);
            return;
        }

        toggleComparison(property);
    };

    const label = isInComparison ? t('inComparison') : t('compare');
    const Icon = isInComparison ? Check : GitCompareArrows;

    return (
        <DropdownMenuItem
            onClick={handleClick}
            className={`gap-2 cursor-pointer ${isInComparison ? 'text-brand-primary' : ''} ${className || ''}`}
        >
            <Icon className={`w-4 h-4 ${isInComparison ? 'fill-current' : ''}`} />
            {label}
        </DropdownMenuItem>
    );
}
