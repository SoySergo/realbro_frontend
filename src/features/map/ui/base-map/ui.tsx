'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxConfig } from '@/shared/lib/mapbox';
import { useTheme } from 'next-themes';

// Стили карты
const MAP_STYLE_LIGHT = 'mapbox://styles/serhii11/cmi1xomdn00o801quespmffuq';
const MAP_STYLE_DARK = 'mapbox://styles/serhii11/cmi1yrucv00oa01qu6ciub5td';
// const MAP_STYLE_DARK = 'mapbox://styles/serhii11/cmmlub367000a01r4av0u00ld';


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
    /** Показать лоадер поверх карты (по умолчанию true) */
    showLoader?: boolean;
};

/**
 * Компонент оверлея загрузки карты
 */
function MapLoadingOverlay() {
    return (
        <div className="absolute inset-0 bg-background-secondary/80 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity duration-300">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    {/* Анимированная иконка карты */}
                    <svg
                        className="w-16 h-16 text-text-tertiary animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                    </svg>
                    {/* Спиннер */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
                <p className="text-sm text-text-secondary">Загрузка карты...</p>
            </div>
        </div>
    );
}

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
    showLoader = true,
}: BaseMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const { resolvedTheme } = useTheme();

    const getMapStyle = () => resolvedTheme === 'dark' ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;

    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = mapboxConfig.accessToken;

        // Создаём инстанс карты
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: getMapStyle(),
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
            // Логируем только ошибки с информативным сообщением
            const errorMessage = e.error?.message;
            if (errorMessage) {
                console.error('[BaseMap] Map error:', errorMessage, e);
            }
        });

        const handleResize = () => {
            if (map.current) {
                map.current.resize();
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(mapContainer.current);

        // Cleanup при размонтировании
        return () => {
            resizeObserver.disconnect();
            if (map.current) {
                console.log('[BaseMap] Removing map instance');
                map.current.remove();
                map.current = null;
                setIsMapReady(false);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Сохраняем onMapLoad в ref для доступа при смене темы
    const onMapLoadRef = useRef(onMapLoad);
    onMapLoadRef.current = onMapLoad;

    // Реакция на смену темы — меняем стиль карты
    useEffect(() => {
        if (!map.current || !isMapReady) return;

        const newStyle = getMapStyle();

        if (resolvedTheme) {
            const mapRef = map.current;

            // После setStyle все кастомные sources/layers удаляются
            // Ждём style.load и перевызываем onMapLoad для реинициализации слоёв
            mapRef.once('style.load', () => {
                console.log('[BaseMap] Style changed to', resolvedTheme);
                onMapLoadRef.current?.(mapRef);
            });

            mapRef.setStyle(newStyle);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedTheme]);

    return (
        <div className="relative h-full w-full">
            {/* Контейнер карты */}
            <div ref={mapContainer} className={className} />

            {/* Лоадер поверх карты во время загрузки */}
            {showLoader && !isMapReady && <MapLoadingOverlay />}

            {/* Дочерние элементы (панели управления и т.д.) */}
            {isMapReady && children}
        </div>
    );
}

