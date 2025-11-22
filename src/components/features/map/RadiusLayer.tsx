'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { useFilterStore } from '@/store/filterStore';

interface RadiusLayerProps {
    map: mapboxgl.Map | null;
    center: [number, number] | null;
    radiusKm: number;
}

/**
 * Слой для отображения круга радиуса на карте
 * Использует Turf.js для построения круга
 */
export function RadiusLayer({ map, center, radiusKm }: RadiusLayerProps) {
    const { locationFilter } = useFilterStore();

    // Отображение круга
    useEffect(() => {
        if (!map || !center) return;

        const sourceId = 'radius-circle';
        const layerId = 'radius-fill';
        const lineLayerId = 'radius-line';

        // Удаляем существующие слои если есть
        if (map.getLayer(lineLayerId)) {
            map.removeLayer(lineLayerId);
        }
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
        }

        // Создаём круг через Turf.js
        const centerPoint = turf.point(center);
        const circle = turf.circle(centerPoint, radiusKm, {
            steps: 64,
            units: 'kilometers',
        });

        // Добавляем source
        map.addSource(sourceId, {
            type: 'geojson',
            data: circle,
        });

        // Добавляем fill layer
        map.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            paint: {
                'fill-color': '#198BFF',
                'fill-opacity': 0.2,
            },
        });

        // Добавляем line layer
        map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': '#198BFF',
                'line-width': 2,
            },
        });

        console.log('[RADIUS] Circle added:', radiusKm, 'km');

        // Подгоняем карту к границам круга
        const bbox = turf.bbox(circle);
        map.fitBounds(bbox as [number, number, number, number], { padding: 50 });

        return () => {
            if (map.getLayer(lineLayerId)) {
                map.removeLayer(lineLayerId);
            }
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
            }
            if (map.getSource(sourceId)) {
                map.removeSource(sourceId);
            }
        };
    }, [map, center, radiusKm]);

    // Отображение маркера центра из применённого фильтра
    useEffect(() => {
        if (!map || !center) return;

        const marker = new mapboxgl.Marker({ color: '#198BFF' })
            .setLngLat(center)
            .addTo(map);

        console.log('[RADIUS] Center marker added');

        return () => {
            marker.remove();
        };
    }, [map, center]);

    // Отображение радиуса из применённого фильтра
    useEffect(() => {
        if (!map) return;
        if (locationFilter?.mode !== 'radius' || !locationFilter.radius) return;

        // Центруем карту на точке
        map.flyTo({
            center: locationFilter.radius.center,
            zoom: 12,
        });

        console.log('[RADIUS] Map centered on filter radius');
    }, [map, locationFilter]);

    return null;
}
