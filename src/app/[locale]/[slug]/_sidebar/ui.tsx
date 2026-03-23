'use client';

import { useEffect, useState, useCallback, useRef, useMemo, type CSSProperties, type ReactElement } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

// Polyfill ResizeObserver for SSR (react-window v2 calls `new ResizeObserver` at hook init)
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as unknown as typeof globalThis.ResizeObserver;
}
import { List, useDynamicRowHeight, useListRef } from 'react-window';
import {
    Fingerprint,
    SlidersHorizontal,
    ArrowUpDown,
    MapPin,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useEnsureGeometries } from '@/shared/lib/use-ensure-geometries';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { useAuth } from '@/features/auth';
import { useFilters } from '@/features/search-filters/model/use-filters';
import { useActiveLocationMode, useSetLocationMode } from '@/features/search-filters/model/use-location-mode';
import { CategoryFilter } from '@/features/category-filter';
import { SearchCategorySwitcher, type SearchCategory } from '@/features/search-category';
import { FiltersDesktopPanel } from '@/widgets/search-filters-bar/ui/filters-desktop-panel';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { PropertyCardGrid } from '@/entities/property';
import type { PropertyGridCard } from '@/entities/property';
import { getPropertiesListCursor, getPropertiesCount } from '@/shared/api';
import { dtosToGridCards } from '@/entities/property/model/converters';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import type { MarkerType, SortField, SortOrder } from '@/entities/filter';

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

const SIDEBAR_PAGE_LIMIT = 10;

/** Props, передаваемые в rowComponent через rowProps */
interface PropertyRowData {
    properties: PropertyGridCard[];
    onPropertyClick: (p: PropertyGridCard) => void;
    columns: 1 | 2;
}

/**
 * Виртуализированная строка списка (react-window v2).
 * В режиме columns=2 отображает 2 карточки в ряд (для >= 1366px).
 */
function PropertyRow({
    index,
    style,
    properties,
    onPropertyClick,
    columns,
}: {
    ariaAttributes: Record<string, unknown>;
    index: number;
    style: CSSProperties;
} & PropertyRowData): ReactElement | null {
    if (columns === 2) {
        const leftProperty = properties[index * 2];
        const rightProperty = properties[index * 2 + 1];
        if (!leftProperty) return <div style={style} />;
        return (
            <div style={style}>
                <div className="grid grid-cols-2 gap-2 px-3 py-2.5">
                    <PropertyCardGrid
                        property={leftProperty}
                        onClick={() => onPropertyClick(leftProperty)}
                        actions={<PropertyCompareButton property={leftProperty} />}
                        menuItems={<PropertyCompareMenuItem property={leftProperty} />}
                    />
                    {rightProperty && (
                        <PropertyCardGrid
                            property={rightProperty}
                            onClick={() => onPropertyClick(rightProperty)}
                            actions={<PropertyCompareButton property={rightProperty} />}
                            menuItems={<PropertyCompareMenuItem property={rightProperty} />}
                        />
                    )}
                </div>
            </div>
        );
    }

    const property = properties[index];
    if (!property) {
        return <div style={style} />;
    }
    return (
        <div style={style}>
            <div className="px-3 py-2.5">
                <PropertyCardGrid
                    property={property}
                    onClick={() => onPropertyClick(property)}
                    actions={<PropertyCompareButton property={property} />}
                    menuItems={<PropertyCompareMenuItem property={property} />}
                />
            </div>
        </div>
    );
}

/**
 * SearchPageSidebar — правый сайдбар для страницы поиска.
 *
 * — < 1366px: 450px, 1 колонка карточек, 2 ряда кнопок
 * — >= 1366px: 520px, 2 колонки карточек, все кнопки в 1 ряд
 *
 * Верхний уровень: сохранённые фильтры + маркеры (auth only).
 * Ниже: секция/категория + фильтры.
 * Ниже: карточки объектов со скроллом.
 */
export function SearchPageSidebar() {
    const t = useTranslations('filters');
    const tSidebar = useTranslations('mapSidebar');
    const locale = useLocale();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { filters, setFilters, filtersCount } = useFilters();
    const { isReady: geometriesReady } = useEnsureGeometries(filters, setFilters);
    const activeLocationMode = useActiveLocationMode();
    const setLocationMode = useSetLocationMode();

    // >= 1500px: 2 колонки карточек, все кнопки в 1 ряд
    const isWide = useMediaQuery('(min-width: 1500px)');
    const columns: 1 | 2 = isWide ? 2 : 1;

    const [currentCategory, setCurrentCategory] = useState<SearchCategory>('properties');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Кол-во выбранных элементов локации (полигоны + изохроны + радиусы + admin-границы)
    const locationCount = useMemo(() => {
        return (filters.polygonIds?.length ?? 0)
            + (filters.isochroneIds?.length ?? 0)
            + (filters.radiusIds?.length ?? 0)
            + (filters.adminLevel2?.length ?? 0)
            + (filters.adminLevel4?.length ?? 0)
            + (filters.adminLevel6?.length ?? 0)
            + (filters.adminLevel7?.length ?? 0)
            + (filters.adminLevel8?.length ?? 0)
            + (filters.adminLevel9?.length ?? 0)
            + (filters.adminLevel10?.length ?? 0);
    }, [filters]);

    // Properties state — cursor-based pagination
    const [properties, setProperties] = useState<PropertyGridCard[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | undefined>();
    const [hasMore, setHasMore] = useState(true);
    const loadingRef = useRef(false);

    // react-window: dynamic row heights + list ref
    const dynamicRowHeight = useDynamicRowHeight({ defaultRowHeight: 460 });
    const listRef = useListRef(null);

    const sortBy = filters.sort ?? 'createdAt';
    const sortOrder = filters.order ?? 'desc';

    const sortOptions: { value: SortField; label: string }[] = [
        { value: 'createdAt', label: tSidebar('sortDate') },
        { value: 'price', label: tSidebar('sortPrice') },
        { value: 'area', label: tSidebar('sortArea') },
    ];

    // Refs для стабильного доступа в колбэках (без stale closures)
    const nextCursorRef = useRef(nextCursor);
    nextCursorRef.current = nextCursor;
    const hasMoreRef = useRef(hasMore);
    hasMoreRef.current = hasMore;
    const propertiesLenRef = useRef(0);
    propertiesLenRef.current = properties.length;

    const fetchProperties = useCallback(
        async (cursor?: string) => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setIsLoading(true);
            if (!cursor) setIsRefreshing(true);

            try {
                const sort_by = sortBy === 'createdAt' ? 'published_at' : sortBy;
                const response = await getPropertiesListCursor({
                    filters,
                    limit: SIDEBAR_PAGE_LIMIT,
                    cursor,
                    sort_by: sort_by as 'published_at' | 'price' | 'area',
                    sort_order: sortOrder,
                    language: locale,
                });

                const cards = dtosToGridCards(response.data);

                if (cursor) {
                    setProperties((prev) => [...prev, ...cards]);
                } else {
                    setProperties(cards);
                }

                setNextCursor(response.pagination.next_cursor);
                setHasMore(response.pagination.has_more);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
                loadingRef.current = false;
            }
        },
        [filters, sortBy, sortOrder, locale]
    );

    // Сброс и перезагрузка при изменении фильтров/сортировки (ждём проверку геометрий)
    useEffect(() => {
        if (!geometriesReady) return;
        setNextCursor(undefined);
        fetchProperties();
    }, [fetchProperties, geometriesReady]);

    // Загрузка каунта (ждём проверку геометрий)
    useEffect(() => {
        if (!geometriesReady) return;
        const controller = new AbortController();
        getPropertiesCount(filters, controller.signal)
            .then((count) => setTotalCount(count))
            .catch((err) => {
                if (err.name !== 'AbortError') console.error('Failed to get count:', err);
            });

        return () => controller.abort();
    }, [filters, geometriesReady]);

    // Infinite scroll через onRowsRendered react-window
    const fetchRef = useRef(fetchProperties);
    fetchRef.current = fetchProperties;

    const columnsRef = useRef(columns);
    columnsRef.current = columns;

    const handleRowsRendered = useCallback(
        (_visible: { startIndex: number; stopIndex: number }, all: { startIndex: number; stopIndex: number }) => {
            const len = propertiesLenRef.current;
            const cols = columnsRef.current;
            // Кол-во «рядов» виртуального списка
            const rowCount = cols === 2 ? Math.ceil(len / 2) : len;
            if (!hasMoreRef.current || loadingRef.current || rowCount === 0) return;
            // Подгружаем, когда видимый+overscan дошёл до 3-х последних рядов
            if (all.stopIndex >= rowCount - 3) {
                fetchRef.current(nextCursorRef.current);
            }
        },
        [] // стабильный колбэк — все данные через refs
    );

    const handlePropertyClick = useCallback(
        (property: PropertyGridCard) => {
            router.push(`/property/${property.slug || property.id}`);
        },
        [router]
    );

    // Мемоизированные rowProps для react-window
    const rowProps = useMemo<PropertyRowData>(
        () => ({ properties, onPropertyClick: handlePropertyClick, columns }),
        [properties, handlePropertyClick, columns]
    );

    // Кол-во рядов виртуального списка (при 2-х колонках — вдвое меньше)
    const virtualRowCount = columns === 2 ? Math.ceil(properties.length / 2) : properties.length;

    const handleSortChange = (value: string) => {
        setFilters({ sort: value as SortField });
    };

    const toggleSortOrder = () => {
        setFilters({ order: sortOrder === 'asc' ? 'desc' : 'asc' });
    };

    return (
        <aside className="hidden slug-desktop:flex flex-col w-full shrink-0 h-full bg-background rounded-[9px] overflow-hidden">
            {/* === Верхний блок: сохранённые фильтры + маркеры (auth only) === */}
            {/* < 1366px: отдельный ряд; >= 1366px: скрыт (встроен в общий ряд ниже) */}
            {isAuthenticated && (
                <div className="flex slug-xl:hidden items-center gap-2 px-3 pt-3 pb-1">
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

            {/* === Фильтры: 1 ряд — отпечаток, [маркеры >= 1366], раздел, категория, локация, подробности === */}
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

                {/* Маркеры — встроены в общий ряд на >= 1366px, скрыты на < 1366px */}
                {isAuthenticated && (
                    <div className="hidden slug-xl:block shrink-0">
                        <Select
                            value={filters.markerType || 'all'}
                            onValueChange={(value) =>
                                setFilters({ markerType: value as MarkerType })
                            }
                        >
                            <SelectTrigger className="h-9 w-[130px] text-sm border-border">
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
                                // Восстанавливаем последний активный режим локации
                                const { locationFilter } = useFilterStore.getState();
                                const modeFromStore = locationFilter?.mode;
                                // Fallback: определяем режим из URL-фильтров
                                const modeFromUrl = filters.polygonIds?.length ? 'draw'
                                    : filters.isochroneIds?.length ? 'isochrone'
                                    : filters.radiusIds?.length ? 'radius'
                                    : undefined;
                                setLocationMode(modeFromStore ?? modeFromUrl ?? 'search');
                            }
                        }}
                        className={cn(
                            'relative w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-all duration-200',
                            activeLocationMode
                                ? 'bg-brand-primary text-white border border-brand-primary hover:bg-brand-primary-hover'
                                : 'border border-border bg-background text-text-secondary hover:text-brand-primary hover:bg-background-secondary'
                        )}
                    >
                        <MapPin className="w-4 h-4" />
                        {locationCount > 0 && !activeLocationMode && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-brand-primary rounded-full">
                                {locationCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsFiltersOpen(true)}
                        className={cn(
                            'relative w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                            'border border-border bg-background',
                            'text-text-secondary hover:text-brand-primary hover:bg-background-secondary',
                            'transition-colors'
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {filtersCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-brand-primary rounded-full">
                                {filtersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* === Сортировка + каунт === */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border">
                <span className="text-sm text-text-secondary inline-flex items-center gap-1">
                    {t('resultsFoundLabel')}
                    <span className="inline-flex items-center overflow-hidden">
                        <span
                            key={totalCount}
                            className="font-semibold text-text-primary font-mono animate-in fade-in slide-in-from-bottom-2 duration-300"
                        >
                            {totalCount !== null ? totalCount.toLocaleString() : '…'}
                        </span>
                    </span>
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

            {/* === Прогресс-бар загрузки === */}
            {/* <div className="relative h-0.5 w-full bg-border/50 shrink-0 overflow-hidden">
                {isRefreshing && (
                    <div className="absolute inset-0 bg-brand-primary animate-progress-bar" />
                )}
            </div> */}

            {/* === Карточки объектов (виртуализированный список) === */}
            {!isLoading && properties.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-text-secondary">
                    {tSidebar('noResults')}
                </div>
            ) : (
                <div className="flex-1 min-h-0 relative">
                    {/* Затемнение поверх старых карточек при обновлении */}
                    {isRefreshing && (
                        <div className="absolute inset-0 bg-background/10 z-10 pointer-events-none transition-opacity duration-200" />
                    )}
                    <List<PropertyRowData>
                        listRef={listRef}
                        rowComponent={PropertyRow}
                        rowProps={rowProps}
                        rowCount={virtualRowCount}
                        rowHeight={dynamicRowHeight}
                        onRowsRendered={handleRowsRendered}
                        overscanCount={2}
                        style={{ height: '100%', width: '100%' }}
                    />
                </div>
            )}

            {/* Панель "Все фильтры" */}
            <FiltersDesktopPanel
                open={isFiltersOpen}
                onOpenChange={setIsFiltersOpen}
                currentCategory={currentCategory}
                onCategoryChange={setCurrentCategory}
            />
        </aside>
    );
}
