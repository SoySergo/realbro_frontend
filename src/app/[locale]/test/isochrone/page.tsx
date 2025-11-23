'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxConfig } from '@/lib/mapbox';
import { Sidebar } from '@/components/layout/sidebar';
import { MapIsochrone } from '@/components/features/search/location-filter/isochrone/MapIsochrone';

// Стиль карты - светлый для обеих тем
const MAP_STYLE = 'mapbox://styles/serhii11/cmi1xomdn00o801quespmffuq';

export default function IsochroneTestPage() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = mapboxConfig.accessToken;

        // Инициализация карты
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: [2.1734, 41.3851], // Барселона
            zoom: 11,
        });

        map.current.on('load', () => {
            console.log('Map loaded successfully');
            if (map.current) {
                setMapInstance(map.current);
            }
        });

        map.current.on('error', (e) => {
            console.error('Map error:', e);
        });

        // Cleanup
        return () => {
            map.current?.remove();
            map.current = null;
            setMapInstance(null);
        };
    }, []);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar (Desktop + Mobile) */}
            <Sidebar />

            {/* Основной контент с картой */}
            <main className="flex-1 md:ml-16 pb-16 md:pb-0">
                {/* Отступ сверху для мобильного верхнего меню */}
                <div className="h-20 md:hidden" />

                {/* Контейнер карты */}
                <div className="relative h-[calc(100vh-5rem)] md:h-screen w-full">
                    {/* Карта */}
                    <div className="absolute inset-0 z-0">
                        <div ref={mapContainer} className="h-full w-full" />
                    </div>

                    {/* Панель управления изохронами */}
                    {mapInstance && (
                        <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100vw-2rem)]">
                            <MapIsochrone map={mapInstance} />
                        </div>
                    )}


                </div>
            </main>
        </div>
    );
}
