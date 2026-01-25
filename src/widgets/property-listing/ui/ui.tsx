'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
    Loader2,
    SortAsc,
    SortDesc,
    Map,
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    StickyNote,
    Share2,
    Flag,
    MapPin,
    Clock,
    Train,
    Bus,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { getPropertiesList, type PropertiesListResponse } from '@/shared/api';
import type { Property } from '@/entities/property';
import { cn, safeImageSrc } from '@/shared/lib/utils';

type PropertySortBy = 'price' | 'area' | 'createdAt';
type PropertySortOrder = 'asc' | 'desc';

type PropertyListingProps = {
    onPropertyClick?: (property: Property) => void;
    className?: string;
};

/**
 * PropertyListing - полноэкранный листинг объектов недвижимости
 * Используется в режиме списка (без карты)
 */
export function PropertyListing({ onPropertyClick, className }: PropertyListingProps) {
    const tCommon = useTranslations('common');
    const tFilters = useTranslations('filters');
    const tMap = useTranslations('map');
    const tListing = useTranslations('listing');

    const { currentFilters, setSearchViewMode } = useFilterStore();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] =
        useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<PropertySortBy>('createdAt');
    const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc');

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: 'По дате' },
        { value: 'price', label: tFilters('price') },
        { value: 'area', label: tFilters('area') },
    ];

    const fetchProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getPropertiesList({
                filters: currentFilters,
                page,
                limit: 24,
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

    useEffect(() => {
        setPage(1);
    }, [sortBy, sortOrder]);

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleShowOnMap = () => {
        setSearchViewMode('map');
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Sticky Header - только на desktop, на мобильных используется MobileSearchHeader */}
            <div className="sticky top-0 z-20 bg-background border-b border-border hidden md:block">
                <div className="px-6 py-4">
                    {/* H1 заголовок */}
                    <h1 className="text-2xl font-bold text-text-primary mb-3">
                        {tListing('title')}
                    </h1>

                    {/* Панель управления */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-text-secondary">
                                {pagination?.total
                                    ? tListing('subtitle', {
                                        count: pagination.total.toLocaleString('ru-RU'),
                                    })
                                    : ''}
                            </span>

                            {/* Сортировка */}
                            <div className="flex items-center gap-2">
                                <Select value={sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-[140px] h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
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

                        {/* Кнопка "На карте" */}
                        <Button
                            variant="outline"
                            onClick={handleShowOnMap}
                            className="gap-2"
                        >
                            <Map className="w-4 h-4" />
                            {tMap('showMap')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Загрузка */}
            {isLoading && properties.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            )}

            {/* Счётчик объектов - только на мобильных */}
            {pagination?.total && (
                <div className="md:hidden px-3 pt-2 pb-1">
                    <span className="text-sm text-text-secondary">
                        {tListing('subtitle', {
                            count: pagination.total.toLocaleString('ru-RU'),
                        })}
                    </span>
                </div>
            )}

            {/* Grid карточек */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 pt-1 md:pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {properties.map((property) => (
                        <PropertyListingCard
                            key={property.id}
                            property={property}
                            onClick={() => onPropertyClick?.(property)}
                        />
                    ))}
                </div>

                {/* Пустой результат */}
                {properties.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-text-secondary">
                        <p className="text-lg">{tListing('emptyTitle')}</p>
                        <p className="text-sm mt-2">{tListing('emptySubtitle')}</p>
                    </div>
                )}
            </div>

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
                <div className="sticky bottom-0 flex items-center justify-center gap-4 px-3 md:px-6 py-3 md:py-4 border-t border-border bg-background">
                    <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1 || isLoading}
                    >
                        {tCommon('back')}
                    </Button>
                    <span className="text-sm text-text-secondary">
                        {page} {tCommon('of')} {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages || isLoading}
                    >
                        {tCommon('next')}
                    </Button>
                </div>
            )}
        </div>
    );
}

// ===== Карточка объекта =====

const MAX_HOVER_IMAGES = 6;

function PropertyListingCard({
    property,
    onClick,
}: {
    property: Property;
    onClick?: () => void;
}) {
    const t = useTranslations('property');
    const tTypes = useTranslations('propertyTypes');

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [dislikeAnimating, setDislikeAnimating] = useState(false);

    // Мок-данные для демонстрации (в реальности придут с бэкенда)
    const mockProperty = useMemo(
        () => ({
            ...property,
            totalFloors: property.totalFloors ?? 5,
            pricePerMeter: property.pricePerMeter ?? Math.round(property.price / property.area),
            isNew: property.isNew ?? Math.random() > 0.7,
            isVerified: property.isVerified ?? Math.random() > 0.5,
            nearbyTransport: property.nearbyTransport ?? {
                type: 'metro' as const,
                name: 'Diagonal',
                line: 'L3',
                color: '#339933',
                walkMinutes: Math.floor(Math.random() * 15) + 2,
            },
            author: property.author ?? {
                id: '1',
                name: 'Maria Garcia',
                avatar: `https://i.pravatar.cc/150?u=${property.id}`,
                type: Math.random() > 0.5 ? 'agent' : 'owner',
                isVerified: Math.random() > 0.3,
            },
        }),
        [property]
    );

    // Вычисление времени с момента публикации
    const timeAgo = useMemo(() => {
        const now = new Date();
        const created = new Date(property.createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('justNow');
        if (diffMins < 60) return t('minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('hoursAgo', { count: diffHours });
        return t('daysAgo', { count: diffDays });
    }, [property.createdAt, t]);

    // Подсчёт изображений для отображения
    const displayImages = property.images.slice(0, MAX_HOVER_IMAGES);
    const extraImagesCount = property.images.length - MAX_HOVER_IMAGES;

    // Обработка ховера для смены изображений
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!isHovering || displayImages.length <= 1) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const segmentWidth = rect.width / displayImages.length;
            const newIndex = Math.min(
                Math.floor(x / segmentWidth),
                displayImages.length - 1
            );

            if (newIndex !== currentImageIndex) {
                setCurrentImageIndex(newIndex);
            }
        },
        [isHovering, displayImages.length, currentImageIndex]
    );

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 500);
    };

    const handleDislike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDislikeAnimating(true);
        setTimeout(() => setDislikeAnimating(false), 500);
    };

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU') + ' €';
    };

    const getTransportIcon = (type: string) => {
        switch (type) {
            case 'metro':
                return (
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: mockProperty.nearbyTransport?.color || '#E50914' }}
                    />
                );
            case 'train':
                return <Train className="w-3.5 h-3.5 flex-shrink-0" />;
            case 'bus':
                return <Bus className="w-3.5 h-3.5 flex-shrink-0" />;
            default:
                return null;
        }
    };

    return (
        <div
            className={cn(
                'bg-card rounded-xl overflow-hidden border-2 border-transparent',
                'hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl',
                'cursor-pointer group'
            )}
            onClick={onClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                setCurrentImageIndex(0);
            }}
        >
            {/* Изображение с hover-слайдером */}
            <div
                className="relative aspect-square"
                onMouseMove={handleMouseMove}
            >
                <Image
                    src={displayImages[currentImageIndex] ? safeImageSrc(displayImages[currentImageIndex]) : '/placeholder-property.jpg'}
                    alt={property.title}
                    fill
                    className="object-cover transition-opacity duration-200"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Индикаторы изображений */}
                {displayImages.length > 1 && isHovering && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {displayImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full transition-all',
                                    idx === currentImageIndex
                                        ? 'bg-white w-3'
                                        : 'bg-white/50'
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Надпись "ещё N" */}
                {extraImagesCount > 0 &&
                    currentImageIndex === displayImages.length - 1 &&
                    isHovering && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-lg font-medium">
                                {t('viewMore', { count: extraImagesCount })}
                            </span>
                        </div>
                    )}

                {/* Аватар автора и время публикации */}
                <div className="absolute top-3 right-3 z-10">
                    {mockProperty.author && (
                        <div className="flex items-center gap-1.5 bg-card/95 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1 shadow-md">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={safeImageSrc(mockProperty.author.avatar)} />
                                <AvatarFallback className="text-xs">
                                    {mockProperty.author.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-text-secondary">{timeAgo}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Контент карточки */}
            <div className="p-4">
                {/* Цена и кнопки */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                        <div className="text-xl font-bold text-foreground truncate">
                            {formatPrice(mockProperty.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {mockProperty.pricePerMeter?.toLocaleString('ru-RU')}{' '}
                            {t('pricePerMeter')}
                        </div>
                    </div>

                    {/* Кнопки лайк/дизлайк */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-green-500/20 hover:text-green-600 text-muted-foreground transition-colors"
                            onClick={handleLike}
                            title={t('like')}
                        >
                            <ThumbsUp
                                className={cn(
                                    'w-5 h-5',
                                    likeAnimating && 'animate-bounce'
                                )}
                            />
                        </button>
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-500/20 hover:text-red-500 text-muted-foreground transition-colors"
                            onClick={handleDislike}
                            title={t('dislike')}
                        >
                            <ThumbsDown
                                className={cn(
                                    'w-5 h-5',
                                    dislikeAnimating && 'animate-bounce'
                                )}
                            />
                        </button>
                    </div>
                </div>

                {/* Характеристики */}
                <div className="flex items-center gap-1.5 text-sm text-foreground mb-2">
                    <span className="font-semibold whitespace-nowrap">
                        {property.bedrooms} {t('roomsShort')}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="whitespace-nowrap">{property.area} м²</span>
                    {mockProperty.floor && mockProperty.totalFloors && (
                        <>
                            <span className="text-muted-foreground">•</span>
                            <span className="whitespace-nowrap">
                                {t('floorOf', {
                                    floor: mockProperty.floor,
                                    total: mockProperty.totalFloors,
                                })}
                            </span>
                        </>
                    )}
                </div>

                {/* Тип недвижимости */}
                <div className="text-sm text-primary font-medium mb-2 truncate">
                    {tTypes(property.type)}
                </div>

                {/* Адрес */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                        {property.address}, {property.city}
                    </span>
                </div>

                {/* Транспорт и меню */}
                <div className="flex items-center justify-between">
                    {mockProperty.nearbyTransport ? (
                        <div className="flex items-center gap-2 text-sm min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                {getTransportIcon(mockProperty.nearbyTransport.type)}
                                <span className="text-foreground truncate">
                                    {mockProperty.nearbyTransport.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {t('walkMin', {
                                        min: mockProperty.nearbyTransport.walkMinutes,
                                    })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div />
                    )}

                    {/* Меню дополнительных действий */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-secondary text-muted-foreground transition-colors flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="gap-2 cursor-pointer"
                            >
                                <StickyNote className="w-4 h-4" />
                                {t('addNote')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="gap-2 cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" />
                                {t('share')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="gap-2 cursor-pointer text-destructive"
                            >
                                <Flag className="w-4 h-4" />
                                {t('report')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
