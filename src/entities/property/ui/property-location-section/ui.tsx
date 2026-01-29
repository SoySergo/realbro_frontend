'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { MapPin, ExternalLink } from 'lucide-react';
import { BaseMap } from '@/features/map';
import mapboxgl from 'mapbox-gl';

interface PropertyLocationSectionProps {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    className?: string;
}

// Infrastructure categories (CIAN style)
const infrastructureCategories = [
    { key: 'metro', icon: 'M', label: 'Метро и МЦД', count: null },
    { key: 'schools', icon: '🏫', label: 'Школы', count: null },
    { key: 'kindergartens', icon: '🎒', label: 'Детские сады', count: null },
    { key: 'medical', icon: '🏥', label: 'Медицина', count: null },
    { key: 'recreation', icon: '🌳', label: 'Зоны отдыха', count: null },
    { key: 'shops', icon: '🛒', label: 'Магазины', count: null }
];

export function PropertyLocationSection({
    address,
    coordinates,
    className
}: PropertyLocationSectionProps) {
    const t = useTranslations('propertyDetail');
    const [activeTab, setActiveTab] = useState<'infrastructure' | 'panorama'>('infrastructure');

    const handleMapLoad = useCallback((map: mapboxgl.Map) => {
        // Add marker at property location
        new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([coordinates.lng, coordinates.lat])
            .addTo(map);

        // Center map on property
        map.flyTo({
            center: [coordinates.lng, coordinates.lat],
            zoom: 15,
            duration: 0
        });
    }, [coordinates]);

    const handleOpenGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
        window.open(url, '_blank');
    };

    const handleOpenStreetView = () => {
        const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinates.lat},${coordinates.lng}`;
        window.open(url, '_blank');
    };

    return (
        <div className={cn('space-y-4', className)}>
            <h3 className="font-semibold text-foreground">
                {t('location')}
            </h3>

            {/* Address */}
            <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{address}</p>
            </div>

            {/* Tabs - Desktop */}
            <div className="hidden md:flex gap-1 p-1 bg-muted rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('infrastructure')}
                    className={cn(
                        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                        activeTab === 'infrastructure'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {t('infrastructure')}
                </button>
                <button
                    onClick={() => setActiveTab('panorama')}
                    className={cn(
                        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                        activeTab === 'panorama'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {t('panorama')}
                </button>
            </div>

            {/* Map */}
            <div className="relative rounded-xl overflow-hidden h-[200px] md:h-[300px] bg-muted">
                <BaseMap
                    initialCenter={[coordinates.lng, coordinates.lat]}
                    initialZoom={15}
                    onMapLoad={handleMapLoad}
                    className="h-full w-full"
                />

                {/* "Open in Google Maps" button */}
                <button
                    onClick={handleOpenGoogleMaps}
                    className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-lg text-xs font-medium text-foreground shadow-md hover:bg-background transition-colors z-10"
                >
                    <ExternalLink className="w-3 h-3" />
                    Google Maps
                </button>
            </div>

            {/* Mobile: Show on map button */}
            <button
                onClick={handleOpenGoogleMaps}
                className="md:hidden w-full py-3 rounded-lg border border-border text-center font-medium text-foreground hover:bg-muted transition-colors"
            >
                {t('showOnMap')}
            </button>

            {/* Panorama tab content */}
            {activeTab === 'panorama' && (
                <button
                    onClick={handleOpenStreetView}
                    className="hidden md:flex w-full items-center justify-center gap-2 py-3 rounded-lg border border-border text-center font-medium text-foreground hover:bg-muted transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    {t('openStreetView') || 'Открыть Google Street View'}
                </button>
            )}

            {/* Infrastructure categories - Desktop, CIAN style */}
            {activeTab === 'infrastructure' && (
                <div className="hidden md:block">
                    <p className="text-sm text-muted-foreground mb-3">
                        Показываем объекты в 1 км от дома
                    </p>
                    <div className="space-y-2">
                        {infrastructureCategories.map((cat) => (
                            <div 
                                key={cat.key}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{cat.icon}</span>
                                    <span className="text-sm text-foreground">{cat.label}</span>
                                </div>
                                {cat.count !== null && (
                                    <span className="text-sm text-primary font-medium">
                                        {cat.count}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
