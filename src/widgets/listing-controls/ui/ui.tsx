'use client';

import { useTranslations } from 'next-intl';
import {
    SortAsc,
    SortDesc,
    Map,
    LayoutGrid,
    LayoutList,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib/utils';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';
type ListingViewMode = 'grid' | 'list';

interface ListingControlsProps {
    totalCount?: number;
    sortBy: PropertySortBy;
    sortOrder: PropertySortOrder;
    viewMode: ListingViewMode;
    onSortByChange: (value: string) => void;
    onSortOrderToggle: () => void;
    onViewModeChange: (mode: ListingViewMode) => void;
    onShowOnMap: () => void;
}

export function ListingControls({
    totalCount,
    sortBy,
    sortOrder,
    viewMode,
    onSortByChange,
    onSortOrderToggle,
    onViewModeChange,
    onShowOnMap,
}: ListingControlsProps) {
    const tListing = useTranslations('listing');

    const sortOptions: { value: PropertySortBy; labelKey: string }[] = [
        { value: 'createdAt', labelKey: 'sortByDate' },
        { value: 'price', labelKey: 'sortByPrice' },
        { value: 'area', labelKey: 'sortByArea' },
    ];

    return (
        <div className="hidden md:block border-b border-border">
            <div className="px-6 py-3 flex items-center justify-between">
                {/* Left: count + sort */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary">
                        {totalCount
                            ? tListing('subtitle', {
                                  count: totalCount.toLocaleString('ru-RU'),
                              })
                            : ''}
                    </span>

                    {/* Sort controls */}
                    <div className="flex items-center gap-2">
                        <Select value={sortBy} onValueChange={onSortByChange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {tListing(option.labelKey)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSortOrderToggle}
                            className="h-9 w-9 p-0"
                        >
                            {sortOrder === 'asc' ? (
                                <SortAsc className="w-4 h-4" />
                            ) : (
                                <SortDesc className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right: view toggle + map */}
                <div className="flex items-center gap-3">
                    {/* View mode toggle */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                                viewMode === 'grid'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-text-secondary hover:bg-background-secondary'
                            )}
                            onClick={() => onViewModeChange('grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            {tListing('viewModeGrid')}
                        </button>
                        <button
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                                viewMode === 'list'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-text-secondary hover:bg-background-secondary'
                            )}
                            onClick={() => onViewModeChange('list')}
                        >
                            <LayoutList className="w-4 h-4" />
                            {tListing('viewModeList')}
                        </button>
                    </div>

                    {/* Show on map button */}
                    <Button
                        variant="outline"
                        onClick={onShowOnMap}
                        className="gap-2 bg-background border border-border dark:border-transparent text-text-primary hover:text-text-primary"
                    >
                        <Map className="w-4 h-4" />
                        {tListing('showOnMap')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
