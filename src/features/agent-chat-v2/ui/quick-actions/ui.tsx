'use client';

import React from 'react';
import {
    FileText,
    StickyNote,
    Heart,
    ThumbsUp,
    ThumbsDown,
    MapPin,
    Phone,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { QuickActionType } from '../../model/types';

interface QuickActionsBarProps {
    labels: Record<string, string>;
    onAction: (action: QuickActionType) => void;
    className?: string;
}

const actions: { type: QuickActionType; icon: React.ElementType; colorClass: string }[] = [
    { type: 'describe', icon: FileText, colorClass: 'text-brand-primary' },
    { type: 'note', icon: StickyNote, colorClass: 'text-warning' },
    { type: 'favorite', icon: Heart, colorClass: 'text-error' },
    { type: 'suitable', icon: ThumbsUp, colorClass: 'text-success' },
    { type: 'not-suitable', icon: ThumbsDown, colorClass: 'text-text-tertiary' },
    { type: 'nearby', icon: MapPin, colorClass: 'text-info' },
    { type: 'contact', icon: Phone, colorClass: 'text-brand-primary' },
];

/**
 * Панель быстрых действий над полем ввода в треде
 */
export const QuickActionsBar = React.memo(function QuickActionsBar({
    labels,
    onAction,
    className,
}: QuickActionsBarProps) {
    return (
        <div className={cn('flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide', className)}>
            {actions.map(({ type, icon: Icon, colorClass }) => (
                <button
                    key={type}
                    onClick={() => onAction(type)}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                        'bg-background-secondary hover:bg-background-tertiary',
                        'border border-border hover:border-border-hover',
                        'text-xs font-medium whitespace-nowrap transition-all duration-200',
                        'active:scale-95'
                    )}
                >
                    <Icon className={cn('w-3.5 h-3.5', colorClass)} />
                    <span className="text-text-secondary">{labels[type] || type}</span>
                </button>
            ))}
        </div>
    );
});
