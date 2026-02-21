'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { toast } from 'sonner';
import { Link } from '@/shared/config/routing';
import {
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    StickyNote,
    Share2,
    Flag,
    MapPin,
    Clock,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { PropertyNoteDialog } from '@/features/property-note';
import type { PropertyGridCard } from '../../model/card-types';
import { getImageUrl, getImageAlt } from '../../model/card-types';
import { cn, safeImageSrc } from '@/shared/lib/utils';
import { useUserActionsStore } from '@/entities/user-actions';

const MAX_HOVER_IMAGES = 6;
const DEFAULT_METRO_LINE_COLOR = '#E50914';

interface PropertyCardGridProps {
    property: PropertyGridCard;
    onClick?: () => void;
    // Слот для дополнительных действий (например, кнопка сравнения)
    actions?: React.ReactNode;
    // Слот для пунктов меню
    menuItems?: React.ReactNode;
}

export function PropertyCardGrid({ property, onClick, actions, menuItems }: PropertyCardGridProps) {
    const t = useTranslations('property');

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [dislikeAnimating, setDislikeAnimating] = useState(false);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const touchStartX = useRef(0);

    // Дата публикации: приоритет published_at (бекенд), fallback на created_at (legacy)
    const timeAgo = useMemo(() => {
        const dateStr = property.published_at || property.created_at;
        if (!dateStr) return '';
        const now = new Date();
        const created = new Date(dateStr);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('justNow');
        if (diffMins < 60) return t('minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('hoursAgo', { count: diffHours });
        return t('daysAgo', { count: diffDays });
    }, [property.published_at, property.created_at, t]);

    const displayImages = property.images.slice(0, MAX_HOVER_IMAGES);
    const extraImagesCount = property.images.length - MAX_HOVER_IMAGES;

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!isHovering || displayImages.length <= 1) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const segmentWidth = rect.width / displayImages.length;
            const newIndex = Math.min(Math.floor(x / segmentWidth), displayImages.length - 1);

            if (newIndex !== currentImageIndex) {
                setCurrentImageIndex(newIndex);
            }
        },
        [isHovering, displayImages.length, currentImageIndex]
    );

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentImageIndex < displayImages.length - 1) {
                    setCurrentImageIndex((prev) => prev + 1);
                } else if (diff < 0 && currentImageIndex > 0) {
                    setCurrentImageIndex((prev) => prev - 1);
                }
            }
        },
        [currentImageIndex, displayImages.length]
    );

    const tActions = useTranslations('actions');

    const { getReaction, setReaction: setStoreReaction } = useUserActionsStore();
    const currentReaction = getReaction(property.id);

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 500);
        // Переключение: если уже like → сброс, иначе → like
        const newReaction = currentReaction === 'like' ? null : 'like';
        setStoreReaction(property.id, newReaction);
        if (newReaction === 'like') {
            toast.success(tActions('liked'), { duration: 2000 });
        }
    };

    const handleDislike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDislikeAnimating(true);
        setTimeout(() => setDislikeAnimating(false), 500);
        // Переключение: если уже dislike → сброс, иначе → dislike
        const newReaction = currentReaction === 'dislike' ? null : 'dislike';
        setStoreReaction(property.id, newReaction);
        if (newReaction === 'dislike') {
            toast(tActions('disliked'), { duration: 2000 });
        }
    };

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU') + ' \u20ac';
    };

    return (
        <div
            className={cn(
                'bg-card rounded-xl overflow-hidden border border-transparent',
                'hover:border-border/50 transition-all duration-200 shadow-sm hover:shadow-md',
                'cursor-pointer group touch-manipulation',
                'min-w-0'
            )}
            onClick={onClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                setCurrentImageIndex(0);
            }}
        >
            {/* Image with hover slider + touch swipe */}
            <div
                className="relative aspect-[4/3] touch-manipulation"
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <Image
                    src={
                        displayImages[currentImageIndex]
                            ? safeImageSrc(getImageUrl(displayImages[currentImageIndex]))
                            : '/placeholder-property.jpg'
                    }
                    alt={displayImages[currentImageIndex] ? getImageAlt(displayImages[currentImageIndex], property.title) : property.title}
                    fill
                    className="object-cover transition-opacity duration-200"
                    sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Image indicators */}
                {displayImages.length > 1 && (isHovering || currentImageIndex > 0) && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {displayImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full transition-all',
                                    idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Extra images overlay */}
                {extraImagesCount > 0 &&
                    currentImageIndex === displayImages.length - 1 &&
                    isHovering && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-lg font-medium">
                                {t('viewMore', { count: extraImagesCount })}
                            </span>
                        </div>
                    )}

                {/* Author avatar and time */}
                <div className="absolute top-2 right-2 z-10">
                    {property.author && (
                        <Link
                            href={`/agency/${property.author.slug || property.author.id}`}
                            className="flex items-center gap-1 bg-card/95 backdrop-blur-sm rounded-full pl-0.5 pr-2 py-0.5 shadow-md hover:shadow-lg transition-shadow"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Avatar className="w-5 h-5">
                                <AvatarImage src={safeImageSrc(property.author.avatar)} />
                                <AvatarFallback className="text-[10px]">
                                    {property.author.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-text-secondary">{timeAgo}</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Card content */}
            <div className="p-3">
                {/* Price and buttons */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 text-lg sm:text-base truncate">
                            <span className="font-bold text-foreground">{formatPrice(property.price)}</span>
                            <span className="text-xs sm:text-[11px] text-muted-foreground font-normal">
                                {property.price_per_meter?.toLocaleString('ru-RU')} {t('pricePerMeter')}
                            </span>
                        </div>
                    </div>

                    {/* Like/dislike buttons - увеличены на мобильных */}
                    <div className="flex items-center gap-1 sm:gap-0.5 flex-shrink-0">
                        {/* Слот для дополнительных действий (например, сравнение) */}
                        {actions}
                        <button
                            className={cn(
                                'w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-colors',
                                currentReaction === 'like'
                                    ? 'bg-green-500/20 text-green-600'
                                    : 'hover:bg-green-500/20 hover:text-green-600 text-muted-foreground'
                            )}
                            onClick={handleLike}
                            title={t('like')}
                        >
                            <ThumbsUp
                                className={cn('w-5 h-5 sm:w-4 sm:h-4', likeAnimating && 'animate-bounce')}
                            />
                        </button>
                        <button
                            className={cn(
                                'w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-colors',
                                currentReaction === 'dislike'
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'hover:bg-red-500/20 hover:text-red-500 text-muted-foreground'
                            )}
                            onClick={handleDislike}
                            title={t('dislike')}
                        >
                            <ThumbsDown
                                className={cn('w-5 h-5 sm:w-4 sm:h-4', dislikeAnimating && 'animate-bounce')}
                            />
                        </button>
                    </div>
                </div>

                {/* Characteristics */}
                <div className="flex items-center gap-1.5 text-sm sm:text-xs text-foreground mb-1 flex-wrap">
                    <span className="font-medium whitespace-nowrap">
                        {property.rooms} {t('roomsShort')}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="whitespace-nowrap">{property.area} m²</span>
                    {property.floor && property.total_floors && (
                        <>
                            <span className="text-muted-foreground">·</span>
                            <span className="whitespace-nowrap">
                                {t('floorOf', {
                                    floor: property.floor,
                                    total: property.total_floors,
                                })}
                            </span>
                        </>
                    )}
                </div>

                {/* Title - новое поле вместо типа */}
                <div className="text-sm sm:text-xs font-medium text-foreground mb-1 line-clamp-2">
                    {property.title}
                </div>

                {/* Address */}
                <div className="flex items-center gap-1 text-sm sm:text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="truncate">
                        {property.address}
                    </span>
                </div>

                {/* Transport and menu */}
                <div className="flex items-center justify-between gap-2">
                    {property.transport_station ? (
                        <div className="flex items-center gap-2 text-sm sm:text-xs min-w-0">
                            {/* Линии транспорта */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {property.transport_station.lines?.map((line, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-center min-w-5 h-4 px-1 text-[9px] font-bold leading-none rounded shadow-sm text-white"
                                        style={{
                                            backgroundColor: line.color || DEFAULT_METRO_LINE_COLOR,
                                        }}
                                    >
                                        {line.name || 'M'}
                                    </div>
                                ))}
                            </div>
                            {/* Название станции */}
                            <span className="text-foreground truncate font-normal">
                                {property.transport_station.station_name}
                            </span>
                            {/* Время в пути */}
                            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {t('walkMin', { min: property.transport_station.walk_minutes })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div />
                    )}

                    {/* More actions menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-secondary text-muted-foreground transition-colors flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {/* Слот для дополнительных пунктов меню */}
                            {menuItems}
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsNoteDialogOpen(true);
                                }}
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

            {/* Диалог заметки */}
            <PropertyNoteDialog
                propertyId={property.id}
                propertyTitle={property.title}
                isOpen={isNoteDialogOpen}
                onClose={() => setIsNoteDialogOpen(false)}
            />
        </div>
    );
}
