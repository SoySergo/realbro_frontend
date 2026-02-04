'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
    Loader2,
    SortAsc,
    SortDesc,
    Map,
    Grid3x3,
    List,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { getPropertiesList, type PropertiesListResponse } from '@/shared/api';
import type { Property } from '@/entities/property';
import { PropertyCardGrid, PropertyCardHorizontal } from '@/entities/property';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import { cn } from '@/shared/lib/utils';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';

type PropertyListingProps = {
    onPropertyClick?: (property: Property) => void;
    className?: string;
};

/**
 * PropertyListing - full-screen property listing
 * Used in list mode (without map)
 */
export function PropertyListing({ onPropertyClick, className }: PropertyListingProps) {
    const tCommon = useTranslations('common');
    const tFilters = useTranslations('filters');
    const tMap = useTranslations('map');
    const tListing = useTranslations('listing');

    const { currentFilters, setSearchViewMode, listingViewMode, setListingViewMode } = useFilterStore();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] =
        useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: 'По дате' },
        { value: 'price', label: tFilters('price') },
        { value: 'area', label: tFilters('area') },
    ];

    const fetchProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getPropertiesList({
                filters: currentFilters,
                page,
                limit: 24,
                sortBy,
                sortOrder,
            });
            setProperties(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentFilters, page, sortBy, sortOrder]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    useEffect(() => {
        setPage(1);
    }, [sortBy, sortOrder]);

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleShowOnMap = () => {
        setSearchViewMode('map');
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Sticky Header - desktop only */}
            <div className="sticky top-0 z-20 bg-background border-b border-border hidden md:block">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-text-primary mb-3">
                        {tListing('title')}
                    </h1>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-text-secondary">
                                {pagination?.total
                                    ? tListing('subtitle', {
                                        count: pagination.total.toLocaleString('ru-RU'),
                                    })
                                    : ''}
                            </span>

                            <div className="flex items-center gap-2">
                                <Select value={sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-[140px] h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleSortOrder}
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

                        <div className="flex items-center gap-2">
                            <div className="flex items-center border border-border rounded-lg">
                                <Button
                                    variant={listingViewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setListingViewMode('grid')}
                                    className="h-9 rounded-r-none"
                                    title={tListing('viewModeGrid')}
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={listingViewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setListingViewMode('list')}
                                    className="h-9 rounded-l-none"
                                    title={tListing('viewModeList')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleShowOnMap}
                                className="gap-2"
                            >
                                <Map className="w-4 h-4" />
                                {tMap('showMap')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {isLoading && properties.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            )}

            {/* Mobile counter */}
            {pagination?.total && (
                <div className="md:hidden px-3 pt-2 pb-1">
                    <span className="text-sm text-text-secondary">
                        {tListing('subtitle', {
                            count: pagination.total.toLocaleString('ru-RU'),
                        })}
                    </span>
                </div>
            )}

            {/* Property cards */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 pt-1 md:pt-6 min-w-0">
                {listingViewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                        {properties.map((property) => (
                            <PropertyCardGrid
                                key={property.id}
                                property={property}
                                onClick={() => onPropertyClick?.(property)}
                                actions={<PropertyCompareButton property={property} />}
                                menuItems={<PropertyCompareMenuItem property={property} />}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {properties.map((property) => (
                            <PropertyCardHorizontal
                                key={property.id}
                                property={property}
                                onClick={() => onPropertyClick?.(property)}
                                actions={<PropertyCompareButton property={property} size="md" />}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {properties.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-text-secondary">
                        <p className="text-lg">{tListing('emptyTitle')}</p>
                        <p className="text-sm mt-2">{tListing('emptySubtitle')}</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="sticky bottom-0 flex items-center justify-center gap-4 px-3 md:px-6 py-3 md:py-4 border-t border-border bg-background">
                    <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1 || isLoading}
                    >
                        {tCommon('back')}
                    </Button>
                    <span className="text-sm text-text-secondary">
                        {page} {tCommon('of')} {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages || isLoading}
                    >
                        {tCommon('next')}
                    </Button>
                </div>
            )}
        </div>
    );
}
