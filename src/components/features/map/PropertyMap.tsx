'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useTheme } from 'next-themes';
import env from '@/config/env';

import 'mapbox-gl/dist/mapbox-gl.css';

// Стили для разных тем
const MAP_STYLES = {
    dark: 'mapbox://styles/serhii11/cmhuzvqzm005k01r4bq9m8lnu',
    light: 'mapbox://styles/serhii11/cmhuvoz2c001o01sfgppw7m5n',
} as const;

// Настройки по умолчанию для карты
const DEFAULT_CENTER: [number, number] = [2.1734, 41.3851]; // Барселона
const DEFAULT_ZOOM = 12;

export function PropertyMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const { theme, resolvedTheme } = useTheme();

    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return; // Карта уже инициализирована

        // Устанавливаем токен
        mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

        // Определяем текущую тему
        const currentTheme = resolvedTheme || theme || 'light';
        const mapStyle = currentTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light;

        console.log('Initializing Mapbox with style:', mapStyle);

        // Создаём карту
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapStyle,
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        // Добавляем контролы навигации
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Cleanup при размонтировании
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Обработка смены темы
    useEffect(() => {
        if (!map.current) return;

        const currentTheme = resolvedTheme || theme || 'light';
        const mapStyle = currentTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light;

        console.log('Switching map style to:', mapStyle);

        map.current.setStyle(mapStyle);
    }, [theme, resolvedTheme]);

    return (
        <div
            ref={mapContainer}
            className="w-full h-full"
        />
    );
}
