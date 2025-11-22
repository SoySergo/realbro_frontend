'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxConfig } from '@/lib/mapbox';
import { useTheme } from 'next-themes';
import { Sidebar } from '@/components/layout/sidebar';

// Стиль карты - светлый для обеих тем (тёмный монохром затемняет всё)
const MAP_STYLE = 'mapbox://styles/serhii11/cmi1xomdn00o801quespmffuq';

// Цвета слоёв для разных тем
const LAYER_COLORS = {
    light: {
        fillDefault: '#9ca3af',      // gray-400
        fillHover: '#3b82f6',        // blue-500
        fillOpacityDefault: 0.2,
        fillOpacityHover: 0.5,
        lineDefault: '#60a5fa',      // blue-400
        lineHover: '#3b82f6',        // blue-500
        lineWidthDefault: 1,
        lineWidthHover: 2.5,
        lineOpacityDefault: 1,
        lineOpacityHover: 1,
        textColor: '#1e293b',        // slate-800
        textHalo: '#ffffff',         // white
        textOpacity: 1,
    },
    dark: {
        fillDefault: '#1A1A1A',  // brand-primary с минимальной прозрачностью
        fillHover: '#198BFF',        // brand-primary - фирменный цвет проекта
        fillOpacityDefault: 0.9,
        fillOpacityHover: 0.95,
        lineDefault: '#3DA1FF',      // brand-primary-hover - светлее для видимости
        lineHover: '#198BFF',        // brand-primary при ховере
        lineWidthDefault: 1.5,
        lineWidthHover: 2.5,
        lineOpacityDefault: 0.8,
        lineOpacityHover: 1,
        textColor: '#F8F9FA',        // text-primary для тёмной темы
        textHalo: '#0F0F0F',         // background для тёмной темы
        textOpacity: 0.9,
    },
} as const;

export default function BoundariesTestPage() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [status, setStatus] = useState<string>('Initializing...');
    const [zoom, setZoom] = useState<number>(10);
    const { theme, resolvedTheme } = useTheme();

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = mapboxConfig.accessToken;

        // Определяем текущую тему
        const currentTheme = resolvedTheme || theme || 'light';

        // Инициализация карты - всегда светлый стиль
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: [2.1734, 41.3851], // Барселона
            zoom: 10,
        });

        map.current.on('load', () => {
            setStatus('Map loaded. Adding boundaries layer...');

            if (!map.current) return;

            // Определяем цвета для текущей темы
            const colors = currentTheme === 'dark' ? LAYER_COLORS.dark : LAYER_COLORS.light;

            // Добавляем источник данных с вашими тайлами
            map.current.addSource('boundaries', {
                type: 'vector',
                tiles: ['http://localhost:8080/api/v1/boundaries/tiles/{z}/{x}/{y}.pbf'],
                minzoom: 0,
                maxzoom: 18,
                promoteId: 'osm_id', // Используем osm_id как уникальный идентификатор
            });

            // Добавляем слой для отрисовки полигонов (заливка)
            map.current.addLayer({
                id: 'boundaries-fill',
                type: 'fill',
                source: 'boundaries',
                'source-layer': 'boundaries',
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.fillHover,
                        colors.fillDefault
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.fillOpacityHover,
                        colors.fillOpacityDefault
                    ],
                },
            });

            // Добавляем слой для отрисовки границ полигонов
            map.current.addLayer({
                id: 'boundaries-outline',
                type: 'line',
                source: 'boundaries',
                'source-layer': 'boundaries',
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineHover,
                        colors.lineDefault
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineWidthHover,
                        colors.lineWidthDefault
                    ],
                    'line-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineOpacityHover,
                        colors.lineOpacityDefault
                    ],
                },
            });

            // Добавляем слой для отображения названий
            map.current.addLayer({
                id: 'boundaries-labels',
                type: 'symbol',
                source: 'boundaries',
                'source-layer': 'boundaries',
                layout: {
                    'text-field': ['get', 'name'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                    'text-anchor': 'center',
                    'text-max-width': 8,
                    'symbol-placement': 'point',
                    // Ключевые настройки для дедупликации
                    'symbol-sort-key': ['get', 'osm_id'], // Сортировка по уникальному ID
                    'text-allow-overlap': false, // Запрещаем перекрытие
                    'text-ignore-placement': false, // Учитываем другие символы
                    'symbol-z-order': 'auto',
                },
                paint: {
                    'text-color': colors.textColor,
                    'text-halo-color': colors.textHalo,
                    'text-halo-width': 1.5,
                    'text-opacity': colors.textOpacity,
                },
            });

            setStatus('Boundaries layer added successfully!');

            // Переменная для отслеживания текущего hover состояния
            let hoveredFeatureId: string | number | null = null;

            // Добавляем интерактивность
            map.current.on('click', 'boundaries-fill', (e) => {
                if (e.features && e.features.length > 0) {
                    const feature = e.features[0];
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(
                            `<div style="padding: 8px;">
                                <h3 style="font-weight: bold; margin-bottom: 4px;">Boundary Properties:</h3>
                                <pre style="font-size: 12px;">${JSON.stringify(feature.properties, null, 2)}</pre>
                            </div>`
                        )
                        .addTo(map.current!);
                }
            });

            // Меняем курсор и состояние при наведении
            map.current.on('mousemove', 'boundaries-fill', (e) => {
                if (!map.current) return;

                map.current.getCanvas().style.cursor = 'pointer';

                if (e.features && e.features.length > 0) {
                    const feature = e.features[0];

                    // Проверяем наличие ID
                    if (feature.id === undefined) {
                        console.warn('Feature has no ID:', feature.properties);
                        return;
                    }

                    // Убираем hover с предыдущего полигона
                    if (hoveredFeatureId !== null && hoveredFeatureId !== feature.id) {
                        try {
                            map.current.setFeatureState(
                                { source: 'boundaries', sourceLayer: 'boundaries', id: hoveredFeatureId },
                                { hover: false }
                            );
                        } catch (error) {
                            console.warn('Error removing hover state:', error);
                        }
                    }

                    // Устанавливаем hover для текущего полигона
                    try {
                        hoveredFeatureId = feature.id as string | number;
                        map.current.setFeatureState(
                            { source: 'boundaries', sourceLayer: 'boundaries', id: hoveredFeatureId },
                            { hover: true }
                        );
                    } catch (error) {
                        console.warn('Error setting hover state:', error);
                    }
                }
            });

            map.current.on('mouseleave', 'boundaries-fill', () => {
                if (!map.current) return;

                map.current.getCanvas().style.cursor = '';

                // Убираем hover при уходе с полигона
                if (hoveredFeatureId !== null) {
                    try {
                        map.current.setFeatureState(
                            { source: 'boundaries', sourceLayer: 'boundaries', id: hoveredFeatureId },
                            { hover: false }
                        );
                    } catch (error) {
                        console.warn('Error clearing hover state:', error);
                    }
                    hoveredFeatureId = null;
                }
            });
        });

        // Обновляем зум при изменении
        map.current.on('zoom', () => {
            if (map.current) {
                setZoom(Math.round(map.current.getZoom() * 100) / 100);
            }
        });

        map.current.on('error', (e) => {
            setStatus(`Error: ${e.error.message}`);
            console.error('Map error:', e);
        });

        // Cleanup
        return () => {
            map.current?.remove();
            map.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Обработка смены темы - обновляем только цвета полигонов, стиль карты не меняется
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        const currentTheme = resolvedTheme || theme || 'light';
        const colors = currentTheme === 'dark' ? LAYER_COLORS.dark : LAYER_COLORS.light;

        console.log('Updating layer colors for theme:', currentTheme);

        // Проверяем, существуют ли слои
        if (map.current.getLayer('boundaries-fill')) {
            // Обновляем цвета для слоя заливки
            map.current.setPaintProperty('boundaries-fill', 'fill-color', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                colors.fillHover,
                colors.fillDefault
            ]);
            map.current.setPaintProperty('boundaries-fill', 'fill-opacity', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                colors.fillOpacityHover,
                colors.fillOpacityDefault
            ]);

            // Обновляем цвета для слоя границ
            map.current.setPaintProperty('boundaries-outline', 'line-color', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                colors.lineHover,
                colors.lineDefault
            ]);
            map.current.setPaintProperty('boundaries-outline', 'line-width', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                colors.lineWidthHover,
                colors.lineWidthDefault
            ]);
            map.current.setPaintProperty('boundaries-outline', 'line-opacity', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                colors.lineOpacityHover,
                colors.lineOpacityDefault
            ]);

            // Обновляем цвета для текста
            map.current.setPaintProperty('boundaries-labels', 'text-color', colors.textColor);
            map.current.setPaintProperty('boundaries-labels', 'text-halo-color', colors.textHalo);
            map.current.setPaintProperty('boundaries-labels', 'text-opacity', colors.textOpacity);
        }
    }, [theme, resolvedTheme]);

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
                    {/* Статус панель */}
                    <div className="absolute top-4 left-4 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md">
                        <h1 className="text-xl font-bold mb-2 dark:text-white">Boundaries Test Page</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <strong>Backend:</strong> http://localhost:8080
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <strong>Endpoint:</strong> /api/v1/boundaries/tiles/{'{z}/{x}/{y}'}.pbf
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <strong>Layer:</strong> boundaries
                        </p>
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{status}</p>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            💡 Click on polygons to see their properties
                        </div>
                    </div>

                    {/* Индикатор зума */}
                    <div className="absolute top-4 right-4 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
                        <p className="text-sm font-mono font-semibold dark:text-white">
                            Zoom: <span className="text-blue-600 dark:text-blue-400">{zoom.toFixed(2)}</span>
                        </p>
                    </div>

                    {/* Карта на всю высоту */}
                    <div className="absolute z-10 inset-0">
                        <div ref={mapContainer} className="h-full w-full" />
                    </div>
                </div>
            </main>
        </div>
    );
}
