'use client';

import { useRef, useState } from 'react';
import {
    MapPin, Bed, Bath, Maximize, Train, Bus,
    ChevronLeft, ChevronRight, Wifi, Snowflake,
    Car, Sofa, Dumbbell, Shield, Waves, Trees
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import type { PropertyChatCard, PropertyFeature } from '@/entities/property';
import { getImageUrl, getImageAlt } from '@/entities/property/model/card-types';

interface PropertyExpandedCardProps {
    property: PropertyChatCard;
    filterName?: string;
    actions?: React.ReactNode;
    className?: string;
    isNew?: boolean;
}

const featureIcons: Partial<Record<PropertyFeature, React.ElementType>> = {
    airConditioning: Snowflake,
    parking: Car,
    furnished: Sofa,
    elevator: Dumbbell,
    pool: Waves,
    garden: Trees,
};

const featureLabels: Partial<Record<PropertyFeature, string>> = {
    airConditioning: 'Кондиционер',
    parking: 'Парковка',
    furnished: 'Мебель',
    elevator: 'Лифт',
    pool: 'Бассейн',
    garden: 'Сад',
    balcony: 'Балкон',
    terrace: 'Терраса',
};

/**
 * Expanded property card with photo carousel for AI agent chat
 * Shows full details: title, description, amenities, characteristics
 */
export function PropertyExpandedCard({
    property,
    filterName,
    actions,
    className,
    isNew = false,
}: PropertyExpandedCardProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = property.images || [];

    const scrollImages = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;

        const imageWidth = el.clientWidth * 0.85; // 85% width per image
        const scrollAmount = direction === 'left' ? -imageWidth : imageWidth;
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });

        // Update index based on scroll position
        const newIndex = direction === 'left'
            ? Math.max(0, currentImageIndex - 1)
            : Math.min(images.length - 1, currentImageIndex + 1);
        setCurrentImageIndex(newIndex);
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const imageWidth = el.clientWidth * 0.85;
        const newIndex = Math.round(el.scrollLeft / imageWidth);
        setCurrentImageIndex(Math.min(newIndex, images.length - 1));
    };

    const TransportIcon = property.transport_station?.type === 'bus' ? Bus : Train;
    const displayFeatures = property.features?.slice(0, 6) || [];

    return (
        <div
            className={cn(
                'bg-card border border-border rounded-2xl overflow-hidden',
                'transition-all duration-300',
                'animate-message-slide-in',
                'w-full max-w-2xl',
                className
            )}
        >
            {/* Photo Carousel */}
            <div className="relative">
                {/* Images */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory touch-pan-x px-3 py-3"
                >
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative shrink-0 snap-start rounded-xl overflow-hidden w-[80%] md:w-[75%] aspect-4/3"
                        >
                            <img
                                src={getImageUrl(image)}
                                alt={getImageAlt(image, `${property.title} ${index + 1}`)}
                                className="w-full h-full object-cover"
                            />

                            {/* NEW badge on first image */}
                            {index === 0 && (isNew || property.is_new) && (
                                <Badge variant="primary" className="absolute top-2 left-2 text-xs">
                                    NEW
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => scrollImages('left')}
                            disabled={currentImageIndex === 0}
                            className={cn(
                                'absolute left-1 top-1/2 -translate-y-1/2 z-10',
                                'w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm',
                                'flex items-center justify-center shadow-md',
                                'transition-all hover:bg-background',
                                currentImageIndex === 0 && 'opacity-30 cursor-not-allowed'
                            )}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollImages('right')}
                            disabled={currentImageIndex === images.length - 1}
                            className={cn(
                                'absolute right-1 top-1/2 -translate-y-1/2 z-10',
                                'w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm',
                                'flex items-center justify-center shadow-md',
                                'transition-all hover:bg-background',
                                currentImageIndex === images.length - 1 && 'opacity-30 cursor-not-allowed'
                            )}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-5 right-5 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1}/{images.length}
                    </div>
                )}

                {/* Dot indicators */}
                {images.length > 1 && images.length <= 10 && (
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full transition-all',
                                    index === currentImageIndex
                                        ? 'bg-white w-3'
                                        : 'bg-white/50'
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Filter badge */}
                {filterName && (
                    <Badge variant="secondary" className="text-xs">
                        {filterName}
                    </Badge>
                )}

                {/* Price */}
                <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-brand-primary">
                        {property.price.toLocaleString()} €<span className="text-sm font-normal text-text-tertiary">/мес</span>
                    </span>
                    {property.price_per_meter && (
                        <span className="text-xs text-text-tertiary">
                            {property.price_per_meter} €/m²
                        </span>
                    )}
                </div>

                {/* Characteristics */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                    {property.rooms > 0 && (
                        <span className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4" />
                            {property.rooms} комн.
                        </span>
                    )}
                    {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4" />
                            {property.bathrooms}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Maximize className="w-4 h-4" />
                        {property.area} m²
                    </span>
                    {property.floor && (
                        <span className="text-text-tertiary">
                            {property.floor}/{property.total_floors} эт.
                        </span>
                    )}
                </div>

                {/* Address */}
                <p className="text-sm text-text-secondary flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {property.address}
                </p>

                {/* Transport */}
                {property.transport_station && (
                    <div className="flex items-center gap-2 text-sm text-text-tertiary">
                        <TransportIcon className="w-4 h-4" />
                        {property.transport_station.lines?.[0] && (
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: property.transport_station.lines[0].color }}
                            />
                        )}
                        <span>{property.transport_station.station_name}</span>
                        <span>• {property.transport_station.walk_minutes} мин пешком</span>
                    </div>
                )}

                {/* Amenities grid */}
                {displayFeatures.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                        {displayFeatures.map((feature) => {
                            const Icon = featureIcons[feature] || Wifi;
                            const label = featureLabels[feature] || feature.replace(/([A-Z])/g, ' $1').trim();
                            return (
                                <div
                                    key={feature}
                                    className="flex items-center gap-1.5 text-xs text-text-secondary bg-background-secondary px-2 py-1.5 rounded-lg"
                                >
                                    <Icon className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate capitalize">{label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Description */}
                {property.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 pt-1">
                        {property.description}
                    </p>
                )}

                {/* Actions */}
                {actions && (
                    <div className="pt-2 border-t border-border">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
