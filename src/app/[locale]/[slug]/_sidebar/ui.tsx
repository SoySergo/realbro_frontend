'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
    Fingerprint,
    SlidersHorizontal,
    ArrowUpDown,
    MapPin,
    Loader2,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth';
import { useSearchFilters } from '@/features/search-filters/model';
import { useCurrentFilters, useFilterStore } from '@/widgets/search-filters-bar';
import { CategoryFilter } from '@/features/category-filter';
import { SearchCategorySwitcher, type SearchCategory } from '@/features/search-category';
import { FiltersDesktopPanel } from '@/widgets/search-filters-bar/ui/filters-desktop-panel';
import { PropertyCardGrid } from '@/entities/property';
import type { PropertyGridCard } from '@/entities/property';
import { getPropertiesList, getPropertiesCount, type PropertiesListResponse } from '@/shared/api';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import type { MarkerType } from '@/entities/filter';

const markerOptions: { value: MarkerType; labelKey: string }[] = [
    { value: 'all', labelKey: 'all' },
    { value: 'like', labelKey: 'like' },
    { value: 'dislike', labelKey: 'dislike' },
    { value: 'view', labelKey: 'view' },
    { value: 'no_view', labelKey: 'noView' },
    { value: 'saved', labelKey: 'saved' },
    { value: 'to_review', labelKey: 'toReview' },
    { value: 'to_think', labelKey: 'toThink' },
];

type SortBy = 'price' | 'area' | 'createdAt';
type SortOrder = 'asc' | 'desc';

/**
 * SearchPageSidebar — правый сайдбар для страницы поиска (450px).
 *
 * Верхний уровень: сохранённые фильтры + маркеры (auth only).
 * Ниже: секция/категория + фильтры.
 * Ниже: карточки объектов со скроллом.
 */
export function SearchPageSidebar() {
    const t = useTranslations('filters');
    const tSidebar = useTranslations('mapSidebar');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { filters, setFilters } = useSearchFilters();
    const currentFilters = useCurrentFilters();
    const { activeLocationMode, setLocationMode, locationFilter } = useFilterStore();

    const [currentCategory, setCurrentCategory] = useState<SearchCategory>('properties');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Properties state
    const [properties, setProperties] = useState<PropertyGridCard[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState<SortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const loadingRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const sortOptions: { value: SortBy; label: string }[] = [
        { value: 'createdAt', label: tSidebar('sortDate') },
        { value: 'price', label: tSidebar('sortPrice') },
        { value: 'area', label: tSidebar('sortArea') },
    ];

    // Загрузка свойств
    const fetchProperties = useCallback(
        async (pageNum: number, append = false) => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setIsLoading(true);

            try {
                const response = await getPropertiesList({
                    filters: currentFilters,
                    page: pageNum,
                    limit: 20,
                    sortBy,
                    sortOrder,
                    language: locale,
                });

                if (append) {
                    setProperties((prev) => [...prev, ...response.data]);
                } else {
                    setProperties(response.data);
                }

                setHasMore(pageNum < response.pagination.totalPages);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            } finally {
                setIsLoading(false);
                loadingRef.current = false;
            }
        },
        [currentFilters, sortBy, sortOrder, locale]
    );

    // Сброс и перезагрузка при изменении фильтров/сортировки
    useEffect(() => {
        setPage(1);
        setProperties([]);
        fetchProperties(1, false);
    }, [fetchProperties]);

    // Загрузка каунта
    useEffect(() => {
        const controller = new AbortController();
        getPropertiesCount(currentFilters, controller.signal)
            .then((count) => setTotalCount(count))
            .catch((err) => {
                if (err.name !== 'AbortError') console.error('Failed to get count:', err);
            });

        return () => controller.abort();
    }, [currentFilters]);

    // Infinite scroll
    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el || isLoading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        if (scrollHeight - scrollTop - clientHeight < 300) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProperties(nextPage, true);
        }
    }, [isLoading, hasMore, page, fetchProperties]);

    const handlePropertyClick = useCallback(
        (property: PropertyGridCard) => {
            router.push(`/property/${property.slug || property.id}`);
        },
        [router]
    );

    const handleSortChange = (value: string) => {
        setSortBy(value as SortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    return (
        <aside className="hidden slug-desktop:flex flex-col w-[450px] shrink-0 h-full bg-background rounded-[9px] overflow-hidden">
            {/* === Верхний блок: сохранённые фильтры + маркеры (auth only) === */}
            {isAuthenticated && (
                <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                    <Select>
                        <SelectTrigger className="h-9 flex-1 text-sm border-border">
                            <SelectValue placeholder={t('savedFilter') || 'Сохранённый фильтр'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__placeholder" disabled>
                                {t('savedFilter') || 'Нет сохранённых'}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.markerType || 'all'}
                        onValueChange={(value) =>
                            setFilters({ markerType: value as MarkerType })
                        }
                    >
                        <SelectTrigger className="h-9 flex-1 text-sm border-border">
                            <SelectValue>
                                {t(`markerType.${filters.markerType || 'all'}`) || 'Все объекты'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {markerOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {t(`markerType.${opt.labelKey}`) || opt.labelKey}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* === Фильтры: 1 ряд — отпечаток, раздел, категория, локация, подробности === */}
            <div className="flex items-center gap-1.5 px-3 py-2">
                {/* Отпечаток — AI Agent */}
                <button
                    className={cn(
                        'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                        'bg-brand-primary text-white',
                        'hover:bg-brand-primary-hover transition-colors'
                    )}
                >
                    <Fingerprint className="w-5 h-5" />
                </button>

                {/* Центральная часть: раздел + категория — растягиваются */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <SearchCategorySwitcher
                        currentCategory={currentCategory}
                        locale={locale}
                        className="h-9 min-w-0 flex-1"
                    />

                    <div className="min-w-0 flex-1">
                        <CategoryFilter />
                    </div>
                </div>

                {/* Правая часть: локация + фильтры — прижаты вправо */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => {
                            if (activeLocationMode) {
                                setLocationMode(null);
                            } else {
                                setLocationMode(locationFilter?.mode || 'search');
                            }
                        }}
                        className={cn(
                            'w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-all duration-200',
                            activeLocationMode || locationFilter
                                ? 'bg-brand-primary text-white border border-brand-primary hover:bg-brand-primary-hover'
                                : 'border border-border bg-background text-text-secondary hover:text-brand-primary hover:bg-background-secondary'
                        )}
                    >
                        <MapPin className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setIsFiltersOpen(true)}
                        className={cn(
                            'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                            'border border-border bg-background',
                            'text-text-secondary hover:text-brand-primary hover:bg-background-secondary',
                            'transition-colors'
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* === Сортировка + каунт === */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border">
                <span className="text-sm text-text-secondary">
                    {t.rich('resultsFound', {
                        count: totalCount !== null
                            ? totalCount.toLocaleString()
                            : '…',
                        b: (chunks) => (
                            <span className="font-semibold text-text-primary font-mono">
                                {chunks}
                            </span>
                        ),
                    })}
                </span>

                <div className="flex items-center gap-1">
                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="h-8 w-auto gap-1 text-sm border-0 shadow-none px-2">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <button
                        onClick={toggleSortOrder}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-text-secondary hover:text-brand-primary hover:bg-background-secondary transition-colors"
                    >
                        <ArrowUpDown
                            className={cn(
                                'w-4 h-4 transition-transform',
                                sortOrder === 'asc' && 'rotate-180'
                            )}
                        />
                    </button>
                </div>
            </div>

            {/* === Карточки объектов === */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto"
            >
                {properties.map((property) => (
                    <div key={property.id} className="px-3 py-2.5">
                        <PropertyCardGrid
                            property={property}
                            onClick={() => handlePropertyClick(property)}
                            actions={<PropertyCompareButton property={property} />}
                            menuItems={<PropertyCompareMenuItem property={property} />}
                        />
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                    </div>
                )}

                {!isLoading && properties.length === 0 && (
                    <div className="flex items-center justify-center py-12 text-sm text-text-secondary">
                        {tSidebar('noResults') || 'Нет результатов'}
                    </div>
                )}
            </div>

            {/* Панель "Все фильтры" */}
            <FiltersDesktopPanel
                open={isFiltersOpen}
                onOpenChange={setIsFiltersOpen}
            />
        </aside>
    );
}
