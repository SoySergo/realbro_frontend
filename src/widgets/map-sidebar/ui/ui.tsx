'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { List, type ListImperativeAPI } from 'react-window';
import {
    Loader2,
    ArrowUpDown,
    List as ListIcon,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MapPin,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { useCurrentFilters, useViewModeActions } from '@/widgets/search-filters-bar';
import { getPropertiesList, type PropertiesListResponse } from '@/shared/api';
import type { Property } from '@/entities/property';
import { PropertyCardGrid } from '@/entities/property';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import { cn } from '@/shared/lib/utils';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';

interface MapSidebarProps {
    onPropertyClick?: (property: Property) => void;
    onPropertyHover?: (property: Property | null) => void;
    selectedPropertyId?: string | null;
    clusterId?: string | null;
    onClusterReset?: () => void;
    isVisible?: boolean;
    onVisibilityChange?: (visible: boolean) => void;
    className?: string;
}

interface MobileMapSidebarProps {
    onPropertyClick?: (property: Property) => void;
    selectedPropertyId?: string | null;
    clusterId?: string | null;
    onClusterReset?: () => void;
    clusterPropertyIds?: string[];
    snapState?: MobileSnapState;
    onSnapStateChange?: (state: MobileSnapState) => void;
    className?: string;
}

// Высота одной карточки в виртуализированном списке
// PropertyCardGrid: aspect-ratio 4:3 с базовой шириной ~320px = ~240px высота
// + padding (16px сверху/снизу) + внутренние отступы карточки (~160px для контента)
// Итого: примерно 440px. Можно корректировать на основе реальных замеров.
const ITEM_HEIGHT = 440;

// Props для rowComponent в react-window
type PropertyRowProps = {
    properties: Property[];
    selectedPropertyId: string | null;
    onPropertyClick: (property: Property) => void;
    onPropertyHover: (property: Property | null) => void;
};

/**
 * Компонент строки для виртуализированного списка (react-window API)
 */
function PropertyRow({
    index,
    style,
    properties,
    selectedPropertyId,
    onPropertyClick,
    onPropertyHover,
}: {
    ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; role: 'listitem' };
    index: number;
    style: React.CSSProperties;
} & PropertyRowProps) {
    const property = properties[index];
    if (!property) return null;

    return (
        <div
            style={{
                ...style,
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: index === 0 ? 20 : 20,
                paddingBottom: 20,
            }}
            onMouseEnter={() => onPropertyHover(property)}
            onMouseLeave={() => onPropertyHover(null)}
        >
            <PropertyCardGrid
                property={property}
                onClick={() => onPropertyClick(property)}
                actions={<PropertyCompareButton property={property} />}
                menuItems={<PropertyCompareMenuItem property={property} />}
            />
        </div>
    );
}

/**
 * MapSidebar - правый сайдбар для режима карты (Desktop)
 * 
 * Использует PropertyCardGrid из entities/property
 * Поддерживает кластеры, сортировку, виртуализацию и infinite scroll
 */
export function MapSidebar({
    onPropertyClick,
    onPropertyHover,
    selectedPropertyId,
    clusterId,
    onClusterReset,
    isVisible = true,
    onVisibilityChange,
    className,
}: MapSidebarProps) {
    const tCommon = useTranslations('common');
    const tMapSidebar = useTranslations('mapSidebar');
    const router = useRouter();

    const currentFilters = useCurrentFilters();
    const { setSearchViewMode } = useViewModeActions();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] = useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');
    const [hasMore, setHasMore] = useState(true);

    const listRef = useRef<ListImperativeAPI>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: tMapSidebar('sortDate') },
        { value: 'price', label: tMapSidebar('sortPrice') },
        { value: 'area', label: tMapSidebar('sortArea') },
    ];

    // Загрузка списка объектов
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
                });

                if (append) {
                    setProperties((prev) => [...prev, ...response.data]);
                } else {
                    setProperties(response.data);
                }
                
                setPagination(response.pagination);
                setHasMore(pageNum < response.pagination.totalPages);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            } finally {
                setIsLoading(false);
                loadingRef.current = false;
            }
        },
        [currentFilters, sortBy, sortOrder]
    );

    useEffect(() => {
        if (isVisible) {
            setPage(1);
            fetchProperties(1, false);
        }
    }, [fetchProperties, isVisible]);

    // Сброс страницы при изменении сортировки или фильтров
    useEffect(() => {
        setPage(1);
        setProperties([]);
    }, [sortBy, sortOrder, currentFilters, clusterId]);

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handleSwitchToList = () => {
        setSearchViewMode('list');
        router.push('/search/list');
    };

    const handlePropertyClick = useCallback(
        (property: Property) => {
            onPropertyClick?.(property);
        },
        [onPropertyClick]
    );

    const handlePropertyHover = useCallback(
        (property: Property | null) => {
            onPropertyHover?.(property);
        },
        [onPropertyHover]
    );

    // Скрытое состояние
    if (!isVisible) {
        return (
            <div
                className={cn(
                    'w-12 bg-background border-l border-border flex flex-col',
                    className
                )}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVisibilityChange?.(true)}
                    className="w-full h-12 rounded-none"
                    title={tMapSidebar('showPanel')}
                    aria-label={tMapSidebar('showPanel')}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                'w-96 bg-background border-l border-border flex flex-col',
                className
            )}
        >
            {/* Sticky Header */}
            <div className="p-3 border-b border-border shrink-0 sticky top-0 z-10 bg-background">
                <div className="flex items-center gap-2 mb-2">
                    {/* Кнопка переключения на режим списка */}
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

                    {/* Разделитель */}
                    <div className="w-px h-6 bg-border" />

                    {/* Сортировка */}
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
                        aria-label={
                            sortOrder === 'asc'
                                ? tMapSidebar('sortDescending')
                                : tMapSidebar('sortAscending')
                        }
                    >
                        <ArrowUpDown
                            className={cn(
                                'w-4 h-4 transition-transform',
                                sortOrder === 'asc' && 'rotate-180'
                            )}
                        />
                    </Button>

                    {/* Кнопка скрыть */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onVisibilityChange?.(false)}
                        className="ml-auto h-9 w-9 p-0"
                        title={tMapSidebar('hidePanel')}
                        aria-label={tMapSidebar('hidePanel')}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Кластер и счётчик */}
                <div className="flex items-center justify-between">
                    {clusterId && onClusterReset ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClusterReset}
                            className="h-7 text-xs gap-1"
                        >
                            <X className="w-3 h-3" />
                            {tMapSidebar('resetCluster')}
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {pagination
                                ? tMapSidebar('objectsCount', { count: pagination.total })
                                : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Загрузка */}
            {isLoading && properties.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Виртуализированный список карточек */}
            {properties.length > 0 && (
                <List
                    listRef={listRef}
                    rowCount={properties.length}
                    rowHeight={ITEM_HEIGHT}
                    className="scrollbar-thin flex-1"
                    style={{ height: '100%' }}
                    rowComponent={PropertyRow}
                    rowProps={{
                        properties,
                        selectedPropertyId: selectedPropertyId ?? null,
                        onPropertyClick: handlePropertyClick,
                        onPropertyHover: handlePropertyHover,
                    }}
                    onScroll={(e: React.UIEvent<HTMLDivElement>) => {
                        const target = e.currentTarget;
                        const scrollTop = target.scrollTop;
                        const scrollHeight = target.scrollHeight;
                        const clientHeight = target.clientHeight;
                        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
                        if (scrollPercentage > 0.8 && hasMore && !isLoading) {
                            const nextPage = page + 1;
                            setPage(nextPage);
                            fetchProperties(nextPage, true);
                        }
                    }}
                />
            )}

            {/* Loading indicator для infinite scroll */}
            {isLoading && properties.length > 0 && (
                <div className="flex justify-center p-4 shrink-0">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            )}

            {/* Пустой результат */}
            {properties.length === 0 && !isLoading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12 text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">{tMapSidebar('noResults')}</p>
                        <p className="text-xs mt-1">{tMapSidebar('changeSearchArea')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================
// Mobile Bottom Sheet Sidebar
// =====================================

export type MobileSnapState = 'collapsed' | 'expanded';

// Высота нижней навигации
const BOTTOM_NAV_HEIGHT = 64;
// Отступ от хедера (56px) + плавающий бар с чипсами (52px) — только для хедера
const MOBILE_HEADER_INSET = 56 + 52;
// Видимая часть в свёрнутом состоянии (35% экрана)
const COLLAPSED_VISIBLE_PERCENT = 35;
// Высота одной мобильной карточки для виртуализации (карточка ~420px + gap 20px сверху/снизу)
const MOBILE_ITEM_HEIGHT = 460;

/**
 * MobileMapSidebar - мобильный bottom sheet для карты
 *
 * Всегда виден на мобильном экране поверх карты.
 * Свёрнутое состояние: 35% экрана — drag handle + счётчик + превью первой карточки.
 * Развёрнутое состояние: полный экран со виртуализированным скроллируемым списком.
 *
 * Анимация через translateY (а не height) для плавности без "разрыва" контента.
 * Касание контента в collapsed → раскрывается.
 * Кнопка «Скрыть» в expanded → сворачивается.
 */
export function MobileMapSidebar({
    onPropertyClick,
    selectedPropertyId,
    clusterId,
    onClusterReset,
    clusterPropertyIds,
    snapState: externalSnapState,
    onSnapStateChange,
    className,
}: MobileMapSidebarProps) {
    const tMapSidebar = useTranslations('mapSidebar');
    const currentFilters = useCurrentFilters();

    // Данные
    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] = useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');
    const [hasMore, setHasMore] = useState(true);
    const loadingRef = useRef(false);

    // Состояние bottom sheet — controlled или uncontrolled
    const [internalSnapState, setInternalSnapState] = useState<MobileSnapState>('collapsed');
    const snapState = externalSnapState ?? internalSnapState;
    const setSnapState = useCallback((state: MobileSnapState) => {
        if (onSnapStateChange) {
            onSnapStateChange(state);
        } else {
            setInternalSnapState(state);
        }
    }, [onSnapStateChange]);

    // Вычисляем translateY для collapsed состояния
    const [collapsedTranslateY, setCollapsedTranslateY] = useState(0);

    useEffect(() => {
        const update = () => {
            const fullHeight = window.innerHeight - BOTTOM_NAV_HEIGHT;
            const visibleHeight = (window.innerHeight * COLLAPSED_VISIBLE_PERCENT) / 100;
            setCollapsedTranslateY(fullHeight - visibleHeight);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const sheetRef = useRef<HTMLDivElement>(null);
    const mobileListRef = useRef<ListImperativeAPI>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const [listHeight, setListHeight] = useState(0);

    const isExpanded = snapState === 'expanded';

    // Загрузка списка
    const fetchProperties = useCallback(
        async (pageNum: number, append = false) => {
            if (loadingRef.current) return;

            loadingRef.current = true;
            setIsLoading(true);

            try {
                // Если есть clusterPropertyIds — загружаем по IDs
                if (clusterPropertyIds && clusterPropertyIds.length > 0) {
                    const { getPropertiesByIds } = await import('@/shared/api');
                    const data = await getPropertiesByIds(clusterPropertyIds);
                    setProperties(data);
                    setPagination({
                        page: 1,
                        limit: data.length,
                        total: data.length,
                        totalPages: 1,
                    });
                    setHasMore(false);
                } else {
                    const response = await getPropertiesList({
                        filters: currentFilters,
                        page: pageNum,
                        limit: 20,
                        sortBy,
                        sortOrder,
                    });

                    if (append) {
                        setProperties((prev) => [...prev, ...response.data]);
                    } else {
                        setProperties(response.data);
                    }

                    setPagination(response.pagination);
                    setHasMore(pageNum < response.pagination.totalPages);
                }
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            } finally {
                setIsLoading(false);
                loadingRef.current = false;
            }
        },
        [currentFilters, sortBy, sortOrder, clusterPropertyIds]
    );

    // Начальная загрузка данных
    useEffect(() => {
        setPage(1);
        fetchProperties(1, false);
    }, [fetchProperties]);

    // Сброс при изменении фильтров
    useEffect(() => {
        setPage(1);
        setProperties([]);
    }, [sortBy, sortOrder, currentFilters, clusterId]);

    // При раскрытии — скроллим к началу
    useEffect(() => {
        if (snapState === 'expanded' && mobileListRef.current) {
            mobileListRef.current.scrollToRow({ index: 0 });
        }
    }, [snapState]);

    // Применяем translateY при изменении состояния
    useEffect(() => {
        if (sheetRef.current) {
            const translateY = snapState === 'collapsed' ? collapsedTranslateY : 0;
            sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
            sheetRef.current.style.transform = `translateY(${translateY}px)`;
        }
    }, [snapState, collapsedTranslateY]);

    // Вычисляем высоту виртуализированного списка
    useEffect(() => {
        const measure = () => {
            if (listContainerRef.current) {
                const rect = listContainerRef.current.getBoundingClientRect();
                if (rect.height > 0) {
                    setListHeight(rect.height);
                }
            }
        };

        if (isExpanded) {
            measure();
            const timer = setTimeout(measure, 350);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);

    // Also observe resize changes
    useEffect(() => {
        if (!listContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.height > 0) {
                    setListHeight(entry.contentRect.height);
                }
            }
        });
        observer.observe(listContainerRef.current);
        return () => observer.disconnect();
    }, []);

    // Infinite scroll для виртуализированного списка
    const handleVirtualListScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.currentTarget;
            const scrollPercentage =
                (target.scrollTop + target.clientHeight) / target.scrollHeight;
            if (scrollPercentage > 0.8 && hasMore && !isLoading) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchProperties(nextPage, true);
            }
        },
        [hasMore, isLoading, page, fetchProperties]
    );

    // Обработчики для мобильного PropertyRow
    const handleMobilePropertyClick = useCallback(
        (property: Property) => {
            onPropertyClick?.(property);
        },
        [onPropertyClick]
    );

    const handleMobilePropertyHover = useCallback(
        (_property: Property | null) => {
            // no-op на мобильных
        },
        []
    );

    return (
        <div
            ref={sheetRef}
            className={cn(
                'fixed left-0 right-0 z-30 bg-background rounded-t-lg shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex flex-col',
                className
            )}
            style={{
                bottom: `${BOTTOM_NAV_HEIGHT}px`,
                height: `calc(100dvh - ${BOTTOM_NAV_HEIGHT}px)`,
                transform: `translateY(${collapsedTranslateY}px)`,
                willChange: 'transform',
            }}
        >
            {/* Drag handle — тап раскрывает/сворачивает */}
            <div
                role="button"
                tabIndex={0}
                aria-label={isExpanded ? tMapSidebar('hidePanel') : tMapSidebar('showPanel')}
                className="flex justify-center py-3 shrink-0 cursor-pointer"
                onClick={() => setSnapState(snapState === 'collapsed' ? 'expanded' : 'collapsed')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSnapState(snapState === 'collapsed' ? 'expanded' : 'collapsed');
                    }
                }}
            >
                <div className="w-10 h-1 rounded-full bg-border" aria-hidden="true" />
            </div>

            {/* Хедер со счётчиком + кнопка скрыть в expanded */}
            <div className="px-4 pb-2 shrink-0" style={isExpanded ? { paddingTop: MOBILE_HEADER_INSET } : undefined}>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        {clusterPropertyIds && clusterPropertyIds.length > 0
                            ? tMapSidebar('objectsCount', { count: clusterPropertyIds.length })
                            : pagination
                                ? tMapSidebar('objectsCount', { count: pagination.total })
                                : ''}
                    </span>

                    {/* Кнопка «Скрыть» — только в expanded */}
                    {isExpanded && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSnapState('collapsed')}
                            className="h-8 w-8 p-0"
                            aria-label={tMapSidebar('hidePanel')}
                        >
                            <ChevronDown className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* Кнопка сброса кластера */}
                {clusterPropertyIds && clusterPropertyIds.length > 0 && onClusterReset && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClusterReset}
                        className="mt-2 h-8 text-xs gap-1"
                    >
                        <X className="w-3 h-3" />
                        {tMapSidebar('resetCluster')}
                    </Button>
                )}
            </div>

            {isExpanded && <div className="border-b border-border shrink-0" />}

            {/* Загрузка */}
            {isLoading && properties.length === 0 && (
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Список карточек */}
            {isExpanded ? (
                /* Развёрнутое состояние — виртуализированный список */
                <div
                    ref={listContainerRef}
                    className="flex-1 min-h-0"
                >
                    {properties.length > 0 && listHeight > 0 && (
                        <List
                            listRef={mobileListRef}
                            rowCount={properties.length}
                            rowHeight={MOBILE_ITEM_HEIGHT}
                            className="scrollbar-thin"
                            style={{ height: listHeight }}
                            rowComponent={PropertyRow}
                            rowProps={{
                                properties,
                                selectedPropertyId: selectedPropertyId ?? null,
                                onPropertyClick: handleMobilePropertyClick,
                                onPropertyHover: handleMobilePropertyHover,
                            }}
                            onScroll={handleVirtualListScroll}
                        />
                    )}

                    {/* Loading indicator для infinite scroll */}
                    {isLoading && properties.length > 0 && (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}

                    {properties.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-muted-foreground">
                            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">{tMapSidebar('noResults')}</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Свёрнутое состояние — 1 карточка, тап раскрывает */
                <div
                    className="flex-1 p-4 overflow-hidden"
                    onClick={() => setSnapState('expanded')}
                >
                    {properties[0] && (
                        <PropertyCardGrid
                            property={properties[0]}
                            onClick={() => onPropertyClick?.(properties[0])}
                            actions={<PropertyCompareButton property={properties[0]} />}
                            menuItems={<PropertyCompareMenuItem property={properties[0]} />}
                        />
                    )}

                    {properties.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-muted-foreground">
                            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">{tMapSidebar('noResults')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
