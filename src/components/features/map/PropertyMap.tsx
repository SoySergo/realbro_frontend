'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import env from '@/config/env';
import { useFilterStore } from '@/store/filterStore';
import { BoundariesLayer } from './BoundariesLayer';
import { DrawLayer } from './DrawLayer';
import { IsochroneLayer } from './IsochroneLayer';
import { RadiusLayer } from './RadiusLayer';
import type { DrawPolygon } from '@/types/filter';

import 'mapbox-gl/dist/mapbox-gl.css';

// Стиль карты - светлый для обеих тем (как в boundaries page)
// Тёмный монохром затемняет всё, поэтому используем светлый стиль всегда
const MAP_STYLE = 'mapbox://styles/serhii11/cmi1xomdn00o801quespmffuq';

// Настройки по умолчанию для карты
const DEFAULT_CENTER: [number, number] = [2.1734, 41.3851]; // Барселона
const DEFAULT_ZOOM = 12;

// Типы для глобального объекта карты
interface MapCallbacks {
    activateDrawing: () => void;
    onPolygonDrawn: (polygon: DrawPolygon) => void;
    deletePolygon: (polygonId: string) => void;
    selectPoint: () => void;
    showIsochrone: (polygon: number[][][], color: string) => void;
    clearIsochrone: () => void;
    showRadius: (center: [number, number], radius: number) => void;
    clearRadius: () => void;
    getSelectedPoint: () => [number, number] | null;
    getDrawnPolygon: () => DrawPolygon | null;
}

declare global {
    interface Window {
        mapCallbacks?: MapCallbacks;
    }
}

export function PropertyMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const { activeLocationMode } = useFilterStore();

    // Состояния для режимов
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnPolygon, setDrawnPolygon] = useState<DrawPolygon | null>(null);
    const [isSelectingPoint, setIsSelectingPoint] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
    const [isochronePolygon, setIsochronePolygon] = useState<number[][][] | null>(null);
    const [isochroneColor, setIsochroneColor] = useState('#28A745');
    const [radiusCenter, setRadiusCenter] = useState<[number, number] | null>(null);
    const [radiusKm, setRadiusKm] = useState(5);

    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return; // Карта уже инициализирована

        // Устанавливаем токен
        mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

        console.log('Initializing Mapbox with style:', MAP_STYLE);

        // Создаём карту - всегда светлый стиль
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLE,
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        // Добавляем контролы навигации
        // map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Отмечаем карту как загруженную и сохраняем в state
        map.current.on('load', () => {
            setMapLoaded(true);
            setMapInstance(map.current);
            console.log('Map loaded');
        });

        // Cleanup при размонтировании
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
                setMapInstance(null);
            }
        };
    }, []);

    // Обработчик клика на карту для выбора точки
    useEffect(() => {
        if (!map.current || !isSelectingPoint) return;

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setSelectedPoint(coords);
            setIsSelectingPoint(false);

            // Добавляем временный маркер
            new mapboxgl.Marker({ color: '#198BFF' })
                .setLngLat(coords)
                .addTo(map.current!);

            console.log('[MAP] Point selected:', coords);
        };

        map.current.getCanvas().style.cursor = 'crosshair';
        map.current.once('click', handleMapClick);

        return () => {
            if (map.current) {
                map.current.getCanvas().style.cursor = '';
            }
        };
    }, [isSelectingPoint]);

    // Экспортируем коллбэки в window для доступа из LocationDetailsBar
    useEffect(() => {
        window.mapCallbacks = {
            // Draw mode
            activateDrawing: () => setIsDrawing(true),
            onPolygonDrawn: (polygon: DrawPolygon) => {
                setDrawnPolygon(polygon);
                setIsDrawing(false);
            },
            deletePolygon: (polygonId: string) => {
                setDrawnPolygon(null);
                console.log('[MAP] Polygon deleted:', polygonId);
            },

            // Isochrone/Radius modes
            selectPoint: () => setIsSelectingPoint(true),
            showIsochrone: (polygon: number[][][], color: string) => {
                setIsochronePolygon(polygon);
                setIsochroneColor(color);
            },
            clearIsochrone: () => {
                setIsochronePolygon(null);
                setSelectedPoint(null);
            },
            showRadius: (center: [number, number], radius: number) => {
                setRadiusCenter(center);
                setRadiusKm(radius);
            },
            clearRadius: () => {
                setRadiusCenter(null);
                setSelectedPoint(null);
            },

            // Геттеры для получения текущего состояния
            getSelectedPoint: () => selectedPoint,
            getDrawnPolygon: () => drawnPolygon,
        };

        return () => {
            delete window.mapCallbacks;
        };
    }, [selectedPoint, drawnPolygon]);    // Обработка смены темы - стиль карты не меняется, только цвета слоев boundaries
    // (цвета обновляются в BoundariesLayer компоненте)

    return (
        <>
            <div
                ref={mapContainer}
                className="w-full h-full"
            />
            {/* Рендерим слои только когда карта загружена */}
            {mapLoaded && mapInstance && (
                <>
                    {/* BoundariesLayer для режима search */}
                    {activeLocationMode === 'search' && (
                        <BoundariesLayer map={mapInstance} />
                    )}

                    {/* DrawLayer для режима draw */}
                    {activeLocationMode === 'draw' && (
                        <DrawLayer
                            map={mapInstance}
                            onPolygonDrawn={(polygon) => {
                                setDrawnPolygon(polygon);
                                setIsDrawing(false);
                            }}
                            isDrawing={isDrawing}
                        />
                    )}

                    {/* IsochroneLayer для режима isochrone */}
                    {activeLocationMode === 'isochrone' && isochronePolygon && (
                        <IsochroneLayer
                            map={mapInstance}
                            polygon={isochronePolygon}
                            color={isochroneColor}
                        />
                    )}

                    {/* RadiusLayer для режима radius */}
                    {activeLocationMode === 'radius' && radiusCenter && (
                        <RadiusLayer
                            map={mapInstance}
                            center={radiusCenter}
                            radiusKm={radiusKm}
                        />
                    )}
                </>
            )}
        </>
    );
}
