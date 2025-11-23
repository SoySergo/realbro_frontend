'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxConfig } from '@/lib/mapbox';

// Стиль карты - светлый для обеих тем
const MAP_STYLE = 'mapbox://styles/serhii11/cmi1xomdn00o801quespmffuq';

type BaseMapProps = {
    /** Начальный центр карты [lng, lat] */
    initialCenter?: [number, number];
    /** Начальный зум */
    initialZoom?: number;
    /** Колбэк при инициализации карты */
    onMapLoad?: (map: mapboxgl.Map) => void;
    /** CSS классы для контейнера */
    className?: string;
    /** Дочерние элементы (например, панели управления поверх карты) */
    children?: React.ReactNode;
};

/**
 * Базовый компонент карты Mapbox
 * Инициализирует карту и передаёт инстанс через колбэк
 * Дочерние элементы рендерятся поверх карты
 */
export function BaseMap({
    initialCenter = [2.1734, 41.3851], // Барселона по умолчанию
    initialZoom = 11,
    onMapLoad,
    className = 'h-full w-full',
    children,
}: BaseMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = mapboxConfig.accessToken;

        // Создаём инстанс карты
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: initialCenter,
            zoom: initialZoom,
        });

        // Обработчики событий
        map.current.on('load', () => {
            console.log('[BaseMap] Map loaded successfully');
            setIsMapReady(true);
            if (map.current) {
                onMapLoad?.(map.current);
            }
        });

        map.current.on('error', (e) => {
            console.error('[BaseMap] Map error:', e);
        });

        // Cleanup при размонтировании
        return () => {
            if (map.current) {
                console.log('[BaseMap] Removing map instance');
                map.current.remove();
                map.current = null;
                setIsMapReady(false);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative h-full w-full">
            {/* Контейнер карты */}
            <div ref={mapContainer} className={className} />

            {/* Дочерние элементы (панели управления и т.д.) */}
            {isMapReady && children}
        </div>
    );
}
