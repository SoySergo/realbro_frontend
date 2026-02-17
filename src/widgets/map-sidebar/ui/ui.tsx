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
import { getPropertiesList, getPropertiesByIds, type PropertiesListResponse } from '@/shared/api';
import type { PropertyGridCard } from '@/entities/property';
import { PropertyCardGrid } from '@/entities/property';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import { cn } from '@/shared/lib/utils';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';

interface MapSidebarProps {
    onPropertyClick?: (property: PropertyGridCard) => void;
    onPropertyHover?: (property: PropertyGridCard | null) => void;
    selectedPropertyId?: string | null;
    clusterId?: string | null;
    onClusterReset?: () => void;
    clusterPropertyIds?: string[];
    isVisible?: boolean;
    onVisibilityChange?: (visible: boolean) => void;
    className?: string;
}

interface MobileMapSidebarProps {
    onPropertyClick?: (property: PropertyGridCard) => void;
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
    properties: PropertyGridCard[];
    selectedPropertyId: string | null;
    onPropertyClick: (property: PropertyGridCard) => void;
    onPropertyHover: (property: PropertyGridCard | null) => void;
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
    clusterPropertyIds,
    isVisible = true,
    onVisibilityChange,
    className,
}: MapSidebarProps) {
    const tCommon = useTranslations('common');
    const tMapSidebar = useTranslations('mapSidebar');
    const router = useRouter();

    const currentFilters = useCurrentFilters();
    const { setSearchViewMode } = useViewModeActions();

    const [properties, setProperties] = useState<PropertyGridCard[]>([]);
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
                // Если есть clusterPropertyIds — загружаем по IDs
                if (clusterPropertyIds && clusterPropertyIds.length > 0) {
                    
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
        (property: PropertyGridCard) => {
            onPropertyClick?.(property);
        },
        [onPropertyClick]
    );

    const handlePropertyHover = useCallback(
        (property: PropertyGridCard | null) => {
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
            <div className="p-3 pt-4 border-b border-border shrink-0 sticky top-0 z-10 bg-background">
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
                    {(clusterId || (clusterPropertyIds && clusterPropertyIds.length > 0)) && onClusterReset ? (
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

// =====================================
// Mobile Bottom Sheet Sidebar
// =====================================

export type MobileSnapState = 'collapsed' | 'expanded';

// Высота нижней навигации
const BOTTOM_NAV_HEIGHT = 64;
// Отступ от хедера
const MOBILE_HEADER_INSET = 16;
// Высота одной мобильной карточки для виртуализации (карточка ~420px + gap 20px сверху/снизу)
const MOBILE_ITEM_HEIGHT = 500;

// Высота хедера мобильного приложения
const HEADER_HEIGHT = 56;
// Высота блока с фильтрами (чипсами)
const FILTERS_HEIGHT = 52; 

/**
 * MobileMapSidebar - мобильный bottom sheet для карты
 *
 * Всегда виден на мобильном экране поверх карты.
 * Свёрнутое состояние: фиксированная высота (например 35%).
 * Развёрнутое состояние: полный экран (минус навигация и хедер).
 *
 * Анимация через height.
 * Кнопка шеврона сворачивает/разворачивает.
 * Скролл доступен всегда.
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
    const [properties, setProperties] = useState<PropertyGridCard[]>([]);
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

    // Вычисляем высоту виртуализированного списка
    useEffect(() => {
        if (!listContainerRef.current) return;
        
        const updateHeight = () => {
            if (listContainerRef.current) {
                setListHeight(listContainerRef.current.clientHeight);
            }
        };

        // Initial measurement
        updateHeight();
        
        // Measure on resize
        const observer = new ResizeObserver(updateHeight);
        observer.observe(listContainerRef.current);
        
        // Also measure after transition
        const timer = setTimeout(updateHeight, 350);
        
        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [snapState]); // Re-measure when state changes

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
        (property: PropertyGridCard) => {
            onPropertyClick?.(property);
        },
        [onPropertyClick]
    );

    const handleMobilePropertyHover = useCallback(
        (_property: PropertyGridCard | null) => {
            // no-op на мобильных
        },
        []
    );

    // Toggle expand/collapse
    const toggleSnapState = () => {
        setSnapState(isExpanded ? 'collapsed' : 'expanded');
    };

    return (
        <div
            className={cn(
                'fixed left-0 right-0 bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex flex-col transition-[height,bottom,border-radius] duration-300 ease-in-out',
                isExpanded ? 'z-110' : 'z-30',
                !isExpanded && 'rounded-t-lg',
                className
            )}
            style={{
                bottom: isExpanded ? 0 : `${BOTTOM_NAV_HEIGHT}px`,
                height: isExpanded
                    ? '100dvh'
                    : '35%',
                willChange: 'height, bottom',
            }}
        >
            {/* Хедер со счётчиком + шеврон */}
            <div className="px-4 py-3 shrink-0 flex items-center justify-between border-b border-border">
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {clusterPropertyIds && clusterPropertyIds.length > 0
                            ? tMapSidebar('objectsCount', { count: clusterPropertyIds.length })
                            : pagination
                                ? tMapSidebar('objectsCount', { count: pagination.total })
                                : ''}
                    </span>
                    {/* Кнопка сброса кластера */}
                    {clusterPropertyIds && clusterPropertyIds.length > 0 && onClusterReset && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClusterReset();
                            }}
                            className="h-auto p-0 text-xs text-primary justify-start font-normal"
                        >
                            <X className="w-3 h-3 mr-1" />
                            {tMapSidebar('resetCluster')}
                        </Button>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSnapState}
                    className="h-8 gap-1.5 px-2"
                    aria-label={isExpanded ? tMapSidebar('collapsePanel') : tMapSidebar('expandPanel')}
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

            {/* Загрузка */}
            {isLoading && properties.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Список карточек - всегда рендерим, меняется только высота контейнера */}
            <div
                ref={listContainerRef}
                className="flex-1 min-h-0 bg-background-secondary/50"
            >
                {properties.length > 0 && listHeight > 0 && (
                    <List
                        listRef={mobileListRef}
                        rowCount={properties.length}
                        rowHeight={MOBILE_ITEM_HEIGHT}
                        className="scrollbar-thin"
                        style={{ height: listHeight, width: '100%' }}
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
        </div>
    );
}
