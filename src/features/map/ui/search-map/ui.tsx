'use client';

import { useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { BaseMap } from '../base-map';
import { MapLocationController } from '@/features/location-filter';
import { MobileLocationMode } from '@/widgets/mobile-location-mode';
import { useFilterStore } from '@/widgets/search-filters-bar';

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
        <>
            {/* Мобильный режим локации - заменяет верхний сайдбар */}
            {mapInstance && activeLocationMode && (
                <MobileLocationMode map={mapInstance} />
            )}

            <BaseMap
                initialCenter={initialCenter}
                initialZoom={initialZoom}
                onMapLoad={handleMapLoad}
            >
                {/* Контроллер режимов фильтра локации (только desktop) */}
                {mapInstance && activeLocationMode && (
                    <div className="hidden md:block">
                        <MapLocationController map={mapInstance} />
                    </div>
                )}

                {/* TODO: Когда нет активного режима - показывать маркеры недвижимости */}
                {/* {mapInstance && !activeLocationMode && (
                    <PropertyMarkers map={mapInstance} />
                )} */}
            </BaseMap>
        </>
    );
}
