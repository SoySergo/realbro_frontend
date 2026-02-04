'use client';

import React from 'react';
import { GitCompareArrows, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useComparisonStore, useIsInComparison, COMPARISON_MAX_ITEMS } from '../model';
import type { Property } from '@/entities/property';

export interface CompareButtonTranslations {
    compare: string;
    inComparison: string;
    limitReached: string;
}

interface CompareButtonProps {
    property: Property;
    translations: CompareButtonTranslations;
    className?: string;
    variant?: 'icon' | 'text' | 'full';
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

/**
 * CompareButton - Кнопка добавления/удаления объекта из сравнения
 * 
 * Варианты отображения:
 * - icon: только иконка
 * - text: только текст
 * - full: иконка + текст
 */
export const CompareButton = React.memo(function CompareButton({
    property,
    translations,
    className,
    variant = 'icon',
    size = 'md',
    showTooltip = true,
}: CompareButtonProps) {
    const t = translations;
    const { toggleComparison, getComparisonCount, setComparisonPanelOpen } = useComparisonStore();
    const isInComparison = useIsInComparison(property.id);
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const count = getComparisonCount();
        
        // Если уже в сравнении - удаляем
        if (isInComparison) {
            toggleComparison(property);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
            return;
        }

        // Если лимит достигнут - показываем панель сравнения
        if (count >= COMPARISON_MAX_ITEMS) {
            setComparisonPanelOpen(true);
            return;
        }

        // Добавляем в сравнение
        const added = toggleComparison(property);
        if (added) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    // Размеры кнопки и иконки
    const sizeClasses = {
        sm: {
            button: 'p-1.5',
            icon: 'w-3.5 h-3.5',
            text: 'text-xs',
        },
        md: {
            button: 'p-2',
            icon: 'w-4 h-4',
            text: 'text-sm',
        },
        lg: {
            button: 'p-2.5',
            icon: 'w-5 h-5',
            text: 'text-base',
        },
    };

    const currentSize = sizeClasses[size];
    const count = getComparisonCount();
    const isLimitReached = count >= COMPARISON_MAX_ITEMS && !isInComparison;

    // Определяем текст и иконку
    const label = isInComparison ? t.inComparison : isLimitReached ? t.limitReached : t.compare;
    const Icon = isInComparison ? Check : GitCompareArrows;

    return (
        <button
            onClick={handleClick}
            className={cn(
                'rounded-lg transition-all duration-200 cursor-pointer',
                currentSize.button,
                isInComparison
                    ? 'bg-brand-primary/15 text-brand-primary'
                    : 'text-text-tertiary hover:text-brand-primary hover:bg-brand-primary/10',
                isLimitReached && !isInComparison && 'opacity-50 cursor-not-allowed',
                isAnimating && 'scale-110',
                variant === 'full' && 'flex items-center gap-2 px-3',
                variant === 'text' && 'px-3',
                className
            )}
            title={showTooltip ? label : undefined}
            aria-label={label}
            disabled={isLimitReached && !isInComparison}
        >
            {(variant === 'icon' || variant === 'full') && (
                <Icon
                    className={cn(
                        currentSize.icon,
                        isInComparison && 'fill-current',
                        isAnimating && 'animate-bounce'
                    )}
                />
            )}
            {(variant === 'text' || variant === 'full') && (
                <span className={cn(currentSize.text, 'whitespace-nowrap')}>{label}</span>
            )}
        </button>
    );
});
