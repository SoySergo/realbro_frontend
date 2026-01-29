'use client';

import React from 'react';
import { MapPin, Bed, Maximize, Train, Bus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import type { Property } from '@/entities/property';

interface PropertyBatchCardProps {
    property: Property;
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

    const TransportIcon = property.nearbyTransport?.type === 'bus' ? Bus : Train;

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
                        src={mainImage}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-text-tertiary" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                    {property.isNew && (
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
                    {property.pricePerMeter && (
                        <span className="text-[10px] text-text-tertiary">
                            {property.pricePerMeter} €/m²
                        </span>
                    )}
                </div>

                {/* Specs */}
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                    {property.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5" />
                            {property.bedrooms}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" />
                        {property.area} m²
                    </span>
                    {property.floor && (
                        <span className="text-text-tertiary">
                            {property.floor}/{property.totalFloors} fl.
                        </span>
                    )}
                </div>

                {/* Address */}
                <p className="text-xs text-text-secondary truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {property.address}
                </p>

                {/* Transport */}
                {property.nearbyTransport && (
                    <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                        <TransportIcon className="w-3 h-3" />
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: property.nearbyTransport.color }}
                        />
                        <span className="truncate">{property.nearbyTransport.name}</span>
                        <span>{property.nearbyTransport.walkMinutes} min</span>
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
