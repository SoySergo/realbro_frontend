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
    MapPin,
    X,
    Map as MapIcon,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Sheet, SheetContent } from '@/shared/ui/sheet';
import { useCurrentFilters, useViewModeActions } from '@/widgets/search-filters-bar';
import { getPropertiesList, type PropertiesListResponse } from '@/shared/api';
import type { Property } from '@/entities/property';
import { PropertyCardGrid } from '@/entities/property';
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
    isOpen: boolean;
    onClose: () => void;
    onPropertyClick?: (property: Property) => void;
    selectedPropertyId?: string | null;
    clusterId?: string | null;
    onClusterReset?: () => void;
    onViewModeChange?: (mode: 'map' | 'list') => void;
}

// Высота одной карточки в виртуализированном списке (PropertyCardGrid имеет aspect-ratio 4:3 + padding)
const ITEM_HEIGHT = 420;

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
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: index === 0 ? 12 : 6,
                paddingBottom: 6,
            }}
            onMouseEnter={() => onPropertyHover(property)}
            onMouseLeave={() => onPropertyHover(null)}
        >
            <PropertyCardGrid
                property={property}
                onClick={() => onPropertyClick(property)}
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

    // Infinite scroll handler
    const handleScroll = useCallback(
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

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handleSwitchToList = () => {
        setSearchViewMode('list');
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
                                ? 'Сортировка по убыванию'
                                : 'Сортировка по возрастанию'
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
                <div className="flex-1 min-h-0" onScroll={handleScroll}>
                    <List
                        listRef={listRef}
                        rowCount={properties.length}
                        rowHeight={ITEM_HEIGHT}
                        className="scrollbar-thin"
                        style={{ height: '100%' }}
                        rowComponent={PropertyRow}
                        rowProps={{
                            properties,
                            selectedPropertyId: selectedPropertyId ?? null,
                            onPropertyClick: handlePropertyClick,
                            onPropertyHover: handlePropertyHover,
                        }}
                    />
                    {/* Loading indicator для infinite scroll */}
                    {isLoading && properties.length > 0 && (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            )}

            {/* Пустой результат */}
            {properties.length === 0 && !isLoading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12 text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">{tMapSidebar('noResults')}</p>
                        <p className="text-xs mt-1">Измените область поиска на карте</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================
// Mobile Bottom Sheet Sidebar
// =====================================

/**
 * MobileMapSidebar - мобильный bottom sheet для списка объектов на карте
 *
 * Использует PropertyCardGrid
 * Поддерживает: snap points, drag handle, сортировку, кластеры, infinite scroll
 */
export function MobileMapSidebar({
    isOpen,
    onClose,
    onPropertyClick,
    selectedPropertyId,
    clusterId,
    onClusterReset,
    onViewModeChange,
}: MobileMapSidebarProps) {
    const tMapSidebar = useTranslations('mapSidebar');

    const currentFilters = useCurrentFilters();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] = useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');
    const [hasMore, setHasMore] = useState(true);
    const loadingRef = useRef(false);

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: tMapSidebar('sortDate') },
        { value: 'price', label: tMapSidebar('sortPrice') },
        { value: 'area', label: tMapSidebar('sortArea') },
    ];

    // Загрузка списка
    const fetchProperties = useCallback(
        async (pageNum: number, append = false) => {
            if (!isOpen || loadingRef.current) return;

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
        [currentFilters, sortBy, sortOrder, isOpen]
    );

    useEffect(() => {
        if (isOpen) {
            setPage(1);
            fetchProperties(1, false);
        }
    }, [fetchProperties, isOpen]);

    // Сброс при изменении фильтров
    useEffect(() => {
        setPage(1);
        setProperties([]);
    }, [sortBy, sortOrder, currentFilters, clusterId]);

    // Infinite scroll handler
    const handleScroll = useCallback(
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

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handleViewModeToggle = () => {
        onViewModeChange?.('list');
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="bottom"
                className="h-[90vh] rounded-t-2xl p-0 flex flex-col"
            >
                {/* Drag handle */}
                <div className="flex justify-center py-3 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-border" />
                </div>

                {/* Header */}
                <div className="px-4 pb-3 border-b border-border shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        {pagination && (
                            <span className="text-sm font-medium">
                                {tMapSidebar('objectsCount', { count: pagination.total })}
                            </span>
                        )}

                        {/* Сортировка */}
                        <div className="flex items-center gap-2">
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[100px] h-9 text-xs">
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
                                <ArrowUpDown
                                    className={cn(
                                        'w-4 h-4 transition-transform',
                                        sortOrder === 'asc' && 'rotate-180'
                                    )}
                                />
                            </Button>
                        </div>
                    </div>

                    {/* Кластер кнопка */}
                    {clusterId && onClusterReset && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClusterReset}
                            className="h-8 text-xs gap-1"
                        >
                            <X className="w-3 h-3" />
                            {tMapSidebar('resetCluster')}
                        </Button>
                    )}
                </div>

                {/* Список */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" onScroll={handleScroll}>
                    {isLoading && properties.length === 0 && (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}

                    {properties.map((property) => (
                        <PropertyCardGrid
                            key={property.id}
                            property={property}
                            onClick={() => onPropertyClick?.(property)}
                        />
                    ))}

                    {/* Loading indicator для infinite scroll */}
                    {isLoading && properties.length > 0 && (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}

                    {properties.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-muted-foreground">
                            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">{tMapSidebar('noResults')}</p>
                        </div>
                    )}
                </div>

                {/* Кнопка переключения режима - фиксированная внизу слева */}
                <div className="absolute bottom-4 left-4 z-20">
                    <Button
                        variant="default"
                        size="lg"
                        onClick={handleViewModeToggle}
                        className="h-12 px-6 gap-2 shadow-lg"
                    >
                        <ListIcon className="w-5 h-5" />
                        {tMapSidebar('showAsList')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
