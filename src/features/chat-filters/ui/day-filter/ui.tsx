'use client';

import { cn } from '@/shared/lib/utils';
import { useChatFilterStore } from '../../model/store';
import type { DayFilter as DayFilterType } from '@/entities/chat';

const dayOptions: { value: DayFilterType; labelKey: string }[] = [
    { value: 'today', labelKey: 'today' },
    { value: 'yesterday', labelKey: 'yesterday' },
    { value: 'this-week', labelKey: 'thisWeek' },
    { value: 'this-month', labelKey: 'thisMonth' },
    { value: 'all', labelKey: 'allTime' },
];

interface DayFilterProps {
    labels: Record<string, string>;
    className?: string;
}

export function DayFilter({ labels, className }: DayFilterProps) {
    const { dayFilter, setDayFilter } = useChatFilterStore();

    return (
        <div className={cn('flex items-center gap-1.5 overflow-x-auto scrollbar-hide', className)}>
            {dayOptions.map((option) => (
                <button
                    key={option.value}
                    onClick={() => setDayFilter(option.value)}
                    className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                        'transition-all duration-200 cursor-pointer',
                        dayFilter === option.value
                            ? 'bg-brand-primary text-white'
                            : 'bg-background-tertiary text-text-secondary hover:bg-background-tertiary/80 hover:text-text-primary'
                    )}
                >
                    {labels[option.labelKey] || option.labelKey}
                </button>
            ))}
        </div>
    );
}
