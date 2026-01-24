'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
    Loader2,
    SortAsc,
    SortDesc,
    List,
    ChevronLeft,
    ChevronRight,
    MapPin,
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
import { useFilterStore } from '@/widgets/search-filters-bar';
import { getPropertiesList, type PropertiesListResponse } from '@/shared/api';
import type { Property } from '@/entities/property';
import { cn, safeImageSrc } from '@/shared/lib/utils';

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

/**
 * MapSidebar - правый сайдбар для режима карты
 *
 * Структура:
 * - Хедер: переключение режима (на список) + сортировка
 * - Список объектов с прокруткой
 * - Пагинация внизу
 *
 * При клике на объект - карта центрируется на нём
 */
export function MapSidebar({
    onPropertyClick,
    onPropertyHover,
    selectedPropertyId,
    className,
}: MapSidebarProps) {
    const t = useTranslations('property');
    const tCommon = useTranslations('common');
    const tFilters = useTranslations('filters');

    const { currentFilters, setSearchViewMode } = useFilterStore();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] =
        useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: 'По дате' },
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
                limit: 20,
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
    }, [sortBy, sortOrder, currentFilters]);

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleSwitchToList = () => {
        setSearchViewMode('list');
    };

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
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'w-80 bg-background border-l border-border flex flex-col',
                className
            )}
        >
            {/* Хедер */}
            <div className="p-3 border-b border-border bg-background-secondary shrink-0">
                <div className="flex items-center gap-2">
                    {/* Кнопка переключения на режим списка */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSwitchToList}
                        className="h-8 gap-1.5"
                        title="Перейти к списку"
                    >
                        <List className="w-4 h-4" />
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
                        className="h-8 w-8 p-0"
                    >
                        {sortOrder === 'asc' ? (
                            <SortAsc className="w-4 h-4" />
                        ) : (
                            <SortDesc className="w-4 h-4" />
                        )}
                    </Button>

                    {/* Кнопка свернуть - справа */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(true)}
                        className="ml-auto h-8 w-8 p-0"
                        title="Свернуть панель"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Счётчик объектов */}
                {pagination && (
                    <div className="mt-2 text-xs text-text-secondary">
                        Найдено: {pagination.total.toLocaleString('ru-RU')} объектов
                    </div>
                )}
            </div>

            {/* Загрузка */}
            {isLoading && properties.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            )}

            {/* Список карточек */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {properties.map((property) => (
                    <MapSidebarCard
                        key={property.id}
                        property={property}
                        isSelected={selectedPropertyId === property.id}
                        onClick={() => onPropertyClick?.(property)}
                        onMouseEnter={() => onPropertyHover?.(property)}
                        onMouseLeave={() => onPropertyHover?.(null)}
                    />
                ))}

                {/* Пустой результат */}
                {properties.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-text-secondary">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">{tCommon('notFound')}</p>
                        <p className="text-xs mt-1">Измените область поиска на карте</p>
                    </div>
                )}
            </div>

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-3 border-t border-border bg-background-secondary flex items-center justify-between shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1 || isLoading}
                    >
                        Назад
                    </Button>
                    <span className="text-sm text-text-secondary">
                        {page} / {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages || isLoading}
                    >
                        Далее
                    </Button>
                </div>
            )}
        </div>
    );
}

/**
 * Компактная карточка объекта для сайдбара карты
 */
function MapSidebarCard({
    property,
    isSelected,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: {
    property: Property;
    isSelected?: boolean;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}) {
    const tTypes = useTranslations('propertyTypes');

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU') + ' €';
    };

    return (
        <div
            className={cn(
                'bg-background border border-border rounded-lg overflow-hidden cursor-pointer',
                'transition-all duration-200 hover:shadow-md hover:border-brand-primary/30',
                isSelected && 'ring-2 ring-brand-primary border-brand-primary shadow-md'
            )}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="flex">
                {/* Миниатюра */}
                <div className="relative w-24 h-24 shrink-0">
                    <Image
                        src={property.images[0] ? safeImageSrc(property.images[0]) : '/placeholder-property.jpg'}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                    />
                </div>

                {/* Информация */}
                <div className="flex-1 p-2.5 min-w-0">
                    {/* Цена */}
                    <div className="text-base font-bold text-brand-primary">
                        {formatPrice(property.price)}
                        <span className="text-xs font-normal text-text-secondary ml-0.5">
                            /мес
                        </span>
                    </div>

                    {/* Тип */}
                    <div className="text-xs text-text-secondary mt-0.5">
                        {tTypes(property.type)}
                    </div>

                    {/* Адрес */}
                    <div className="text-xs text-text-secondary mt-1 line-clamp-1">
                        {property.address}
                    </div>

                    {/* Характеристики */}
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-1.5">
                        <span>{property.bedrooms} комн.</span>
                        <span>·</span>
                        <span>{property.area} м²</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
