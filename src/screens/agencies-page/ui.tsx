'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from '@/shared/config/routing';
import { useTranslations } from 'next-intl';
import {
    Building2,
    SortAsc,
    SortDesc,
    LayoutGrid,
    LayoutList,
    Map,
} from 'lucide-react';
import { AgencyCard, AgencyCardHorizontal } from '@/entities/agency';
import { useAgencyFilters } from '@/features/agency-filters';
import { SearchFiltersBar, MobileSearchHeader, MobileFiltersSheet } from '@/widgets/search-filters-bar';
import { AgencyStories } from '@/widgets/agency-stories';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib/utils';
import { getAgenciesList } from '@/shared/api';
import type { AgencyCardData, AgencySortType } from '@/entities/agency';

interface AgenciesPageProps {
    locale: string;
    initialAgencies?: AgencyCardData[];
}

type ViewMode = 'grid' | 'list';

/**
 * Страница поиска агентств недвижимости
 * Стиль аналогичен SearchListPage для недвижимости
 */
export function AgenciesPage({ locale, initialAgencies = [] }: AgenciesPageProps) {
    const t = useTranslations('agency');
    const tCommon = useTranslations('common');
    const tListing = useTranslations('listing');
    const router = useRouter();

    const [agencies, setAgencies] = useState<AgencyCardData[]>(initialAgencies);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<AgencySortType>('rating');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const { filters } = useAgencyFilters();

    // Загрузка агентств
    const loadAgencies = useCallback(
        async (pageNum: number, append = false) => {
            setIsLoading(true);
            try {
                const result = await getAgenciesList(
                    { ...filters, sort: sortBy, sortOrder },
                    pageNum,
                    12,
                    locale,
                );

                if (append) {
                    setAgencies((prev) => [...prev, ...result.data]);
                } else {
                    setAgencies(result.data);
                }

                setTotalCount(result.pagination.total);
                setHasMore(pageNum < result.pagination.totalPages);
            } catch (error) {
                console.error('Failed to load agencies:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [filters, locale, sortBy, sortOrder]
    );

    // Загрузка при изменении фильтров
    useEffect(() => {
        setPage(1);
        loadAgencies(1, false);
    }, [loadAgencies]);

    // Загрузить ещё
    const handleLoadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadAgencies(nextPage, true);
    }, [page, loadAgencies]);

    const handleSortChange = (value: string) => {
        setSortBy(value as AgencySortType);
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handleShowOnMap = () => {
        router.push('/search/agencies/map');
    };

    const sortOptions: { value: AgencySortType; labelKey: string }[] = [
        { value: 'rating', labelKey: 'sortRating' },
        { value: 'reviewsCount', labelKey: 'sortReviews' },
        { value: 'objectsCount', labelKey: 'sortObjects' },
        { value: 'name', labelKey: 'sortName' },
    ];

    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex flex-col min-w-0">
                {/* Мобильный хедер */}
                <div className="md:hidden">
                    <MobileSearchHeader
                        onOpenFilters={() => setIsMobileFiltersOpen(true)}
                        currentCategory="professionals"
                    />
                </div>

                {/* Мобильный sheet фильтров */}
                <MobileFiltersSheet
                    open={isMobileFiltersOpen}
                    onOpenChange={setIsMobileFiltersOpen}
                    currentCategory="professionals"
                />

                {/* Десктоп: единый хедер фильтров */}
                <div className="hidden md:block">
                    <SearchFiltersBar currentCategory="professionals" />
                </div>

                {/* Заголовок страницы (Desktop) */}
                <div className="hidden md:block mt-14 px-6 pt-6">
                    <h1 className="text-2xl font-bold text-text-primary">
                        {t('searchAgencies')}
                    </h1>
                </div>

                {/* Панель управления листингом (Desktop) */}
                <div className="hidden md:block border-b border-border">
                    <div className="px-6 py-3 flex items-center justify-between">
                        {/* Количество + сортировка */}
                        <div className="flex items-center gap-4">
                            {totalCount !== undefined && (
                                <span className="text-sm text-text-secondary">
                                    {tListing('subtitle', {
                                        count: totalCount.toLocaleString('ru-RU'),
                                    })}
                                </span>
                            )}

                            <div className="flex items-center gap-2">
                                <Select value={sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-[140px] h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {t(option.labelKey)}
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

                        {/* Переключатель вида + карта */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                <button
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                                        viewMode === 'grid'
                                            ? 'bg-brand-primary text-white'
                                            : 'text-text-secondary hover:bg-background-secondary'
                                    )}
                                    onClick={() => setViewMode('grid')}
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
                                    onClick={() => setViewMode('list')}
                                >
                                    <LayoutList className="w-4 h-4" />
                                    {tListing('viewModeList')}
                                </button>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleShowOnMap}
                                className="gap-2 bg-background border border-border dark:border-transparent text-text-primary hover:text-text-primary"
                            >
                                <Map className="w-4 h-4" />
                                {tListing('showOnMap')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Мобильный счётчик */}
                {totalCount !== undefined && (
                    <div className="md:hidden px-3 pt-2 pb-1">
                        <span className="text-sm text-text-secondary">
                            {tListing('subtitle', {
                                count: totalCount.toLocaleString('ru-RU'),
                            })}
                        </span>
                    </div>
                )}

                {/* Рекомендации агентств (истории) */}
                <AgencyStories agencies={agencies.slice(0, 10)} locale={locale} />

                {/* Список агентств */}
                <div className="flex-1 p-3 md:p-6 pt-1 md:pt-4 min-w-0 overflow-hidden">
                    {isLoading && agencies.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-background border border-border rounded-xl p-4 animate-pulse"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-14 h-14 rounded-lg bg-background-secondary" />
                                        <div className="flex-1">
                                            <div className="h-5 w-3/4 bg-background-secondary rounded mb-2" />
                                            <div className="h-4 w-1/2 bg-background-secondary rounded" />
                                        </div>
                                    </div>
                                    <div className="h-10 bg-background-secondary rounded mb-3" />
                                    <div className="flex gap-2">
                                        <div className="h-6 w-16 bg-background-secondary rounded" />
                                        <div className="h-6 w-16 bg-background-secondary rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : agencies.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-text-primary mb-2">
                                {t('noAgenciesFound')}
                            </h2>
                            <p className="text-text-secondary">
                                {t('tryChangeFilters')}
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                                {agencies.map((agency) => (
                                    <AgencyCard
                                        key={agency.id}
                                        agency={agency}
                                        locale={locale}
                                    />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-8 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? tCommon('loading') : t('loadMore')}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col">
                                {agencies.map((agency) => (
                                    <AgencyCardHorizontal
                                        key={agency.id}
                                        agency={agency}
                                        locale={locale}
                                    />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-8 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? tCommon('loading') : t('loadMore')}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
