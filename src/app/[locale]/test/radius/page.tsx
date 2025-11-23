'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxConfig } from '@/lib/mapbox';
import { Sidebar } from '@/components/layout/sidebar';
import { MapRadius } from '@/components/features/search/location-filter/radius';


// Стиль карты - светлый для обеих тем
const MAP_STYLE = 'mapbox://styles/serhii11/cmi1xomdn00o801quespmffuq';

export default function RadiusTestPage() {
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

                    {/* Панель управления радиусом */}
                    {mapInstance && (
                        <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100vw-2rem)]">
                            <MapRadius map={mapInstance} />
                        </div>
                    )}

                    {/* Информационная панель */}
                    <div className="absolute bottom-4 right-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
                        <h2 className="text-lg font-bold mb-2 text-text-primary">
                            Radius Test Page
                        </h2>
                        <div className="space-y-1 text-sm text-text-secondary">
                            <p>🔍 Search for an address using the search bar</p>
                            <p>📍 Or click &quot;Pick point on map&quot; and select a location</p>
                            <p>📏 Adjust the radius with the slider (1-20 km)</p>
                            <p>⭕ A circle will be drawn around the selected point</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
