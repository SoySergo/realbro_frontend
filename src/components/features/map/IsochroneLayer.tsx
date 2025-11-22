'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useFilterStore } from '@/store/filterStore';

interface IsochroneLayerProps {
    map: mapboxgl.Map | null;
    polygon: number[][][] | null;
    color: string;
}

/**
 * Слой для отображения изохрона на карте
 */
export function IsochroneLayer({ map, polygon, color }: IsochroneLayerProps) {
    const { locationFilter } = useFilterStore();

    // Отображение изохрона
    useEffect(() => {
        if (!map || !polygon) return;

        const sourceId = 'isochrone';
        const layerId = 'isochrone-fill';
        const lineLayerId = 'isochrone-line';

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

        // Создаём GeoJSON
        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: polygon,
                    },
                },
            ],
        };

        // Добавляем source
        map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
        });

        // Добавляем fill layer
        map.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            paint: {
                'fill-color': color,
                'fill-opacity': 0.2,
            },
        });

        // Добавляем line layer
        map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': color,
                'line-width': 2,
            },
        });

        console.log('[ISOCHRONE] Layer added with color:', color);

        // Подгоняем карту к границам изохрона
        const bounds = new mapboxgl.LngLatBounds();
        polygon[0].forEach((coord) => {
            bounds.extend(coord as [number, number]);
        });
        map.fitBounds(bounds, { padding: 50 });

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
    }, [map, polygon, color]);

    // Отображение изохрона из применённого фильтра
    useEffect(() => {
        if (!map) return;
        if (locationFilter?.mode !== 'isochrone' || !locationFilter.isochrone) return;

        // Добавляем маркер центра
        const center = locationFilter.isochrone.center;
        const marker = new mapboxgl.Marker({ color: color })
            .setLngLat(center)
            .addTo(map);

        console.log('[ISOCHRONE] Center marker added');

        return () => {
            marker.remove();
        };
    }, [map, locationFilter, color]);

    return null;
}
