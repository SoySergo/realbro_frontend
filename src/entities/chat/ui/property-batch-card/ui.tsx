'use client';

import React from 'react';
import { MapPin, Bed, Maximize, Train, Bus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import type { PropertyChatCard } from '@/entities/property';
import { getImageUrl, getImageAlt } from '@/entities/property/model/card-types';

interface PropertyBatchCardProps {
    property: PropertyChatCard;
    filterName?: string;
    actions?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

/**
 * Batch property card for carousel display
 * Memoized to prevent re-renders when sibling cards change
 */
export const PropertyBatchCard = React.memo(function PropertyBatchCard({
    property,
    filterName,
    actions,
    onClick,
    className,
}: PropertyBatchCardProps) {
    const mainImage = property.images?.[0];

    const TransportIcon = property.transport_station?.type === 'bus' ? Bus : Train;

    return (
        <div
            className={cn(
                'bg-card border border-border rounded-xl overflow-hidden',
                'transition-all duration-200 hover:border-brand-primary/50 hover:shadow-md',
                'w-full cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative h-[160px] overflow-hidden">
                {mainImage ? (
                    <img
                        src={getImageUrl(mainImage)}
                        alt={getImageAlt(mainImage, property.title)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-text-tertiary" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
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

                {/* Images count */}
                {property.images?.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        1/{property.images.length}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                {/* Price */}
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

                {/* Specs */}
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                    {property.rooms > 0 && (
                        <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5" />
                            {property.rooms}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" />
                        {property.area} m²
                    </span>
                    {property.floor && (
                        <span className="text-text-tertiary">
                            {property.floor}/{property.total_floors} fl.
                        </span>
                    )}
                </div>

                {/* Address */}
                <p className="text-xs text-text-secondary truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {property.address}
                </p>

                {/* Transport */}
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

                {/* Actions */}
                {actions && (
                    <div className="pt-1 border-t border-border">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
});
