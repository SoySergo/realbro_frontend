'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import {
    Bus,
    GraduationCap,
    Stethoscope,
    Trees,
    ShoppingCart,
    Utensils,
    Scissors,
    Landmark,
    ShoppingBag,
    Dumbbell,
    Ticket
} from 'lucide-react';
import { BaseMap } from '@/features/map';
import mapboxgl from 'mapbox-gl';
import type { NearbyTransport } from '../../model/types';
import type { NearbyPlaces, NearbyPlace } from '@/shared/api';
import { PropertyAddressWithTransport } from '../property-address-transport';
import { LocationCategoryList } from './location-category-list';
import { TransportStationsDetailed } from '../property-address-transport/transport-stations';
import { HorizontalScroll } from '@/shared/ui/horizontal-scroll';

interface PropertyLocationSectionProps {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    nearbyTransport?: NearbyTransport[];
    nearbyPlaces?: NearbyPlaces;
    className?: string;
}

export function PropertyLocationSection({
    address,
    coordinates,
    nearbyTransport,
    nearbyPlaces,
    className
}: PropertyLocationSectionProps) {
    const t = useTranslations('propertyDetail.locationSection');

    // Filter categories with translations
    const filterCategories = [
        { key: 'transport', icon: Bus, label: t('categories.transport') },
        { key: 'schools', icon: GraduationCap, label: t('categories.schools') },
        { key: 'medical', icon: Stethoscope, label: t('categories.medical') },
        { key: 'groceries', icon: ShoppingCart, label: t('categories.groceries') },
        { key: 'shopping', icon: ShoppingBag, label: t('categories.shopping') },
        { key: 'restaurants', icon: Utensils, label: t('categories.restaurants') },
        { key: 'sports', icon: Dumbbell, label: t('categories.sports') },
        { key: 'entertainment', icon: Ticket, label: t('categories.entertainment') },
        { key: 'parks', icon: Trees, label: t('categories.parks') },
        { key: 'beauty', icon: Scissors, label: t('categories.beauty') },
        { key: 'attractions', icon: Landmark, label: t('categories.attractions') }
    ];
    const [activeFilter, setActiveFilter] = useState<string>('transport');
    
    const handleMapLoad = useCallback((map: mapboxgl.Map) => {
        // Get brand color from CSS variable
        const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() || '#198bff';

        // Add marker at property location
        const marker = new mapboxgl.Marker({ color: brandColor })
            .setLngLat([coordinates.lng, coordinates.lat])
            .addTo(map);

        // Center map on property
        map.flyTo({
            center: [coordinates.lng, coordinates.lat],
            zoom: 14,
            duration: 0
        });
    }, [coordinates]);

    // Convert nearbyPlaces transport to component format, or map from nearbyTransport prop
    const transportStations = nearbyPlaces?.transport
        ? nearbyPlaces.transport.map(station => ({
            id: station.id,
            name: station.name,
            lines: station.lines.map(line => ({
                id: line.id,
                type: line.type as 'metro' | 'train' | 'tram' | 'bus',
                name: line.name,
                color: line.color,
                destination: line.destination
            })),
            distance: station.walkTime,
            isWalk: station.isWalk ?? true
        }))
        : nearbyTransport?.map((t, i) => ({
            id: String(i),
            name: t.name,
            lines: [{
                id: String(i),
                type: t.type,
                name: t.line ?? '',
                color: t.color
            }],
            distance: t.walkMinutes,
            isWalk: true
        })) || [];

    // Helper to convert NearbyPlace to LocationPOI format for LocationCategoryList
    const convertToLocationPOI = (places: NearbyPlace[] | undefined) => {
        if (!places) return [];
        return places.map(place => ({
            id: place.id,
            name: place.name,
            type: place.type,
            distance: place.distance < 1000
                ? `${place.distance} м`
                : `${(place.distance / 1000).toFixed(1)} км`,
            address: place.address,
            openingHours: place.openingHours,
            phone: place.phone,
            website: place.website,
            rating: place.rating,
            priceLevel: place.priceLevel,
            cuisine: place.cuisine
        }));
    };

    const renderContent = () => {
        switch (activeFilter) {
            case 'transport':
                return (
                    <div className="space-y-4">
                        <TransportStationsDetailed
                            key="transport"
                            stations={transportStations}
                            className="bg-card w-full"
                        />
                    </div>
                );
            case 'schools':
            case 'medical':
            case 'groceries':
            case 'shopping':
            case 'restaurants':
            case 'sports':
            case 'entertainment':
            case 'parks':
            case 'beauty':
            case 'attractions':
                const categoryData: Record<string, NearbyPlace[] | undefined> = {
                    medical: nearbyPlaces?.medical,
                    schools: nearbyPlaces?.schools,
                    groceries: nearbyPlaces?.groceries,
                    shopping: nearbyPlaces?.shopping,
                    restaurants: nearbyPlaces?.restaurants,
                    sports: nearbyPlaces?.sports,
                    entertainment: nearbyPlaces?.entertainment,
                    parks: nearbyPlaces?.parks,
                    beauty: nearbyPlaces?.beauty,
                    attractions: nearbyPlaces?.attractions
                };
                const items = convertToLocationPOI(categoryData[activeFilter]);
                return <LocationCategoryList key={activeFilter} items={items} />;
            default:
                return null;
        }
    };

    return (
        <div id="property-map-section" className={cn('space-y-4 md:space-y-6', className)}>
            <h3 className="text-xl font-bold text-foreground">
                {useTranslations('propertyDetail')('location')}
            </h3>

            {/* Address and Transport Info */}
            <div className="space-y-2">
                <PropertyAddressWithTransport
                    address={address}
                    stations={transportStations}
                />
            </div>

            <div className="-mx-4 md:mx-0">
                <HorizontalScroll 
                    variant="static"
                    className="gap-2 px-4 md:px-0 rounded-none md:rounded-xl"
                    leftButtonWrapperClassName="hidden md:flex"
                    rightButtonWrapperClassName="hidden md:flex"
                >
                    {filterCategories.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeFilter === category.key;
                        
                        return (
                            <button
                                key={category.key}
                                onClick={() => setActiveFilter(category.key)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border shrink-0 snap-start scroll-mx-4',
                                    isActive 
                                        ? 'bg-brand-primary text-white border-brand-primary ' 
                                        : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground")} />
                                {t(`categories.${category.key}`)}
                            </button>
                        );
                    })}
                </HorizontalScroll>
            </div>

            {/* Map */}
            <div className="relative -mx-4 md:mx-0 rounded-none md:rounded-2xl overflow-hidden h-[300px] md:h-[400px] bg-muted border-y md:border border-border/50 shadow-sm">
                <BaseMap
                    initialCenter={[coordinates.lng, coordinates.lat]}
                    initialZoom={14}
                    onMapLoad={handleMapLoad}
                    className="h-full w-full"
                />
            </div>
            
            <div className="min-h-[150px]">
                {renderContent()}
            </div>
        </div>
    );
}
