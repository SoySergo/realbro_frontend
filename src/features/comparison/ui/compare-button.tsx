'use client';

import React from 'react';
import { Scale, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { useComparisonStore, useIsInComparison, COMPARISON_MAX_ITEMS } from '../model';
import type { Property } from '@/entities/property';

export interface CompareButtonTranslations {
    compare: string;
    inComparison: string;
    limitReached: string;
    addedToComparison?: string;
    removedFromComparison?: string;
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
            if (t.removedFromComparison) {
                toast(t.removedFromComparison, { icon: <Scale className="w-4 h-4" /> });
            }
            return;
        }

        // Если лимит достигнут - показываем панель сравнения
        if (count >= COMPARISON_MAX_ITEMS) {
            setComparisonPanelOpen(true);
            if (t.limitReached) {
                toast.warning(t.limitReached);
            }
            return;
        }

        // Добавляем в сравнение (используем addToComparison напрямую для ясности)
        const { addToComparison } = useComparisonStore.getState();
        const added = addToComparison(property);
        if (added) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
            if (t.addedToComparison) {
                toast.success(t.addedToComparison, { icon: <Scale className="w-4 h-4" /> });
            }
        }
    };

    // Размеры кнопки и иконки - matching like/dislike buttons
    const sizeClasses = {
        sm: {
            button: 'w-7 h-7',
            icon: 'w-4 h-4',
            text: 'text-xs',
        },
        md: {
            button: 'w-10 h-10 sm:w-7 sm:h-7',
            icon: 'w-5 h-5 sm:w-4 sm:h-4',
            text: 'text-sm',
        },
        lg: {
            button: 'w-10 h-10',
            icon: 'w-5 h-5',
            text: 'text-base',
        },
    };

    const currentSize = sizeClasses[size];
    const count = getComparisonCount();
    const isLimitReached = count >= COMPARISON_MAX_ITEMS && !isInComparison;

    // Определяем текст и иконку
    const label = isInComparison ? t.inComparison : isLimitReached ? t.limitReached : t.compare;
    const Icon = isInComparison ? Check : Scale;

    return (
        <button
            onClick={handleClick}
            className={cn(
                'flex items-center justify-center rounded-full transition-colors cursor-pointer',
                currentSize.button,
                isInComparison
                    ? 'bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30'
                    : 'text-muted-foreground hover:bg-brand-primary/20 hover:text-brand-primary',
                isLimitReached && !isInComparison && 'opacity-50 cursor-not-allowed',
                isAnimating && 'scale-110',
                variant === 'full' && 'flex items-center gap-2 px-3 rounded-lg w-auto h-auto',
                variant === 'text' && 'px-3 rounded-lg w-auto h-auto',
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
                        isAnimating && 'animate-icon-pop'
                    )}
                />
            )}
            {(variant === 'text' || variant === 'full') && (
                <span className={cn(currentSize.text, 'whitespace-nowrap')}>{label}</span>
            )}
        </button>
    );
});

