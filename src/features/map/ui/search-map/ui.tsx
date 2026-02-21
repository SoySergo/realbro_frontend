'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { BaseMap } from '../base-map';
import { MapLocationController } from '@/features/location-filter';
import { MobileLocationMode } from '@/widgets/mobile-location-mode';
import { useFilterStore, useCurrentFilters } from '@/widgets/search-filters-bar';
import { filtersToQueryString } from '@/entities/filter';

// URL бекенда для MVT тайлов
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const TILES_URL = `${API_BASE_URL}/api/v1/properties/tiles/{z}/{x}/{y}.pbf`;

// Имя source и layer для тайлов
const PROPERTIES_SOURCE = 'properties';
const PROPERTIES_LAYER_CLUSTERS = 'properties-clusters';
const PROPERTIES_LAYER_CLUSTER_COUNT = 'properties-cluster-count';
const PROPERTIES_LAYER_POINTS = 'properties-points';

type SearchMapProps = {
    /** Начальный центр карты [lng, lat] */
    initialCenter?: [number, number];
    /** Начальный зум */
    initialZoom?: number;
    /** Колбэк при клике на кластер — передаёт property_ids */
    onClusterClick?: (propertyIds: string[]) => void;
    /** Колбэк при клике на индивидуальный маркер */
    onMarkerClick?: (propertyId: string) => void;
};

/**
 * Формирует URL тайла с фильтрами
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTileUrl(filters: any): string {
    const queryString = filtersToQueryString(filters as Parameters<typeof filtersToQueryString>[0]);
    return queryString ? `${TILES_URL}?${queryString}` : TILES_URL;
}

/**
 * Компонент карты для страницы поиска недвижимости
 * Управляет отображением режимов фильтра локации и маркерами недвижимости
 * 
 * Логика:
 * - Если активен режим фильтра локации (search/draw/isochrone/radius) - показывает панель управления
 * - Если режим НЕ активен - показывает маркеры недвижимости на карте (MVT тайлы)
 */
export function SearchMap({ initialCenter, initialZoom, onClusterClick, onMarkerClick }: SearchMapProps) {
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const { activeLocationMode } = useFilterStore();
    const currentFilters = useCurrentFilters();
    const layersInitializedRef = useRef(false);
    const currentFiltersRef = useRef(currentFilters);
    currentFiltersRef.current = currentFilters;

    /**
     * Инициализация MVT source и layers на карте
     */
    const initializePropertyLayers = useCallback((map: mapboxgl.Map) => {
        if (layersInitializedRef.current) return;

        const tileUrl = buildTileUrl(currentFiltersRef.current);

        // Добавляем vector tile source
        map.addSource(PROPERTIES_SOURCE, {
            type: 'vector',
            tiles: [tileUrl],
            minzoom: 0,
            maxzoom: 22,
        });

        // Слой кластеров (z ≤ 15)
        map.addLayer({
            id: PROPERTIES_LAYER_CLUSTERS,
            type: 'circle',
            source: PROPERTIES_SOURCE,
            'source-layer': PROPERTIES_SOURCE,
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6',   // < 10
                    10, '#f1f075', // 10-50
                    50, '#f28cb1', // > 50
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,           // < 10
                    10, 30,       // 10-50
                    50, 40,       // > 50
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
            },
        });

        // Слой чисел на кластерах
        map.addLayer({
            id: PROPERTIES_LAYER_CLUSTER_COUNT,
            type: 'symbol',
            source: PROPERTIES_SOURCE,
            'source-layer': PROPERTIES_SOURCE,
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
            },
        });

        // Слой индивидуальных точек (z > 15)
        map.addLayer({
            id: PROPERTIES_LAYER_POINTS,
            type: 'circle',
            source: PROPERTIES_SOURCE,
            'source-layer': PROPERTIES_SOURCE,
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#007cbf',
                'circle-radius': 8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
            },
        });

        layersInitializedRef.current = true;
        console.log('[SearchMap] MVT tile layers initialized');
    }, []);

    // Колбэк при загрузке карты
    const handleMapLoad = useCallback((map: mapboxgl.Map) => {
        setMapInstance(map);
        console.log('[SearchMap] Map instance ready');

        // Инициализируем слои MVT тайлов
        initializePropertyLayers(map);
    }, [initializePropertyLayers]);

    // Обновляем URL тайлов при изменении фильтров
    useEffect(() => {
        if (!mapInstance || !layersInitializedRef.current) return;

        const source = mapInstance.getSource(PROPERTIES_SOURCE);
        if (source && 'setTiles' in source) {
            const tileUrl = buildTileUrl(currentFilters);
            (source as mapboxgl.VectorTileSource).setTiles([tileUrl]);
            console.log('[SearchMap] Tile source updated with new filters');
        }
    }, [mapInstance, currentFilters]);

    // Обработчики кликов по кластерам и маркерам
    useEffect(() => {
        if (!mapInstance || !layersInitializedRef.current) return;

        // Клик по кластеру
        const handleClusterClickEvent = (e: mapboxgl.MapMouseEvent) => {
            const features = mapInstance.queryRenderedFeatures(e.point, {
                layers: [PROPERTIES_LAYER_CLUSTERS],
            });

            if (features.length === 0) return;

            const feature = features[0];
            const properties = feature.properties;

            if (properties?.property_ids) {
                // Малые кластеры — property_ids в feature properties
                try {
                    const propertyIds = typeof properties.property_ids === 'string'
                        ? JSON.parse(properties.property_ids)
                        : properties.property_ids;
                    if (Array.isArray(propertyIds)) {
                        onClusterClick?.(propertyIds as string[]);
                    }
                } catch {
                    console.error('[SearchMap] Failed to parse property_ids from cluster feature');
                }
            } else if (properties?.cluster_id) {
                // Большие кластеры — зуммируем к кластеру
                const geometry = feature.geometry;
                if (geometry.type === 'Point') {
                    mapInstance.easeTo({
                        center: geometry.coordinates as [number, number],
                        zoom: (mapInstance.getZoom() || 0) + 2,
                    });
                }
            }
        };

        // Клик по индивидуальному маркеру
        const handlePointClickEvent = (e: mapboxgl.MapMouseEvent) => {
            const features = mapInstance.queryRenderedFeatures(e.point, {
                layers: [PROPERTIES_LAYER_POINTS],
            });

            if (features.length === 0) return;

            const feature = features[0];
            const propertyId = feature.properties?.id;

            if (propertyId) {
                onMarkerClick?.(String(propertyId));
            }
        };

        // Курсор pointer при наведении
        const handleMouseEnter = () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
        };
        const handleMouseLeave = () => {
            mapInstance.getCanvas().style.cursor = '';
        };

        mapInstance.on('click', PROPERTIES_LAYER_CLUSTERS, handleClusterClickEvent);
        mapInstance.on('click', PROPERTIES_LAYER_POINTS, handlePointClickEvent);
        mapInstance.on('mouseenter', PROPERTIES_LAYER_CLUSTERS, handleMouseEnter);
        mapInstance.on('mouseleave', PROPERTIES_LAYER_CLUSTERS, handleMouseLeave);
        mapInstance.on('mouseenter', PROPERTIES_LAYER_POINTS, handleMouseEnter);
        mapInstance.on('mouseleave', PROPERTIES_LAYER_POINTS, handleMouseLeave);

        return () => {
            mapInstance.off('click', PROPERTIES_LAYER_CLUSTERS, handleClusterClickEvent);
            mapInstance.off('click', PROPERTIES_LAYER_POINTS, handlePointClickEvent);
            mapInstance.off('mouseenter', PROPERTIES_LAYER_CLUSTERS, handleMouseEnter);
            mapInstance.off('mouseleave', PROPERTIES_LAYER_CLUSTERS, handleMouseLeave);
            mapInstance.off('mouseenter', PROPERTIES_LAYER_POINTS, handleMouseEnter);
            mapInstance.off('mouseleave', PROPERTIES_LAYER_POINTS, handleMouseLeave);
        };
    }, [mapInstance, onClusterClick, onMarkerClick]);

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
            </BaseMap>
        </>
    );
}
