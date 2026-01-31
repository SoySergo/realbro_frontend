'use client';

import { cn } from '@/shared/lib/utils';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TransportStations, type TransportStation } from './transport-stations';

interface PropertyAddressWithTransportProps {
    address: string; // Fallback or street/house part
    country?: string;
    region?: string;
    province?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    street?: string;
    houseNumber?: string;
    stations: TransportStation[];
    className?: string;
    showMapButton?: boolean;
    onMapClick?: () => void;
}

export function PropertyAddressWithTransport({
    address,
    country,
    region,
    province,
    city,
    district,
    neighborhood,
    street,
    houseNumber,
    stations,
    className,
    showMapButton = false,
    onMapClick
}: PropertyAddressWithTransportProps) {
    const t = useTranslations('propertyDetail');

    // Construct address string from parts.
    // If street/house are not provided, we use `address` as the specific part (legacy behavior).
    const addressParts = [
        country,
        region,
        province ? `провинция ${province}` : null,
        city,
        district,
        neighborhood,
        street,
        houseNumber
    ].filter(Boolean);

    const fullAddress = addressParts.length > 0
        ? `${addressParts.join(', ')}${(!street && !houseNumber && address) ? `, ${address}` : ''}`
        : address;

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-start justify-between gap-4">
                 <p className="text-sm text-muted-foreground font-normal">
                    {fullAddress}
                </p>
                
                {showMapButton && (
                    <button 
                        onClick={onMapClick}
                        className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium whitespace-nowrap flex items-center gap-1 transition-colors"
                    >
                        <MapPin className="w-4 h-4" />
                        {t('map')}
                    </button>
                )}
            </div>
            
            <div className="pt-1">
                <TransportStations stations={stations} />
            </div>
        </div>
    );
}
