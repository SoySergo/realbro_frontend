'use client';

import { useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { BaseMap } from './BaseMap';
import { MapLocationController } from './MapLocationController';
import { useFilterStore } from '@/store/filterStore';

type SearchMapProps = {
    /** Начальный центр карты [lng, lat] */
    initialCenter?: [number, number];
    /** Начальный зум */
    initialZoom?: number;
};

/**
 * Компонент карты для страницы поиска недвижимости
 * Управляет отображением режимов фильтра локации и маркерами недвижимости
 * 
 * Логика:
 * - Если активен режим фильтра локации (search/draw/isochrone/radius) - показывает панель управления
 * - Если режим НЕ активен - показывает маркеры недвижимости на карте
 */
export function SearchMap({ initialCenter, initialZoom }: SearchMapProps) {
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const { activeLocationMode } = useFilterStore();

    // Колбэк при загрузке карты
    const handleMapLoad = useCallback((map: mapboxgl.Map) => {
        setMapInstance(map);
        console.log('[SearchMap] Map instance ready');

        // TODO: Здесь можно добавить инициализацию слоёв для недвижимости
        // Например, добавить source и layer для маркеров
    }, []);

    // TODO: Загрузка и отображение маркеров недвижимости
    // useEffect(() => {
    //     if (!mapInstance || activeLocationMode) return;
    //     
    //     // Загружаем и отображаем недвижимость только если нет активного режима локации
    //     // loadProperties(mapInstance);
    // }, [mapInstance, activeLocationMode]);

    return (
        <BaseMap
            initialCenter={initialCenter}
            initialZoom={initialZoom}
            onMapLoad={handleMapLoad}
        >
            {/* Контроллер режимов фильтра локации */}
            {mapInstance && activeLocationMode && (
                <MapLocationController map={mapInstance} />
            )}

            {/* TODO: Когда нет активного режима - показывать маркеры недвижимости */}
            {/* {mapInstance && !activeLocationMode && (
                <PropertyMarkers map={mapInstance} />
            )} */}
        </BaseMap>
    );
}
