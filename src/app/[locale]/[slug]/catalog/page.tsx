'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Map as MapIcon, Loader2 } from 'lucide-react';
import { AiAgentStories } from '@/widgets/ai-agent-stories';
import { PropertyCardGrid } from '@/entities/property';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import { getPropertiesList } from '@/shared/api';
import type { PropertyGridCard } from '@/entities/property';
import type { PropertiesListResponse } from '@/shared/api/properties-server';
import { useFilterStore, MobileSearchHeader, MobileFiltersSheet } from '@/widgets/search-filters-bar';
import { cn } from '@/shared/lib/utils';
import { useCatalogContext } from '../_catalog-context';
import { CatalogFiltersToolbar } from './_catalog-filters';

/**
 * CatalogPage — страница каталога объектов.
 *
 * Структура:
 * 1. AI Agent Stories (карусель мини-карточек от агента)
 * 2. Панель фильтров (CatalogFiltersToolbar)
 * 3. Сетка карточек объектов с infinite scroll
 * 4. Плавающая кнопка «Смотреть на карте» (появляется при скролле фильтров из viewport)
 */
export default function CatalogPage() {
    const tListing = useTranslations('listing');
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const locale = params.locale as string;

    const { currentFilters } = useFilterStore();
    const { filtersVisible, setFiltersVisible } = useCatalogContext();

    const [properties, setProperties] = useState<PropertyGridCard[]>([]);
    const [pagination, setPagination] = useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const filtersRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    // Загрузка объектов
    const fetchProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getPropertiesList({
                filters: currentFilters,
                page: 1,
                limit: 24,
            });
            setProperties(response.data);
            setPagination(response.pagination);
            setPage(1);
        } catch (error) {
            console.error('Failed to fetch catalog properties:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentFilters]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // Отслеживание видимости фильтров для смены хедера (desktop)
    useEffect(() => {
        const el = filtersRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setFiltersVisible(entry.isIntersecting);
            },
            { threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [setFiltersVisible]);

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
    }, [page, hasMore, currentFilters]);

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

    const handlePropertyClick = useCallback(
        (property: PropertyGridCard) => {
            router.push(`/${locale}/property/${property.slug || property.id}`);
        },
        [router, locale]
    );

    const handleShowOnMap = () => {
        router.push(`/${locale}/${slug}/map`);
    };

    return (
        <>
            <div className="flex flex-col h-full bg-background rounded-[9px] overflow-auto">
                {/* Mobile header */}
                <div className="slug-desktop:hidden sticky top-0 z-30">
                    <MobileSearchHeader onOpenFilters={() => setIsMobileFiltersOpen(true)} />
                </div>

                {/* AI Agent Stories */}
                <AiAgentStories properties={properties.slice(0, 10)} />

                {/* Панель фильтров (desktop) — отслеживается IntersectionObserver */}
                <div ref={filtersRef}>
                    <CatalogFiltersToolbar />
                </div>

                {/* Сетка карточек */}
                <div className="flex-1 p-3 slug-desktop:p-6 pt-2 slug-desktop:pt-4 min-w-0">
                    {isLoading ? (
                        <CatalogGridSkeleton />
                    ) : (
                        <>
                            {/* Счётчик */}
                            {pagination?.total != null && pagination.total > 0 && (
                                <p className="text-sm text-text-secondary mb-3">
                                    {tListing('subtitle', {
                                        count: pagination.total.toLocaleString('ru-RU'),
                                    })}
                                </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 slug-desktop:grid-cols-3 gap-2 sm:gap-3 slug-desktop:gap-4">
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

            {/* Плавающая кнопка «Смотреть на карте» — появляется когда фильтры вне viewport */}
            {!filtersVisible && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <button
                        onClick={handleShowOnMap}
                        className={cn(
                            'flex items-center gap-2 px-5 py-3',
                            'bg-brand-primary text-white rounded-full shadow-lg',
                            'hover:bg-brand-primary-hover transition-colors',
                            'text-sm font-medium'
                        )}
                    >
                        <MapIcon className="w-5 h-5" />
                        {tListing('showOnMap')}
                    </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 slug-desktop:grid-cols-3 gap-2 sm:gap-3 slug-desktop:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
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

