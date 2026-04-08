'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/shared/config/routing';
import { AiAgentStories } from '@/widgets/ai-agent-stories';
import { PropertyCardGrid, PropertyCardHorizontal } from '@/entities/property';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import { MapPreview } from '@/widgets/map-preview';
import { getPropertiesList } from '@/shared/api';
import type { PropertyGridCard } from '@/entities/property';
import type { PropertiesListResponse } from '@/shared/api/properties-server';
import {
    useFilterStore,
    MobileSearchHeader,
    MobileFiltersSheet,
    MobileViewToggle,
    useListingViewMode,
    useViewModeActions,
} from '@/widgets/search-filters-bar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { CatalogFiltersToolbar } from './_catalog-filters';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';

const sortOptions: { value: PropertySortBy; labelKey: string }[] = [
    { value: 'createdAt', labelKey: 'sortByDate' },
    { value: 'price', labelKey: 'sortByPrice' },
    { value: 'area', labelKey: 'sortByArea' },
];

/**
 * CatalogPage — страница каталога объектов.
 *
 * Desktop-структура (сверху вниз):
 * 1. Хедер (не фиксированный, скроллится)
 * 2. Панель фильтров (CatalogFiltersToolbar) — sticky top
 * 3. Заголовок слева + «Смотреть на карте» справа
 * 4. Количество + сортировка
 * 5. AI Agent Stories
 * 6. Сетка/список карточек объектов с infinite scroll
 */
export default function CatalogPage() {
    const tListing = useTranslations('listing');
    const params = useParams();
    const router = useRouter();
    const type = params.type as string;
    const locale = params.locale as string;

    const { currentFilters } = useFilterStore();

    const [properties, setProperties] = useState<PropertyGridCard[]>([]);
    const [pagination, setPagination] = useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');
    const [isMapVisible, setIsMapVisible] = useState(true);

    const { listingViewMode, setListingViewMode } = useListingViewMode();
    const { setSearchViewMode } = useViewModeActions();

    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const mapPreviewRef = useRef<HTMLDivElement>(null);

    // Sync searchViewMode to 'list' on mount (this page is list/catalog mode)
    useEffect(() => {
        setSearchViewMode('list');
    }, [setSearchViewMode]);

    // Track MapPreview visibility
    useEffect(() => {
        const mapElement = mapPreviewRef.current;
        if (!mapElement) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsMapVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        observer.observe(mapElement);
        return () => observer.disconnect();
    }, []);

    // Загрузка объектов
    const fetchProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getPropertiesList({
                filters: currentFilters,
                page: 1,
                limit: 24,
                sortBy,
                sortOrder,
            });
            setProperties(response.data);
            setPagination(response.pagination);
            setPage(1);
        } catch (error) {
            console.error('Failed to fetch catalog properties:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentFilters, sortBy, sortOrder]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // Infinite scroll
    const totalPages = pagination?.totalPages ?? 1;
    const hasMore = page < totalPages;

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await getPropertiesList({
                filters: currentFilters,
                page: nextPage,
                limit: 24,
                sortBy,
                sortOrder,
            });
            setProperties(prev => [...prev, ...response.data]);
            setPagination(response.pagination);
            setPage(nextPage);
        } catch (error) {
            console.error('Failed to load more catalog properties:', error);
        } finally {
            setIsLoadingMore(false);
            loadingRef.current = false;
        }
    }, [page, hasMore, currentFilters, sortBy, sortOrder]);

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

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const handleShowOnMap = () => {
        router.push(`/${type}/map`);
    };

    const handlePropertyClick = useCallback(
        (property: PropertyGridCard) => {
            router.push(`/${type}/${property.slug || property.id}`);
        },
        [router, type]
    );

    return (
        <>
            <div className="flex flex-col min-h-full bg-background rounded-[9px]">
                {/* Mobile header */}
                <div className="slug-desktop:hidden sticky top-0 z-30">
                    <MobileSearchHeader onOpenFilters={() => setIsMobileFiltersOpen(true)} />
                </div>

                {/* Панель фильтров (desktop) — sticky, прилипает вверху при скролле */}
                <CatalogFiltersToolbar />

                {/* Desktop: Title + Map + Sort row */}
                <div className="hidden slug-desktop:flex items-start gap-6 px-6 pt-6 pb-4">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-text-primary truncate">
                                {tListing('title')}
                            </h1>
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[160px] h-8 text-sm border-0 shadow-none text-brand-primary font-medium p-0 gap-1">
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
                        </div>
                        {pagination?.total != null && !isNaN(pagination.total) && pagination.total > 0 && (
                            <span className="text-sm text-text-secondary">
                                {tListing('subtitle', {
                                    count: pagination.total.toLocaleString(locale),
                                })}
                            </span>
                        )}
                    </div>
                    <MapPreview onOpenMap={handleShowOnMap} variant="inline" />
                </div>

                {/* Mobile: Title + Count */}
                <div className="slug-desktop:hidden px-3 pt-4 pb-2">
                    <h1 className="text-lg font-bold text-text-primary">
                        {tListing('title')}
                    </h1>
                    {pagination?.total != null && !isNaN(pagination.total) && pagination.total > 0 && (
                        <span className="text-sm text-text-secondary">
                            {tListing('subtitle', {
                                count: pagination.total.toLocaleString(locale),
                            })}
                        </span>
                    )}
                </div>

                {/* Mobile: Map Preview */}
                <div className="slug-desktop:hidden">
                    <MapPreview ref={mapPreviewRef} onOpenMap={handleShowOnMap} />
                </div>

                {/* AI Agent Stories */}
                <AiAgentStories properties={properties.slice(0, 10)} />

                {/* Properties grid / list */}
                <div className="flex-1 p-3 md:p-6 pt-1 md:pt-4 min-w-0 overflow-hidden">
                    {isLoading ? (
                        <CatalogGridSkeleton />
                    ) : (
                        <>
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
                        </>
                    )}

                    {/* Пустое состояние */}
                    {!isLoading && properties.length === 0 && (
                        <div className="text-center py-12 text-text-secondary">
                            <p className="text-lg">{tListing('emptyTitle')}</p>
                            <p className="text-sm mt-2">{tListing('emptySubtitle')}</p>
                        </div>
                    )}

                    {/* Sentinel для infinite scroll */}
                    {hasMore && <div ref={sentinelRef} className="h-10" />}
                    {isLoadingMore && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Map Button — mobile, visible when MapPreview scrolled out */}
            {!isMapVisible && !isMobileFiltersOpen && (
                <div className="slug-desktop:hidden">
                    <MobileViewToggle />
                </div>
            )}

            {/* Mobile filters sheet */}
            <MobileFiltersSheet
                open={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
            />
        </>
    );
}

/** Скелетон сетки карточек */
function CatalogGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-card rounded-xl overflow-hidden border border-border"
                >
                    <div className="aspect-square bg-background-secondary animate-pulse" />
                    <div className="p-4 space-y-3">
                        <div className="h-6 w-24 bg-background-secondary animate-pulse rounded" />
                        <div className="h-4 w-32 bg-background-secondary animate-pulse rounded" />
                        <div className="h-4 w-full bg-background-secondary animate-pulse rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

