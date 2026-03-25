'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import type { NearbyPlaces, NearbyPlace, TransportStation } from '@/shared/api';
import { PropertyAddressWithTransport } from '../property-address-transport';
import { LocationCategoryList } from './location-category-list';
import { TransportStationsDetailed } from '../property-address-transport/transport-stations';
import { HorizontalScroll } from '@/shared/ui/horizontal-scroll';

// Цвета маркеров для каждой категории
const CATEGORY_COLORS: Record<string, string> = {
    transport: '#3b82f6',
    schools: '#f59e0b',
    medical: '#ef4444',
    groceries: '#22c55e',
    shopping: '#a855f7',
    restaurants: '#f97316',
    sports: '#06b6d4',
    entertainment: '#ec4899',
    parks: '#16a34a',
    beauty: '#d946ef',
    attractions: '#eab308',
};

/** Экранирование HTML для безопасной вставки в popup */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/** Создание DOM-элемента маркера POI */
function createPoiMarkerElement(color: string): HTMLDivElement {
    const el = document.createElement('div');
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.background = color;
    el.style.border = '2.5px solid #fff';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
    el.style.cursor = 'pointer';
    return el;
}

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
    const tDetail = useTranslations('propertyDetail');

    // Ссылки на карту и POI-маркеры
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const propertyMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const poiMarkersRef = useRef<mapboxgl.Marker[]>([]);

    // Категории фильтров с переводами
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
        mapRef.current = map;

        // Получаем brand color из CSS-переменной
        const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim() || '#198bff';

        // Удаляем предыдущий маркер объекта (при смене темы handleMapLoad вызывается повторно)
        if (propertyMarkerRef.current) {
            propertyMarkerRef.current.remove();
        }

        // Маркер объекта
        propertyMarkerRef.current = new mapboxgl.Marker({ color: brandColor })
            .setLngLat([coordinates.lng, coordinates.lat])
            .addTo(map);

        // Центрируем карту
        map.flyTo({
            center: [coordinates.lng, coordinates.lat],
            zoom: 14,
            duration: 0
        });
    }, [coordinates]);

    // Получаем координаты POI для активной категории
    const getPlacesForCategory = useCallback((category: string): Array<{ lat: number; lng: number; name: string; type: string }> => {
        if (!nearbyPlaces) return [];

        if (category === 'transport') {
            return (nearbyPlaces.transport || [])
                .filter((s: TransportStation) => s.coordinates?.lat && s.coordinates?.lng)
                .map((s: TransportStation) => ({
                    lat: s.coordinates.lat,
                    lng: s.coordinates.lng,
                    name: s.name,
                    type: s.type
                }));
        }

        const categoryData = nearbyPlaces[category as keyof Omit<NearbyPlaces, 'transport'>] as NearbyPlace[] | undefined;
        if (!categoryData) return [];

        return categoryData
            .filter((p: NearbyPlace) => p.coordinates?.lat && p.coordinates?.lng)
            .map((p: NearbyPlace) => ({
                lat: p.coordinates.lat,
                lng: p.coordinates.lng,
                name: p.name,
                type: p.type
            }));
    }, [nearbyPlaces]);

    // Обновляем POI-маркеры при смене категории
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Удаляем предыдущие маркеры
        poiMarkersRef.current.forEach(m => m.remove());
        poiMarkersRef.current = [];

        const places = getPlacesForCategory(activeFilter);
        if (places.length === 0) return;

        const markerColor = CATEGORY_COLORS[activeFilter] || '#6b7280';

        // Добавляем маркеры POI
        places.forEach(place => {
            const el = createPoiMarkerElement(markerColor);

            const safeName = escapeHtml(place.name);
            const safeType = escapeHtml(place.type);
            const popup = new mapboxgl.Popup({ offset: 16, closeButton: false })
                .setHTML(`<div style="font-size:13px;font-weight:600;max-width:180px;">${safeName}</div><div style="font-size:11px;color:#666;margin-top:2px;">${safeType}</div>`);

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([place.lng, place.lat])
                .setPopup(popup)
                .addTo(map);

            poiMarkersRef.current.push(marker);
        });

        // Подгоняем карту, чтобы были видны все маркеры + объект
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([coordinates.lng, coordinates.lat]);
        places.forEach(p => bounds.extend([p.lng, p.lat]));

        map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15,
            duration: 500
        });
    }, [activeFilter, getPlacesForCategory, coordinates]);

    // Конвертация transport из nearbyPlaces или nearbyTransport в формат компонента
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

    // Конвертация NearbyPlace → LocationPOI для LocationCategoryList
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
                            className="w-full"
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
            case 'attractions': {
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
            }
            default:
                return null;
        }
    };

    return (
        <div id="property-map-section" className={cn('space-y-4 md:space-y-6', className)}>
            <h3 className="text-xl font-bold text-foreground">
                {tDetail('location')}
            </h3>

            {/* Адрес и транспорт */}
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

            {/* Карта */}
            <div className="relative -mx-4 md:mx-0 rounded-none md:rounded-2xl overflow-hidden h-[300px] md:h-[400px] bg-muted border-y md:border border-border/50 shadow-sm">
                <BaseMap
                    initialCenter={[coordinates.lng, coordinates.lat]}
                    initialZoom={14}
                    onMapLoad={handleMapLoad}
                    className="h-full w-full"
                    styleVariant="propertyDetail"
                />
            </div>
            
            {/* Контент активной категории */}
            <div className="min-h-[150px]">
                {renderContent()}
            </div>
        </div>
    );
}
