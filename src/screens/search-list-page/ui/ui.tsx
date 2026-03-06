'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import {
    SearchFiltersBar,
    MobileSearchHeader,
    MobileFiltersSheet,
    useListingViewMode,
    MobileViewToggle,
    useViewModeActions,
} from '@/widgets/search-filters-bar';
import { HeaderSlot } from '@/widgets/app-header';
import { ListingControls } from '@/widgets/listing-controls';
import { AiAgentStories } from '@/widgets/ai-agent-stories';
import { MapPreview } from '@/widgets/map-preview';
import { PropertyCardGrid, PropertyCardHorizontal } from '@/entities/property';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import { getPropertiesList } from '@/shared/api';
import type { PropertiesListResponse } from '@/shared/api/properties-server';
import type { SearchFilters } from '@/entities/filter';
import type { PropertyGridCard } from '@/entities/property';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';

type SearchListPageProps = {
    initialData: PropertiesListResponse;
    initialFilters: SearchFilters;
    initialPage: number;
    initialSortBy: PropertySortBy;
    initialSortOrder: PropertySortOrder;
};

export function SearchListPage({
    initialData,
    initialFilters,
    initialPage,
    initialSortBy,
    initialSortOrder,
}: SearchListPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const tListing = useTranslations('listing');

    // State
    const [properties, setProperties] = useState<PropertyGridCard[]>(initialData.data);
    const [pagination, setPagination] = useState(initialData.pagination);
    const [page, setPage] = useState(initialPage);
    const [sortBy, setSortBy] = useState<PropertySortBy>(initialSortBy);
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>(initialSortOrder);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    // Ref for MapPreview to track visibility
    const mapPreviewRef = useRef<HTMLDivElement>(null);

    // Listing view mode from store (grid / list)
    const { listingViewMode, setListingViewMode } = useListingViewMode();

    // Get setSearchViewMode to sync store with this page
    const { setSearchViewMode } = useViewModeActions();

    // Sync searchViewMode to 'list' on mount (this page is list mode)
    useEffect(() => {
        setSearchViewMode('list');
    }, [setSearchViewMode]);

    // Track MapPreview visibility with IntersectionObserver
    useEffect(() => {
        const mapElement = mapPreviewRef.current;
        if (!mapElement) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsMapVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(mapElement);
        return () => observer.disconnect();
    }, []);

    // Update URL when sort changes (no page in URL for infinite scroll)
    const updateUrl = useCallback(
        (newSortBy: PropertySortBy, newSortOrder: PropertySortOrder) => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('page');
            params.set('sortBy', newSortBy);
            params.set('sortOrder', newSortOrder);

            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [router, pathname, searchParams]
    );

    const handleSortChange = (value: string) => {
        const newSortBy = value as PropertySortBy;
        setSortBy(newSortBy);
        setPage(1);
        setProperties(initialData.data);
        setPagination(initialData.pagination);
        updateUrl(newSortBy, sortOrder);
    };

    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        setPage(1);
        setProperties(initialData.data);
        setPagination(initialData.pagination);
        updateUrl(sortBy, newOrder);
    };

    // Подгрузка следующей страницы при скролле
    const totalPages = pagination?.totalPages ?? 1;
    const hasMore = page < totalPages;

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await getPropertiesList({
                filters: initialFilters,
                page: nextPage,
                limit: 24,
                sortBy,
                sortOrder,
            });
            setProperties(prev => [...prev, ...response.data]);
            setPagination(response.pagination);
            setPage(nextPage);
        } catch (error) {
            console.error('Failed to load more properties:', error);
        } finally {
            setIsLoadingMore(false);
            loadingRef.current = false;
        }
    }, [page, hasMore, initialFilters, sortBy, sortOrder]);

    // IntersectionObserver для sentinel элемента в конце списка
    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    const handleShowOnMap = () => {
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/search/properties/map?${params.toString()}`);
    };

    const handlePropertyClick = useCallback(
        (property: PropertyGridCard) => {
            router.push(`/property/${property.slug || property.id}`);
        },
        [router]
    );

    return (
        <div className="flex min-h-screen bg-background">
            {/* Фильтры в общем хедере — только desktop */}
            <HeaderSlot>
                <SearchFiltersBar />
            </HeaderSlot>

            <main className="flex-1 md:ml-14 pb-16 md:pb-0 flex flex-col min-w-0">
                {/* Mobile header */}
                <div className="md:hidden">
                    <MobileSearchHeader onOpenFilters={() => setIsMobileFiltersOpen(true)} />
                </div>

                {/* Page Title (Desktop) */}
                <div className="hidden md:block mt-[52px] px-6 pt-6">
                    <h1 className="text-2xl font-bold text-text-primary">
                        {tListing('title')}
                    </h1>
                </div>

                {/* Controls bar */}
                <ListingControls
                    totalCount={pagination?.total}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    viewMode={listingViewMode}
                    onSortByChange={handleSortChange}
                    onSortOrderToggle={toggleSortOrder}
                    onViewModeChange={setListingViewMode}
                    onShowOnMap={handleShowOnMap}
                />

                {/* Mobile counter */}
                {pagination?.total != null && !isNaN(pagination.total) && pagination.total > 0 && (
                    <div className="md:hidden px-3 pt-2 pb-1">
                        <span className="text-sm text-text-secondary">
                            {tListing('subtitle', {
                                count: pagination.total.toLocaleString('ru-RU'),
                            })}
                        </span>
                    </div>
                )}

                {/* Map Preview (mobile only) */}
                <MapPreview ref={mapPreviewRef} onOpenMap={handleShowOnMap} />

                {/* AI Agent Stories */}
                <AiAgentStories properties={properties.slice(0, 10)} />

                {/* Properties grid / list */}
                <div className="flex-1 p-3 md:p-6 pt-1 md:pt-4 min-w-0 overflow-hidden">
                    {listingViewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                            {properties.map((property) => (
                                <PropertyCardGrid
                                    key={property.id}
                                    property={property}
                                    onClick={() => handlePropertyClick(property)}
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
                                    onClick={() => handlePropertyClick(property)}
                                    actions={<PropertyCompareButton property={property} size="md" />}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {properties.length === 0 && (
                        <div className="text-center py-12 text-text-secondary">
                            <p className="text-lg">{tListing('emptyTitle')}</p>
                            <p className="text-sm mt-2">{tListing('emptySubtitle')}</p>
                        </div>
                    )}

                    {/* Sentinel элемент для infinite scroll */}
                    {hasMore && <div ref={sentinelRef} className="h-10" />}
                    {isLoadingMore && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Map Button - visible when MapPreview is scrolled out of view and filters are closed */}
            {!isMapVisible && !isMobileFiltersOpen && (
                <div className="md:hidden">
                    <MobileViewToggle />
                </div>
            )}

            {/* Mobile filters sheet - outside main to avoid stacking context issues */}
            <MobileFiltersSheet
                open={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
            />
        </div>
    );
}
