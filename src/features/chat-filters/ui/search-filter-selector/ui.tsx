'use client';

import { Filter, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatFilterStore } from '../../model/store';

interface FilterOption {
    id: string;
    name: string;
    count?: number;
}

interface SearchFilterSelectorProps {
    filters: FilterOption[];
    allFiltersLabel?: string;
    selectFilterLabel?: string;
    className?: string;
}

export function SearchFilterSelector({
    filters,
    allFiltersLabel = 'All filters',
    selectFilterLabel = 'Select filter',
    className,
}: SearchFilterSelectorProps) {
    const { selectedFilterIds, showAllFilters, toggleFilterId, setShowAllFilters } =
        useChatFilterStore();

    return (
        <div className={cn('flex items-center gap-1.5 overflow-x-auto scrollbar-hide', className)}>
            <Filter className="w-3.5 h-3.5 text-text-tertiary shrink-0" />

            <button
                onClick={() => setShowAllFilters(true)}
                className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                    'transition-all duration-200 flex items-center gap-1.5 cursor-pointer',
                    showAllFilters
                        ? 'bg-brand-primary text-white'
                        : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
                )}
            >
                {showAllFilters && <Check className="w-3 h-3" />}
                {allFiltersLabel}
            </button>

            {filters.map((filter) => {
                const isSelected = selectedFilterIds.includes(filter.id);
                return (
                    <button
                        key={filter.id}
                        onClick={() => toggleFilterId(filter.id)}
                        className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                            'transition-all duration-200 flex items-center gap-1.5 cursor-pointer',
                            isSelected
                                ? 'bg-brand-primary text-white'
                                : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
                        )}
                    >
                        {isSelected && <Check className="w-3 h-3" />}
                        {filter.name}
                        {filter.count !== undefined && (
                            <span
                                className={cn(
                                    'text-[10px] px-1.5 py-0.5 rounded-full',
                                    isSelected
                                        ? 'bg-white/20'
                                        : 'bg-background-secondary'
                                )}
                            >
                                {filter.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
