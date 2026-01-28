'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import type { Property } from '../../model/types';
import { cn, safeImageSrc } from '@/shared/lib/utils';

const MAX_HOVER_IMAGES = 6;

interface PropertyCardGridProps {
    property: Property;
    onClick?: () => void;
}

export function PropertyCardGrid({ property, onClick }: PropertyCardGridProps) {
    const t = useTranslations('property');
    const tTypes = useTranslations('propertyTypes');

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [dislikeAnimating, setDislikeAnimating] = useState(false);
    const touchStartX = useRef(0);

    const mockProperty = useMemo(
        () => ({
            ...property,
            totalFloors: property.totalFloors ?? 5,
            pricePerMeter: property.pricePerMeter ?? Math.round(property.price / property.area),
            nearbyTransport: property.nearbyTransport ?? {
                type: 'metro' as const,
                name: 'Diagonal',
                line: 'L3',
                color: '#339933',
                walkMinutes: 5,
            },
            author: property.author ?? {
                id: '1',
                name: 'Maria Garcia',
                avatar: `https://i.pravatar.cc/150?u=${property.id}`,
                type: 'agent' as const,
                isVerified: true,
            },
        }),
        [property]
    );

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
        return price.toLocaleString('ru-RU') + ' \u20ac';
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
                'cursor-pointer group touch-manipulation active:scale-[0.98]',
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
                            ? safeImageSrc(displayImages[currentImageIndex])
                            : '/placeholder-property.jpg'
                    }
                    alt={property.title}
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
                    {mockProperty.author && (
                        <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm rounded-full pl-0.5 pr-2 py-0.5 shadow-md">
                            <Avatar className="w-5 h-5">
                                <AvatarImage src={safeImageSrc(mockProperty.author.avatar)} />
                                <AvatarFallback className="text-[10px]">
                                    {mockProperty.author.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-text-secondary">{timeAgo}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Card content */}
            <div className="p-3">
                {/* Price and buttons */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="min-w-0 flex-1">
                        <div className="text-base font-bold text-foreground truncate">
                            {formatPrice(mockProperty.price)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            {mockProperty.pricePerMeter?.toLocaleString('ru-RU')} {t('pricePerMeter')}
                        </div>
                    </div>

                    {/* Like/dislike buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-green-500/20 hover:text-green-600 text-muted-foreground transition-colors"
                            onClick={handleLike}
                            title={t('like')}
                        >
                            <ThumbsUp
                                className={cn('w-4 h-4', likeAnimating && 'animate-bounce')}
                            />
                        </button>
                        <button
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-500/20 hover:text-red-500 text-muted-foreground transition-colors"
                            onClick={handleDislike}
                            title={t('dislike')}
                        >
                            <ThumbsDown
                                className={cn('w-4 h-4', dislikeAnimating && 'animate-bounce')}
                            />
                        </button>
                    </div>
                </div>

                {/* Characteristics */}
                <div className="flex items-center gap-1 text-xs text-foreground mb-1.5 flex-wrap">
                    <span className="font-semibold whitespace-nowrap">
                        {property.bedrooms} {t('roomsShort')}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="whitespace-nowrap">{property.area} m²</span>
                    {mockProperty.floor && mockProperty.totalFloors && (
                        <>
                            <span className="text-muted-foreground">·</span>
                            <span className="whitespace-nowrap">
                                {t('floorOf', {
                                    floor: mockProperty.floor,
                                    total: mockProperty.totalFloors,
                                })}
                            </span>
                        </>
                    )}
                </div>

                {/* Property type */}
                <div className="text-xs text-primary font-medium mb-1.5 truncate">
                    {tTypes(property.type)}
                </div>

                {/* Address */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                        {property.address}, {property.city}
                    </span>
                </div>

                {/* Transport and menu */}
                <div className="flex items-center justify-between">
                    {mockProperty.nearbyTransport ? (
                        <div className="flex items-center gap-1.5 text-xs min-w-0">
                            <div className="flex items-center gap-1 min-w-0">
                                {getTransportIcon(mockProperty.nearbyTransport.type)}
                                <span className="text-foreground truncate">
                                    {mockProperty.nearbyTransport.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-0.5 text-muted-foreground flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {t('walkMin', { min: mockProperty.nearbyTransport.walkMinutes })}
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
