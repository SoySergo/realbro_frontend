'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { useTranslations } from 'next-intl';
import { List, type ListImperativeAPI } from 'react-window';
import {
    Loader2,
    ArrowUpDown,
    List as ListIcon,
    ChevronLeft,
    ChevronRight,
    MapPin,
    ChevronUp,
    ChevronDown,
    Bed,
    Maximize2,
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
import { Sheet, SheetContent } from '@/shared/ui/sheet';
import { useCurrentFilters, useViewModeActions } from '@/widgets/search-filters-bar';
import { getPropertiesList, type PropertiesListResponse } from '@/shared/api';
import type { Property } from '@/entities/property';
import { cn, safeImageSrc } from '@/shared/lib/utils';
import { useReducedMotion } from '@/shared/hooks';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';

type MapSidebarProps = {
    /** Callback при клике на объект - для центрирования карты */
    onPropertyClick?: (property: Property) => void;
    /** Callback при наведении на объект - для подсветки на карте */
    onPropertyHover?: (property: Property | null) => void;
    /** ID выбранного объекта (для подсветки в списке) */
    selectedPropertyId?: string | null;
    /** CSS классы */
    className?: string;
};

// Высота одной карточки в виртуализированном списке
const ITEM_HEIGHT = 100;

// Props для rowComponent в react-window v2
type PropertyRowProps = {
    properties: Property[];
    selectedPropertyId: string | null;
    focusedIndex: number;
    onPropertyClick: (property: Property, index: number) => void;
    onPropertyHover: (property: Property | null) => void;
    prefersReducedMotion: boolean;
};

/**
 * Компонент строки для виртуализированного списка (react-window v2 API)
 * Не оборачиваем в memo — react-window сам управляет рендером строк
 */
function PropertyRow({
    index,
    style,
    properties,
    selectedPropertyId,
    focusedIndex,
    onPropertyClick,
    onPropertyHover,
    prefersReducedMotion,
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
        >
            <MapSidebarCard
                property={property}
                isSelected={selectedPropertyId === property.id}
                isFocused={focusedIndex === index}
                onClick={() => onPropertyClick(property, index)}
                onMouseEnter={() => onPropertyHover(property)}
                onMouseLeave={() => onPropertyHover(null)}
                prefersReducedMotion={prefersReducedMotion}
            />
        </div>
    );
}

/**
 * MapSidebar - правый сайдбар для режима карты (Desktop)
 *
 * Редизайн v2:
 * - Виртуализированный список (react-window)
 * - Компактные карточки 4:3
 * - Sticky header с сортировкой
 * - Keyboard навигация
 * - Индикатор позиции "5 из 120"
 */
export function MapSidebar({
    onPropertyClick,
    onPropertyHover,
    selectedPropertyId,
    className,
}: MapSidebarProps) {
    const tCommon = useTranslations('common');
    const tFilters = useTranslations('filters');

    const currentFilters = useCurrentFilters();
    const { setSearchViewMode } = useViewModeActions();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] =
        useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    const listRef = useRef<ListImperativeAPI>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: tFilters('sortDate') },
        { value: 'price', label: tFilters('price') },
        { value: 'area', label: tFilters('area') },
    ];

    // Загрузка списка объектов
    const fetchProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getPropertiesList({
                filters: currentFilters,
                page,
                limit: 50, // Больше для виртуализации
                sortBy,
                sortOrder,
            });
            setProperties(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentFilters, page, sortBy, sortOrder]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // Сброс страницы при изменении сортировки или фильтров
    useEffect(() => {
        setPage(1);
        setFocusedIndex(-1);
    }, [sortBy, sortOrder, currentFilters]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!containerRef.current?.contains(document.activeElement)) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex((prev) => Math.min(prev + 1, properties.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex((prev) => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    if (focusedIndex >= 0 && focusedIndex < properties.length) {
                        onPropertyClick?.(properties[focusedIndex]);
                    }
                    break;
                case 'Escape':
                    setFocusedIndex(-1);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex, properties, onPropertyClick]);

    // Scroll to focused item
    useEffect(() => {
        if (focusedIndex >= 0 && listRef.current) {
            listRef.current.scrollToRow({ index: focusedIndex, align: 'smart' });
        }
    }, [focusedIndex, listRef]);

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleSwitchToList = () => {
        setSearchViewMode('list');
    };

    const handlePropertyClick = useCallback(
        (property: Property, index: number) => {
            setFocusedIndex(index);
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

    // Найти индекс выбранного элемента для индикатора позиции
    const selectedIndex = selectedPropertyId
        ? properties.findIndex((p) => p.id === selectedPropertyId)
        : -1;

    // Свёрнутое состояние
    if (isCollapsed) {
        return (
            <div
                className={cn(
                    'w-10 bg-background border-l border-border flex flex-col',
                    className
                )}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(false)}
                    className="w-full h-12 rounded-none"
                    title="Развернуть панель"
                    aria-label="Развернуть панель"
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
                'w-72 lg:w-80 bg-background border-l border-border flex flex-col',
                className
            )}
            tabIndex={0}
            role="listbox"
            aria-label="Список объектов"
        >
            {/* Sticky Header */}
            <div className="p-3 border-b border-border bg-background-secondary shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {/* Кнопка переключения на режим списка */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSwitchToList}
                        className="h-8 gap-1.5"
                        title="Перейти к списку"
                    >
                        <ListIcon className="w-4 h-4" />
                        <span className="text-xs">Список</span>
                    </Button>

                    {/* Разделитель */}
                    <div className="w-px h-6 bg-border" />

                    {/* Сортировка */}
                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[100px] h-8 text-xs">
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
                        className={cn(
                            'h-8 w-8 p-0',
                            !prefersReducedMotion && 'transition-transform'
                        )}
                        aria-label={sortOrder === 'asc' ? 'Сортировка по убыванию' : 'Сортировка по возрастанию'}
                    >
                        <ArrowUpDown
                            className={cn('w-4 h-4', sortOrder === 'asc' && 'rotate-180')}
                        />
                    </Button>

                    {/* Кнопка свернуть */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(true)}
                        className="ml-auto h-8 w-8 p-0"
                        title="Свернуть панель"
                        aria-label="Свернуть панель"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Счётчик и индикатор позиции */}
                <div className="flex items-center justify-between mt-2">
                    {pagination && (
                        <span className="text-xs text-text-secondary">
                            Найдено: {pagination.total.toLocaleString('ru-RU')}
                        </span>
                    )}
                    {selectedIndex >= 0 && (
                        <span className="text-xs font-medium text-brand-primary">
                            {selectedIndex + 1} из {properties.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Загрузка */}
            {isLoading && properties.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            )}

            {/* Виртуализированный список карточек */}
            {properties.length > 0 && (
                <div className="flex-1 min-h-0">
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
                            focusedIndex,
                            onPropertyClick: handlePropertyClick,
                            onPropertyHover: handlePropertyHover,
                            prefersReducedMotion,
                        }}
                    />
                </div>
            )}

            {/* Пустой результат */}
            {properties.length === 0 && !isLoading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12 text-text-secondary">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">{tCommon('notFound')}</p>
                        <p className="text-xs mt-1">Измените область поиска на карте</p>
                    </div>
                </div>
            )}

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-3 border-t border-border bg-background-secondary flex items-center justify-between shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1 || isLoading}
                        className="h-10 w-10 p-0"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-text-secondary">
                        {page} / {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages || isLoading}
                        className="h-10 w-10 p-0"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

/**
 * Компактная карточка объекта для сайдбара карты
 * Редизайн: aspect-ratio 4:3, компактная информация
 */
const MapSidebarCard = memo(function MapSidebarCard({
    property,
    isSelected,
    isFocused,
    onClick,
    onMouseEnter,
    onMouseLeave,
    prefersReducedMotion,
}: {
    property: Property;
    isSelected?: boolean;
    isFocused?: boolean;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    prefersReducedMotion?: boolean;
}) {
    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU') + ' €';
    };

    return (
        <div
            className={cn(
                'bg-card border border-border rounded-lg overflow-hidden cursor-pointer h-[88px]',
                'hover:shadow-md hover:border-brand-primary/30',
                !prefersReducedMotion && 'transition-all duration-150',
                isSelected && 'ring-2 ring-brand-primary border-brand-primary shadow-md',
                isFocused && !isSelected && 'ring-2 ring-brand-primary/50 border-brand-primary/50'
            )}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            role="option"
            aria-selected={isSelected}
            tabIndex={-1}
        >
            <div className="flex h-full">
                {/* Миниатюра 4:3 */}
                <div className="relative w-[117px] h-full shrink-0">
                    <Image
                        src={
                            property.images[0]
                                ? safeImageSrc(property.images[0])
                                : '/placeholder-property.jpg'
                        }
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="117px"
                    />
                    {/* Бейдж "Новое" */}
                    {property.isNew && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-success text-white rounded">
                            Новое
                        </span>
                    )}
                </div>

                {/* Информация */}
                <div className="flex-1 p-2.5 min-w-0 flex flex-col justify-between">
                    {/* Цена */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-brand-primary">
                            {formatPrice(property.price)}
                        </span>
                        <span className="text-[10px] text-text-tertiary">/мес</span>
                    </div>

                    {/* Адрес */}
                    <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                        {property.address}
                    </p>

                    {/* Характеристики */}
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-auto">
                        <span className="flex items-center gap-1">
                            <Bed className="w-3 h-3" />
                            {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" />
                            {property.area} м²
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

// =====================================
// Mobile Bottom Sheet Sidebar
// =====================================

type MobileMapSidebarProps = {
    /** Открыт ли sidebar */
    isOpen: boolean;
    /** Callback для закрытия */
    onClose: () => void;
    /** Callback при клике на объект */
    onPropertyClick?: (property: Property) => void;
    /** ID выбранного объекта */
    selectedPropertyId?: string | null;
};

/**
 * MobileMapSidebar - мобильный bottom sheet для списка объектов на карте
 *
 * Особенности:
 * - Bottom sheet вместо правой панели
 * - Swipe для листания медиа
 * - Snap points: 25%, 50%, 90%
 * - Drag handle
 */
export function MobileMapSidebar({
    isOpen,
    onClose,
    onPropertyClick,
    selectedPropertyId,
}: MobileMapSidebarProps) {
    const tFilters = useTranslations('filters');

    const currentFilters = useCurrentFilters();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] =
        useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: tFilters('sortDate') },
        { value: 'price', label: tFilters('price') },
        { value: 'area', label: tFilters('area') },
    ];

    // Загрузка списка
    const fetchProperties = useCallback(async () => {
        if (!isOpen) return;
        setIsLoading(true);
        try {
            const response = await getPropertiesList({
                filters: currentFilters,
                page: 1,
                limit: 30,
                sortBy,
                sortOrder,
            });
            setProperties(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentFilters, sortBy, sortOrder, isOpen]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
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
                    <div className="flex items-center justify-between">
                        {pagination && (
                            <span className="text-sm font-medium">
                                {pagination.total.toLocaleString('ru-RU')} объектов
                            </span>
                        )}

                        {/* Сортировка */}
                        <div className="flex items-center gap-2">
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[100px] h-10 text-xs">
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
                                className="h-10 w-10 p-0"
                            >
                                <ArrowUpDown
                                    className={cn('w-4 h-4', sortOrder === 'asc' && 'rotate-180')}
                                />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Список */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoading && properties.length === 0 && (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                        </div>
                    )}

                    {properties.map((property) => (
                        <MobilePropertyCard
                            key={property.id}
                            property={property}
                            isSelected={selectedPropertyId === property.id}
                            onClick={() => onPropertyClick?.(property)}
                        />
                    ))}

                    {properties.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-text-secondary">
                            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Объекты не найдены</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

/**
 * Мобильная карточка объекта со swipe-галереей
 */
const MobilePropertyCard = memo(function MobilePropertyCard({
    property,
    isSelected,
    onClick,
}: {
    property: Property;
    isSelected?: boolean;
    onClick?: () => void;
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const touchStartX = useRef(0);

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU') + ' €';
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentImageIndex < property.images.length - 1) {
                setCurrentImageIndex((prev) => prev + 1);
            } else if (diff < 0 && currentImageIndex > 0) {
                setCurrentImageIndex((prev) => prev - 1);
            }
        }
    };

    return (
        <div
            className={cn(
                'bg-card border border-border rounded-xl overflow-hidden',
                'active:scale-[0.98] transition-transform touch-manipulation',
                isSelected && 'ring-2 ring-brand-primary border-brand-primary'
            )}
            onClick={onClick}
        >
            {/* Галерея с swipe */}
            <div
                className="relative aspect-4/3 bg-background-secondary"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <Image
                    src={
                        property.images[currentImageIndex]
                            ? safeImageSrc(property.images[currentImageIndex])
                            : '/placeholder-property.jpg'
                    }
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                />

                {/* Индикаторы изображений */}
                {property.images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {property.images.slice(0, 5).map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full transition-colors',
                                    idx === currentImageIndex
                                        ? 'bg-white'
                                        : 'bg-white/50'
                                )}
                            />
                        ))}
                        {property.images.length > 5 && (
                            <span className="text-[10px] text-white/80 ml-1">
                                +{property.images.length - 5}
                            </span>
                        )}
                    </div>
                )}

                {/* Бейдж */}
                {property.isNew && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-success text-white rounded">
                        Новое
                    </span>
                )}
            </div>

            {/* Информация */}
            <div className="p-3">
                <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-brand-primary">
                        {formatPrice(property.price)}
                        <span className="text-xs font-normal text-text-tertiary ml-1">
                            /мес
                        </span>
                    </span>
                </div>

                <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                    {property.address}
                </p>

                <div className="flex items-center gap-4 text-sm text-text-secondary mt-2">
                    <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {property.bedrooms} комн.
                    </span>
                    <span className="flex items-center gap-1">
                        <Maximize2 className="w-4 h-4" />
                        {property.area} м²
                    </span>
                </div>
            </div>
        </div>
    );
});
