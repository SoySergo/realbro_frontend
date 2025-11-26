'use client';

import { useState, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

// Цвет круга радиуса
const RADIUS_COLOR = '#3B82F6'; // Синий

type UseRadiusStateProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Дефолтное название для выбранной точки */
    defaultPointName: string;
};

type UseRadiusStateReturn = {
    // Состояние
    selectedRadius: number;
    isSelectingPoint: boolean;
    selectedCoordinates: [number, number] | null;
    selectedName: string;
    fullAddress: string;
    marker: mapboxgl.Marker | null;

    // Сеттеры
    setSelectedRadius: (radius: number) => void;
    setIsSelectingPoint: (isSelecting: boolean) => void;
    setSelectedCoordinates: (coords: [number, number] | null) => void;
    setSelectedName: (name: string) => void;
    setFullAddress: (address: string) => void;

    // Методы
    clearRadiusFromMap: () => void;
    drawRadiusOnMap: (center: [number, number], radiusKm: number) => void;
    handleLocationSelect: (coordinates: [number, number], name: string, address?: string) => void;
    handleClear: () => void;
    handleNameChange: (newName: string) => void;
};

/**
 * Хук для управления состоянием радиуса на карте
 * Управляет координатами, радиусом, маркером и отрисовкой на карте
 */
export function useRadiusState({ map, defaultPointName }: UseRadiusStateProps): UseRadiusStateReturn {
    // Состояние UI
    const [selectedRadius, setSelectedRadius] = useState(5);
    const [isSelectingPoint, setIsSelectingPoint] = useState(false);

    // Состояние данных
    const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
    const [selectedName, setSelectedName] = useState<string>('');
    const [fullAddress, setFullAddress] = useState<string>('');

    // Маркер на карте
    const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

    // Очистка радиуса с карты
    const clearRadiusFromMap = useCallback(() => {
        try {
            if (map && map.getLayer('radius-fill')) {
                map.removeLayer('radius-fill');
            }
            if (map && map.getLayer('radius-line')) {
                map.removeLayer('radius-line');
            }
            if (map && map.getSource('radius')) {
                map.removeSource('radius');
            }
        } catch (error) {
            console.error('Error clearing radius:', error);
        }
    }, [map]);

    // Отрисовка радиуса на карте
    const drawRadiusOnMap = useCallback(
        (center: [number, number], radiusKm: number) => {
            // Удаляем предыдущий радиус
            clearRadiusFromMap();

            // Создаём круг с помощью Turf.js
            const circle = turf.circle(center, radiusKm, {
                steps: 64,
                units: 'kilometers',
            });

            // Добавляем источник данных
            map.addSource('radius', {
                type: 'geojson',
                data: circle,
            });

            // Добавляем слой заливки
            map.addLayer({
                id: 'radius-fill',
                type: 'fill',
                source: 'radius',
                paint: {
                    'fill-color': RADIUS_COLOR,
                    'fill-opacity': 0.2,
                },
            });

            // Добавляем слой границы
            map.addLayer({
                id: 'radius-line',
                type: 'line',
                source: 'radius',
                paint: {
                    'line-color': RADIUS_COLOR,
                    'line-width': 2,
                },
            });

            // Центрируем карту на круге
            const bbox = turf.bbox(circle);
            map.fitBounds(
                [
                    [bbox[0], bbox[1]],
                    [bbox[2], bbox[3]],
                ],
                { padding: 50 }
            );

            console.log('Radius drawn on map:', { center, radiusKm });
        },
        [map, clearRadiusFromMap]
    );

    // Автоматическое обновление радиуса при изменении параметров
    useEffect(() => {
        if (!selectedCoordinates) return;

        drawRadiusOnMap(selectedCoordinates, selectedRadius);
    }, [selectedRadius, selectedCoordinates, drawRadiusOnMap]);

    // Создание или обновление маркера
    const createOrUpdateMarker = useCallback(
        (coordinates: [number, number]) => {
            if (marker) {
                marker.setLngLat(coordinates);
                return marker;
            } else {
                const newMarker = new mapboxgl.Marker({
                    color: RADIUS_COLOR,
                    draggable: true,
                })
                    .setLngLat(coordinates)
                    .addTo(map);

                // Добавляем курсор pointer
                const markerElement = newMarker.getElement();
                markerElement.style.cursor = 'pointer';

                // Обработчик перетаскивания маркера
                newMarker.on('dragend', () => {
                    const lngLat = newMarker.getLngLat();
                    const newCoordinates: [number, number] = [lngLat.lng, lngLat.lat];
                    setSelectedCoordinates(newCoordinates);
                    console.log('Marker dragged to:', newCoordinates);
                });

                setMarker(newMarker);
                return newMarker;
            }
        },
        [map, marker]
    );

    // Обработчик выбора точки на карте
    useEffect(() => {
        if (!isSelectingPoint) return;

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setSelectedCoordinates(coordinates);
            setSelectedName(defaultPointName);
            setFullAddress('');
            setIsSelectingPoint(false);

            createOrUpdateMarker(coordinates);

            console.log('Point selected on map:', coordinates);
        };

        // Меняем курсор
        map.getCanvas().style.cursor = 'crosshair';

        // Добавляем обработчик
        map.on('click', handleMapClick);

        // Cleanup
        return () => {
            map.off('click', handleMapClick);
            map.getCanvas().style.cursor = '';
        };
    }, [isSelectingPoint, map, defaultPointName, createOrUpdateMarker]);

    // Обработчик выбора локации через поиск
    const handleLocationSelect = useCallback(
        (coordinates: [number, number], name: string, address?: string) => {
            setSelectedCoordinates(coordinates);
            setSelectedName(name);
            setFullAddress(address || '');

            createOrUpdateMarker(coordinates);

            // Центрируем карту
            map.flyTo({ center: coordinates, zoom: 12 });

            console.log('Location selected from search:', { coordinates, name, address });
        },
        [map, createOrUpdateMarker]
    );

    // Обработчик очистки
    const handleClear = useCallback(() => {
        setSelectedCoordinates(null);
        setSelectedName('');
        setFullAddress('');
        clearRadiusFromMap();

        // Удаляем маркер
        if (marker) {
            marker.remove();
            setMarker(null);
        }

        console.log('Radius cleared');
    }, [marker, clearRadiusFromMap]);

    // Обработчик изменения названия
    const handleNameChange = useCallback((newName: string) => {
        setSelectedName(newName);
        console.log('Name changed:', newName);
    }, []);

    // Cleanup при размонтировании
    useEffect(() => {
        return () => {
            try {
                if (map && map.getLayer('radius-fill')) {
                    map.removeLayer('radius-fill');
                }
                if (map && map.getLayer('radius-line')) {
                    map.removeLayer('radius-line');
                }
                if (map && map.getSource('radius')) {
                    map.removeSource('radius');
                }
            } catch (error) {
                console.error('Error cleaning up radius:', error);
            }

            if (marker) {
                try {
                    marker.remove();
                } catch (error) {
                    console.error('Error removing marker:', error);
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        // Состояние
        selectedRadius,
        isSelectingPoint,
        selectedCoordinates,
        selectedName,
        fullAddress,
        marker,

        // Сеттеры
        setSelectedRadius,
        setIsSelectingPoint,
        setSelectedCoordinates,
        setSelectedName,
        setFullAddress,

        // Методы
        clearRadiusFromMap,
        drawRadiusOnMap,
        handleLocationSelect,
        handleClear,
        handleNameChange,
    };
}
