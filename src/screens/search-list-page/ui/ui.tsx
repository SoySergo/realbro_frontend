'use client';

import { useEffect, useState, useCallback, useMemo, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    Loader2,
    SortAsc,
    SortDesc,
    Map,
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    StickyNote,
    Share2,
    Flag,
    MapPin,
    Clock,
    Train,
    Bus,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import {
    SearchFiltersBar,
    MobileSearchHeader,
    MobileFiltersSheet,
} from '@/widgets/search-filters-bar';
import type { PropertiesListResponse } from '@/shared/api/properties-server';
import type { SearchFilters } from '@/entities/filter';
import type { Property } from '@/entities/property';
import { cn, safeImageSrc } from '@/shared/lib/utils';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';

type SearchListPageProps = {
    initialData: PropertiesListResponse;
    initialFilters: SearchFilters;
    initialPage: number;
    initialSortBy: PropertySortBy;
    initialSortOrder: PropertySortOrder;
};

/**
 * SearchListPage - страница листинга недвижимости (ISR)
 *
 * Server Components для SEO + клиентская интерактивность
 * - Начальные данные приходят с сервера (ISR cached)
 * - Пагинация и сортировка обновляют URL
 * - Фильтры синхронизируются с URL параметрами
 */
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
    const [isPending, startTransition] = useTransition();

    const tCommon = useTranslations('common');
    const tFilters = useTranslations('filters');
    const tMap = useTranslations('map');
    const tListing = useTranslations('listing');

    // State
    const [properties, setProperties] = useState<Property[]>(initialData.data);
    const [pagination, setPagination] = useState(initialData.pagination);
    const [page, setPage] = useState(initialPage);
    const [sortBy, setSortBy] = useState<PropertySortBy>(initialSortBy);
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>(initialSortOrder);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: 'По дате' },
        { value: 'price', label: tFilters('price') },
        { value: 'area', label: tFilters('area') },
    ];

    // Update URL when pagination/sort changes
    const updateUrl = useCallback(
        (newPage: number, newSortBy: PropertySortBy, newSortOrder: PropertySortOrder) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(newPage));
            params.set('sortBy', newSortBy);
            params.set('sortOrder', newSortOrder);

            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
            });
        },
        [router, pathname, searchParams]
    );

    // Handle sort change
    const handleSortChange = (value: string) => {
        const newSortBy = value as PropertySortBy;
        setSortBy(newSortBy);
        setPage(1);
        updateUrl(1, newSortBy, sortOrder);
    };

    // Toggle sort order
    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        updateUrl(page, sortBy, newOrder);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateUrl(newPage, sortBy, sortOrder);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Navigate to map view
    const handleShowOnMap = () => {
        const params = new URLSearchParams(searchParams.toString());
        // Preserve current filters in URL
        router.push(`/search/map?${params.toString()}`);
    };

    // Handle property click
    const handlePropertyClick = useCallback((property: Property) => {
        router.push(`/search/property/${property.id}`);
    }, [router]);

    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex flex-col">
                {/* Mobile header */}
                <div className="md:hidden">
                    <MobileSearchHeader onOpenFilters={() => setIsMobileFiltersOpen(true)} />
                </div>

                {/* Mobile filters sheet */}
                <MobileFiltersSheet
                    open={isMobileFiltersOpen}
                    onOpenChange={setIsMobileFiltersOpen}
                />

                {/* Desktop filters bar */}
                <div className="shrink-0 hidden md:block">
                    <SearchFiltersBar />
                </div>

                {/* Sticky Header with sort controls */}
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

                                {/* Sort controls */}
                                <div className="flex items-center gap-2">
                                    <Select value={sortBy} onValueChange={handleSortChange}>
                                        <SelectTrigger className="w-[140px] h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
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

                            {/* Show on map button */}
                            <Button variant="outline" onClick={handleShowOnMap} className="gap-2">
                                <Map className="w-4 h-4" />
                                {tMap('showMap')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Loading overlay */}
                {isPending && (
                    <div className="fixed inset-0 bg-background/50 z-50 flex items-center justify-center">
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

                {/* Properties grid */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6 pt-1 md:pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        {properties.map((property) => (
                            <PropertyListingCard
                                key={property.id}
                                property={property}
                                onClick={() => handlePropertyClick(property)}
                            />
                        ))}
                    </div>

                    {/* Empty state */}
                    {properties.length === 0 && (
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
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1 || isPending}
                        >
                            {tCommon('back')}
                        </Button>
                        <span className="text-sm text-text-secondary">
                            {page} {tCommon('of')} {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= pagination.totalPages || isPending}
                        >
                            {tCommon('next')}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

// ===== Property Card Component =====

const MAX_HOVER_IMAGES = 6;

function PropertyListingCard({
    property,
    onClick,
}: {
    property: Property;
    onClick?: () => void;
}) {
    const t = useTranslations('property');
    const tTypes = useTranslations('propertyTypes');

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [dislikeAnimating, setDislikeAnimating] = useState(false);

    const mockProperty = useMemo(
        () => ({
            ...property,
            totalFloors: property.totalFloors ?? 5,
            pricePerMeter: property.pricePerMeter ?? Math.round(property.price / property.area),
            nearbyTransport: property.nearbyTransport ?? {
                type: 'metro' as const,
                name: 'Diagonal',
                line: 'L3',
                color: '#339933',
                walkMinutes: 5,
            },
            author: property.author ?? {
                id: '1',
                name: 'Maria Garcia',
                avatar: `https://i.pravatar.cc/150?u=${property.id}`,
                type: 'agent' as const,
                isVerified: true,
            },
        }),
        [property]
    );

    const timeAgo = useMemo(() => {
        const now = new Date();
        const created = new Date(property.createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('justNow');
        if (diffMins < 60) return t('minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('hoursAgo', { count: diffHours });
        return t('daysAgo', { count: diffDays });
    }, [property.createdAt, t]);

    const displayImages = property.images.slice(0, MAX_HOVER_IMAGES);
    const extraImagesCount = property.images.length - MAX_HOVER_IMAGES;

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!isHovering || displayImages.length <= 1) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const segmentWidth = rect.width / displayImages.length;
            const newIndex = Math.min(Math.floor(x / segmentWidth), displayImages.length - 1);

            if (newIndex !== currentImageIndex) {
                setCurrentImageIndex(newIndex);
            }
        },
        [isHovering, displayImages.length, currentImageIndex]
    );

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 500);
    };

    const handleDislike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDislikeAnimating(true);
        setTimeout(() => setDislikeAnimating(false), 500);
    };

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU') + ' \u20ac';
    };

    const getTransportIcon = (type: string) => {
        switch (type) {
            case 'metro':
                return (
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: mockProperty.nearbyTransport?.color || '#E50914' }}
                    />
                );
            case 'train':
                return <Train className="w-3.5 h-3.5 flex-shrink-0" />;
            case 'bus':
                return <Bus className="w-3.5 h-3.5 flex-shrink-0" />;
            default:
                return null;
        }
    };

    return (
        <div
            className={cn(
                'bg-card rounded-xl overflow-hidden border-2 border-transparent',
                'hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl',
                'cursor-pointer group'
            )}
            onClick={onClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                setCurrentImageIndex(0);
            }}
        >
            {/* Image with hover slider */}
            <div className="relative aspect-square" onMouseMove={handleMouseMove}>
                <Image
                    src={
                        displayImages[currentImageIndex]
                            ? safeImageSrc(displayImages[currentImageIndex])
                            : '/placeholder-property.jpg'
                    }
                    alt={property.title}
                    fill
                    className="object-cover transition-opacity duration-200"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Image indicators */}
                {displayImages.length > 1 && isHovering && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {displayImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full transition-all',
                                    idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Extra images overlay */}
                {extraImagesCount > 0 &&
                    currentImageIndex === displayImages.length - 1 &&
                    isHovering && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-lg font-medium">
                                {t('viewMore', { count: extraImagesCount })}
                            </span>
                        </div>
                    )}

                {/* Author avatar and time */}
                <div className="absolute top-3 right-3 z-10">
                    {mockProperty.author && (
                        <div className="flex items-center gap-1.5 bg-card/95 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1 shadow-md">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={safeImageSrc(mockProperty.author.avatar)} />
                                <AvatarFallback className="text-xs">
                                    {mockProperty.author.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-text-secondary">{timeAgo}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Card content */}
            <div className="p-4">
                {/* Price and buttons */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                        <div className="text-xl font-bold text-foreground truncate">
                            {formatPrice(mockProperty.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {mockProperty.pricePerMeter?.toLocaleString('ru-RU')} {t('pricePerMeter')}
                        </div>
                    </div>

                    {/* Like/dislike buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-green-500/20 hover:text-green-600 text-muted-foreground transition-colors"
                            onClick={handleLike}
                            title={t('like')}
                        >
                            <ThumbsUp
                                className={cn('w-5 h-5', likeAnimating && 'animate-bounce')}
                            />
                        </button>
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-500/20 hover:text-red-500 text-muted-foreground transition-colors"
                            onClick={handleDislike}
                            title={t('dislike')}
                        >
                            <ThumbsDown
                                className={cn('w-5 h-5', dislikeAnimating && 'animate-bounce')}
                            />
                        </button>
                    </div>
                </div>

                {/* Characteristics */}
                <div className="flex items-center gap-1.5 text-sm text-foreground mb-2">
                    <span className="font-semibold whitespace-nowrap">
                        {property.bedrooms} {t('roomsShort')}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="whitespace-nowrap">{property.area} м²</span>
                    {mockProperty.floor && mockProperty.totalFloors && (
                        <>
                            <span className="text-muted-foreground">•</span>
                            <span className="whitespace-nowrap">
                                {t('floorOf', {
                                    floor: mockProperty.floor,
                                    total: mockProperty.totalFloors,
                                })}
                            </span>
                        </>
                    )}
                </div>

                {/* Property type */}
                <div className="text-sm text-primary font-medium mb-2 truncate">
                    {tTypes(property.type)}
                </div>

                {/* Address */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                        {property.address}, {property.city}
                    </span>
                </div>

                {/* Transport and menu */}
                <div className="flex items-center justify-between">
                    {mockProperty.nearbyTransport ? (
                        <div className="flex items-center gap-2 text-sm min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                {getTransportIcon(mockProperty.nearbyTransport.type)}
                                <span className="text-foreground truncate">
                                    {mockProperty.nearbyTransport.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {t('walkMin', { min: mockProperty.nearbyTransport.walkMinutes })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div />
                    )}

                    {/* More actions menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-secondary text-muted-foreground transition-colors flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="gap-2 cursor-pointer"
                            >
                                <StickyNote className="w-4 h-4" />
                                {t('addNote')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="gap-2 cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" />
                                {t('share')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="gap-2 cursor-pointer text-destructive"
                            >
                                <Flag className="w-4 h-4" />
                                {t('report')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
