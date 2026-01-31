'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { 
    ExternalLink, 
    Building2, 
    Compass, 
    Bus, 
    GraduationCap, 
    Stethoscope, 
    Trees, 
    ShoppingCart,
    ChevronRight,
    ChevronLeft,
    Utensils,
    Scissors,
    Landmark,
    ShoppingBag,
    Dumbbell,
    Clapperboard,
    Ticket
} from 'lucide-react';
import { BaseMap } from '@/features/map';
import mapboxgl from 'mapbox-gl';
import type { NearbyTransport } from '../../model/types';
import { PropertyAddressWithTransport } from '../property-address-transport';
import { PropertyCardGrid } from '../property-card-grid';
import { LocationCategoryList } from './location-category-list';
import { TransportStationsDetailed } from '../property-address-transport/transport-stations';
import { 
    mockNearbyProperties, 
    mockMedical, 
    mockSchools, 
    mockRecreation, 
    mockGroceries,
    mockShopping,
    mockSports,
    mockEntertainment,
    mockTransportStations,
    mockRestaurants,
    mockBeauty,
    mockAttractions
} from './mock-data';
import { HorizontalScroll } from '@/shared/ui/horizontal-scroll';

interface PropertyLocationSectionProps {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    nearbyTransport?: NearbyTransport[];
    className?: string;
}

// Filter categories
const filterCategories = [
    { key: 'transport', icon: Bus, label: 'Транспорт' },
    { key: 'schools', icon: GraduationCap, label: 'Школы и сады' },
    { key: 'medical', icon: Stethoscope, label: 'Медицина' },
    { key: 'groceries', icon: ShoppingCart, label: 'Продукты' },
    { key: 'shopping', icon: ShoppingBag, label: 'Шопинг' },
    { key: 'restaurants', icon: Utensils, label: 'Бары и рестораны' },
    { key: 'sports', icon: Dumbbell, label: 'Спорт' },
    { key: 'entertainment', icon: Ticket, label: 'Культура и отдых' },
    { key: 'parks', icon: Trees, label: 'Парки скверы' }, 
    { key: 'beauty', icon: Scissors, label: 'Бьюти и уход' },
    { key: 'attractions', icon: Landmark, label: 'Достопримечательности' }
];

export function PropertyLocationSection({
    address,
    coordinates,
    nearbyTransport,
    className
}: PropertyLocationSectionProps) {
    const t = useTranslations('propertyDetail.locationSection');
    const [activeFilter, setActiveFilter] = useState<string>('transport');
    
    const handleMapLoad = useCallback((map: mapboxgl.Map) => {
        // Add marker at property location
        const marker = new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([coordinates.lng, coordinates.lat])
            .addTo(map);

        // Center map on property
        map.flyTo({
            center: [coordinates.lng, coordinates.lat],
            zoom: 14,
            duration: 0
        });
    }, [coordinates]);

    const mappedStations: any[] = nearbyTransport?.map((t, i) => ({
        id: String(i),
        name: t.name,
        lines: [{ 
            id: String(i), 
            type: t.type, 
            name: 'line' in t ? t.line : '', 
            color: 'color' in t ? t.color : undefined 
        }],
        distance: 'walkMinutes' in t ? t.walkMinutes : 0,
        isWalk: true
    })) || mockTransportStations;

    const renderContent = () => {
        switch (activeFilter) {
            case 'transport':
                return (
                    <div className="space-y-4">
                        <TransportStationsDetailed 
                            key="transport"
                            stations={mappedStations} 
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
                let items: any[] = [];
                switch(activeFilter) {
                    case 'medical': items = mockMedical; break;
                    case 'schools': items = mockSchools; break;
                    case 'groceries': items = mockGroceries; break;
                    case 'shopping': items = mockShopping; break;
                    case 'restaurants': items = mockRestaurants; break;
                    case 'sports': items = mockSports; break;
                    case 'entertainment': items = mockEntertainment; break;
                    case 'parks': items = mockRecreation; break;
                    case 'beauty': items = mockBeauty; break;
                    case 'attractions': items = mockAttractions; break;
                    default: items = mockGroceries; 
                }
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
                    stations={mappedStations}
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
