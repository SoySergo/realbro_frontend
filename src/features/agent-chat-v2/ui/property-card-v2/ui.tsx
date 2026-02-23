'use client';

import React, { useState, useRef, useCallback } from 'react';
import { MapPin, Bed, Bath, Maximize, Train, Bus, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { MediaGalleryCollage } from '../media-gallery';
import type { PropertyChatCard } from '@/entities/property';
import type { PropertyReaction } from '../../model/types';

interface PropertyCardV2Props {
    property: PropertyChatCard;
    filterName?: string;
    reaction?: PropertyReaction;
    labels: {
        actions: Record<string, string>;
        showAll: string;
        photos: string;
        closeGallery: string;
    };
    onReaction?: (reaction: PropertyReaction) => void;
    onSwipeReply?: () => void;
    onClick?: () => void;
    className?: string;
}

/**
 * Карточка объекта v2 с галереей-коллажем и кнопками взаимодействия
 */
export const PropertyCardV2 = React.memo(function PropertyCardV2({
    property,
    filterName,
    reaction,
    labels,
    onReaction,
    onSwipeReply,
    onClick,
    className,
}: PropertyCardV2Props) {
    const [swipeX, setSwipeX] = useState(0);
    const touchStartRef = useRef<number>(0);
    const isSwiping = useRef(false);

    const TransportIcon = property.transport_station?.type === 'bus' ? Bus : Train;

    // Обработка свайпа для ответа
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX;
        isSwiping.current = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const diff = e.touches[0].clientX - touchStartRef.current;
        if (diff < -10) {
            isSwiping.current = true;
            setSwipeX(Math.max(diff, -80));
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (swipeX < -50 && onSwipeReply) {
            onSwipeReply();
        }
        setSwipeX(0);
        isSwiping.current = false;
    }, [swipeX, onSwipeReply]);

    const handleClick = useCallback(() => {
        if (!isSwiping.current && onClick) {
            onClick();
        }
    }, [onClick]);

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border border-border bg-card',
                'transition-all duration-200 hover:border-brand-primary/30 hover:shadow-md',
                'animate-message-slide-in',
                className
            )}
            style={{ transform: `translateX(${swipeX}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Индикатор свайпа */}
            {swipeX < -10 && (
                <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-brand-primary/10 text-brand-primary text-xs font-medium z-10">
                    {labels.actions.reply}
                </div>
            )}

            {/* Медиа-коллаж */}
            {property.images?.length > 0 && (
                <div className="relative">
                    <MediaGalleryCollage
                        images={property.images}
                        maxVisible={property.images.length > 4 ? 6 : property.images.length}
                        alt={property.title}
                        labels={{
                            showAll: labels.showAll,
                            photos: labels.photos,
                            closeGallery: labels.closeGallery,
                        }}
                    />
                    {/* Бейджи поверх галереи */}
                    <div className="absolute top-2 left-2 flex gap-1.5 z-10 pointer-events-none">
                        {property.is_new && (
                            <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">
                                NEW
                            </Badge>
                        )}
                        {filterName && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                {filterName}
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {/* Контент */}
            <div className="p-3 space-y-2 cursor-pointer" onClick={handleClick}>
                {/* Цена */}
                <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-brand-primary">
                        {property.price.toLocaleString()} €
                    </span>
                    {property.price_per_meter && (
                        <span className="text-[10px] text-text-tertiary">
                            {property.price_per_meter} €/m²
                        </span>
                    )}
                </div>

                {/* Характеристики */}
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                    {property.rooms > 0 && (
                        <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5" />
                            {property.rooms}
                        </span>
                    )}
                    {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" />
                            {property.bathrooms}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" />
                        {property.area} m²
                    </span>
                    {property.floor && (
                        <span className="text-text-tertiary">
                            {property.floor}/{property.total_floors}
                        </span>
                    )}
                </div>

                {/* Адрес */}
                <p className="text-xs text-text-secondary truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {property.address}
                </p>

                {/* Транспорт */}
                {property.transport_station && (
                    <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                        <TransportIcon className="w-3 h-3" />
                        {property.transport_station.lines?.[0] && (
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: property.transport_station.lines[0].color }}
                            />
                        )}
                        <span className="truncate">{property.transport_station.station_name}</span>
                        <span>{property.transport_station.walk_minutes} min</span>
                    </div>
                )}
            </div>

            {/* Кнопки взаимодействия */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onReaction?.('like')}
                        className={cn(
                            'p-2 rounded-lg transition-all active:scale-90',
                            reaction === 'like'
                                ? 'bg-success/15 text-success'
                                : 'hover:bg-background-secondary text-text-tertiary hover:text-success'
                        )}
                        aria-label={labels.actions.like}
                    >
                        <ThumbsUp className={cn('w-4 h-4', reaction === 'like' && 'animate-icon-pop')} />
                    </button>
                    <button
                        onClick={() => onReaction?.('dislike')}
                        className={cn(
                            'p-2 rounded-lg transition-all active:scale-90',
                            reaction === 'dislike'
                                ? 'bg-error/15 text-error'
                                : 'hover:bg-background-secondary text-text-tertiary hover:text-error'
                        )}
                        aria-label={labels.actions.dislike}
                    >
                        <ThumbsDown className={cn('w-4 h-4', reaction === 'dislike' && 'animate-icon-pop')} />
                    </button>
                    <button
                        onClick={() => onReaction?.('report')}
                        className="p-2 rounded-lg hover:bg-background-secondary text-text-tertiary hover:text-warning transition-all active:scale-90"
                        aria-label={labels.actions.report}
                    >
                        <Flag className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
});
