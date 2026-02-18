'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/shared/config/routing';
import dynamic from 'next/dynamic';
import {
    Building2,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    ArrowUpDown,
    List as ListIcon,
    Loader2,
    MapPin,
} from 'lucide-react';
import {
    SearchFiltersBar,
    MobileSearchHeader,
    MobileFiltersSheet,
    MobileViewToggle,
} from '@/widgets/search-filters-bar';
import { HeaderSlot } from '@/widgets/app-header';
import { AgencyCard } from '@/entities/agency';
import { useAgencyFilters } from '@/features/agency-filters';
import { getAgenciesList } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib/utils';
import type { AgencyCardData, AgencySortType } from '@/entities/agency';

// Lazy load Mapbox для оптимизации
const SearchMap = dynamic(
    () => import('@/features/map').then((mod) => ({ default: mod.SearchMap })),
    {
        ssr: false,
        loading: () => <AgencyMapLoadingPlaceholder />,
    }
);

/**
 * Страница карты агентств с сайдбаром
 * Аналогична SearchMapPage для объектов недвижимости
 */
export function AgenciesMapPage() {
    const t = useTranslations('agency');
    const tMapSidebar = useTranslations('mapSidebar');
    const router = useRouter();

    const [agencies, setAgencies] = useState<AgencyCardData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState<AgencySortType>('rating');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Desktop sidebar visibility
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // Mobile bottom sheet state
    const [mobileSnapState, setMobileSnapState] = useState<'collapsed' | 'expanded'>('collapsed');

    const { filters } = useAgencyFilters();
    const loadingRef = useRef(false);

    // Загрузка агентств
    const loadAgencies = useCallback(
        async (pageNum: number, append = false) => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setIsLoading(true);

            try {
                const result = await getAgenciesList(
                    { ...filters, sort: sortBy, sortOrder },
                    pageNum,
                    20,
                    'ru',
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
                loadingRef.current = false;
            }
        },
        [filters, sortBy, sortOrder]
    );

    useEffect(() => {
        setPage(1);
        loadAgencies(1, false);
    }, [loadAgencies]);

    // Сброс при изменении фильтров/сортировки
    useEffect(() => {
        setPage(1);
        setAgencies([]);
    }, [sortBy, sortOrder, filters]);

    const handleSortChange = (value: string) => {
        setSortBy(value as AgencySortType);
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handleSwitchToList = () => {
        router.push('/search/agencies/list');
    };

    const handleAgencyClick = useCallback(
        (agency: AgencyCardData) => {
            router.push(`/agency/${agency.id}`);
        },
        [router]
    );

    const sortOptions: { value: AgencySortType; label: string }[] = [
        { value: 'rating', label: t('sortRating') },
        { value: 'reviewsCount', label: t('sortReviews') },
        { value: 'objectsCount', label: t('sortObjects') },
        { value: 'name', label: t('sortName') },
    ];

    const isExpanded = mobileSnapState === 'expanded';

    return (
        <div className="flex h-dvh bg-background overflow-hidden">
            {/* Фильтры в общем хедере — только desktop */}
            <HeaderSlot>
                <SearchFiltersBar currentCategory="professionals" />
            </HeaderSlot>

            <main className="flex-1 md:ml-14 md:pb-0 flex flex-col md:flex-row">
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

                {/* Кнопка переключения карта/список — мобильные */}
                <div className="md:hidden">
                    <MobileViewToggle />
                </div>

                {/* Контейнер карты */}
                <div className="flex-1 relative">
                    <div className="absolute inset-0 md:relative md:h-screen w-full">
                        {/* Карта (отступ сверху для хедера на desktop) */}
                        <div className="absolute z-10 inset-0 md:pt-[52px]">
                            <SearchMap />
                        </div>
                    </div>
                </div>

                {/* Мобильный bottom sheet сайдбар */}
                <div className="md:hidden">
                    <div
                        className={cn(
                            'fixed left-0 right-0 bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex flex-col transition-[height,bottom,border-radius] duration-300 ease-in-out',
                            isExpanded ? 'z-110' : 'z-30',
                            !isExpanded && 'rounded-t-lg',
                        )}
                        style={{
                            bottom: isExpanded ? 0 : '64px',
                            height: isExpanded ? '100dvh' : '35%',
                            willChange: 'height, bottom',
                        }}
                    >
                        {/* Хедер */}
                        <div className="px-4 py-3 shrink-0 flex items-center justify-between border-b border-border">
                            <span className="text-sm font-medium">
                                {t('agencies')} ({totalCount})
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMobileSnapState(isExpanded ? 'collapsed' : 'expanded')}
                                className="h-8 gap-1.5 px-2"
                            >
                                <span className="text-xs text-text-secondary">
                                    {isExpanded ? tMapSidebar('collapsePanel') : tMapSidebar('expandPanel')}
                                </span>
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronLeft className="w-4 h-4 rotate-90" />
                                )}
                            </Button>
                        </div>

                        {/* Содержимое */}
                        <div className="flex-1 min-h-0 overflow-y-auto bg-background-secondary/50">
                            {isLoading && agencies.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : agencies.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">{t('noAgenciesFound')}</p>
                                </div>
                            ) : (
                                <div className="p-3 space-y-3">
                                    {agencies.map((agency) => (
                                        <div
                                            key={agency.id}
                                            onClick={() => handleAgencyClick(agency)}
                                            className="cursor-pointer"
                                        >
                                            <AgencyCard
                                                agency={agency}
                                                locale="ru"
                                            />
                                        </div>
                                    ))}
                                    {isLoading && agencies.length > 0 && (
                                        <div className="flex justify-center p-4">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop сайдбар */}
                {!isSidebarVisible ? (
                    <div className="hidden md:flex flex-col w-12 bg-background border-l border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSidebarVisible(true)}
                            className="w-full h-12 rounded-none"
                            title={tMapSidebar('showPanel')}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-col w-96 bg-background border-l border-border fixed right-0 h-screen z-40 mt-[52px]">
                        {/* Хедер сайдбара */}
                        <div className="p-3 pt-4 border-b border-border shrink-0 sticky top-0 z-10 bg-background">
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSwitchToList}
                                    className="h-9 gap-1.5"
                                    title={tMapSidebar('showAsList')}
                                >
                                    <ListIcon className="w-4 h-4" />
                                    <span className="text-xs">{tMapSidebar('showAsList')}</span>
                                </Button>

                                <div className="w-px h-6 bg-border" />

                                <Select value={sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-[110px] h-9 text-xs">
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
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleSortOrder}
                                    className="h-9 w-9 p-0"
                                >
                                    <ArrowUpDown className={cn(
                                        'w-4 h-4 transition-transform',
                                        sortOrder === 'asc' && 'rotate-180'
                                    )} />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarVisible(false)}
                                    className="ml-auto h-9 w-9 p-0"
                                    title={tMapSidebar('hidePanel')}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <span className="text-xs text-muted-foreground">
                                {t('agencies')} ({totalCount})
                            </span>
                        </div>

                        {/* Загрузка */}
                        {isLoading && agencies.length === 0 && (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}

                        {/* Список агентств */}
                        {agencies.length > 0 && (
                            <div
                                className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3"
                                onScroll={(e) => {
                                    const target = e.currentTarget;
                                    const scrollPercentage =
                                        (target.scrollTop + target.clientHeight) / target.scrollHeight;
                                    if (scrollPercentage > 0.8 && hasMore && !isLoading) {
                                        const nextPage = page + 1;
                                        setPage(nextPage);
                                        loadAgencies(nextPage, true);
                                    }
                                }}
                            >
                                {agencies.map((agency) => (
                                    <div
                                        key={agency.id}
                                        onClick={() => handleAgencyClick(agency)}
                                        className="cursor-pointer"
                                    >
                                        <AgencyCard
                                            agency={agency}
                                            locale="ru"
                                        />
                                    </div>
                                ))}
                                {isLoading && agencies.length > 0 && (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Пустой результат */}
                        {agencies.length === 0 && !isLoading && (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center py-12 text-muted-foreground">
                                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">{t('noAgenciesFound')}</p>
                                    <p className="text-xs mt-1">{t('tryChangeFilters')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

/**
 * Плейсхолдер загрузки карты
 */
function AgencyMapLoadingPlaceholder() {
    return (
        <div className="w-full h-full bg-background-secondary flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <svg
                        className="w-16 h-16 text-text-tertiary animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        </div>
    );
}
