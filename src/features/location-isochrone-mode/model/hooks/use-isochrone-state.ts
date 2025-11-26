/**
 * Хук для управления состоянием изохрона
 * Инкапсулирует логику работы с изохронами на карте
 */

import { useState, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { IsochroneProfile } from '@/shared/api';
import { getIsochrone, getProfileColor } from '@/shared/api';

export interface UseIsochroneStateParams {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
}

export interface UseIsochroneStateReturn {
    // UI состояние
    selectedProfile: IsochroneProfile;
    setSelectedProfile: (profile: IsochroneProfile) => void;
    selectedMinutes: number;
    setSelectedMinutes: (minutes: number) => void;
    isSelectingPoint: boolean;
    setIsSelectingPoint: (value: boolean) => void;
    isLoading: boolean;

    // Данные состояния
    selectedCoordinates: [number, number] | null;
    setSelectedCoordinates: (coords: [number, number] | null) => void;
    selectedName: string;
    setSelectedName: (name: string) => void;
    fullAddress: string;
    setFullAddress: (address: string) => void;
    isochroneData: number[][][] | null;

    // Маркер
    marker: mapboxgl.Marker | null;

    // Методы
    handleLocationSelect: (coordinates: [number, number], name: string, address?: string) => void;
    handleClear: () => void;
    handleNameChange: (newName: string) => void;
}

/**
 * Хук для управления состоянием изохрона
 */
export function useIsochroneState({ map }: UseIsochroneStateParams): UseIsochroneStateReturn {
    // Состояние UI
    const [selectedProfile, setSelectedProfile] = useState<IsochroneProfile>('walking');
    const [selectedMinutes, setSelectedMinutes] = useState(15);
    const [isSelectingPoint, setIsSelectingPoint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Состояние данных
    const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
    const [selectedName, setSelectedName] = useState<string>('');
    const [fullAddress, setFullAddress] = useState<string>('');
    const [isochroneData, setIsochroneData] = useState<number[][][] | null>(null);

    // Маркер на карте
    const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

    // Очистка изохрона с карты
    const clearIsochroneFromMap = useCallback(() => {
        try {
            if (map && map.getLayer('isochrone-fill')) {
                map.removeLayer('isochrone-fill');
            }
            if (map && map.getLayer('isochrone-line')) {
                map.removeLayer('isochrone-line');
            }
            if (map && map.getSource('isochrone')) {
                map.removeSource('isochrone');
            }
        } catch (error) {
            console.error('Error clearing isochrone:', error);
        }
    }, [map]);

    // Отрисовка изохрона на карте
    const drawIsochroneOnMap = useCallback(
        (polygon: number[][][], color: string) => {
            // Удаляем предыдущий изохрон
            clearIsochroneFromMap();

            // Добавляем источник данных
            map.addSource('isochrone', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: polygon,
                    },
                },
            });

            // Добавляем слой заливки
            map.addLayer({
                id: 'isochrone-fill',
                type: 'fill',
                source: 'isochrone',
                paint: {
                    'fill-color': color,
                    'fill-opacity': 0.3,
                },
            });

            // Добавляем слой границы
            map.addLayer({
                id: 'isochrone-line',
                type: 'line',
                source: 'isochrone',
                paint: {
                    'line-color': color,
                    'line-width': 2,
                },
            });

            // Центрируем карту на изохроне
            const bounds = new mapboxgl.LngLatBounds();
            polygon[0].forEach((coord) => {
                bounds.extend(coord as [number, number]);
            });
            map.fitBounds(bounds, { padding: 50 });

            console.log('Isochrone drawn on map');
        },
        [map, clearIsochroneFromMap]
    );

    // Создание/обновление маркера
    const createOrUpdateMarker = useCallback(
        (coordinates: [number, number], profile: IsochroneProfile) => {
            const color = getProfileColor(profile);

            if (marker) {
                marker.setLngLat(coordinates);
                const lngLat = marker.getLngLat();
                marker.remove();
                const newMarker = new mapboxgl.Marker({
                    color,
                    draggable: true,
                })
                    .setLngLat(lngLat)
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
            } else {
                const newMarker = new mapboxgl.Marker({
                    color,
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
            }
        },
        [marker, map]
    );

    // Автоматическое построение изохрона при изменении параметров
    useEffect(() => {
        if (!selectedCoordinates) return;

        const buildIsochrone = async () => {
            setIsLoading(true);
            try {
                console.log('Building isochrone:', { selectedProfile, selectedMinutes, selectedCoordinates });

                const polygon = await getIsochrone({
                    coordinates: selectedCoordinates,
                    profile: selectedProfile,
                    minutes: selectedMinutes,
                });

                if (polygon) {
                    setIsochroneData(polygon);
                    const color = getProfileColor(selectedProfile);
                    drawIsochroneOnMap(polygon, color);
                } else {
                    console.error('Failed to build isochrone');
                }
            } catch (error) {
                console.error('Error building isochrone:', error);
            } finally {
                setIsLoading(false);
            }
        };

        buildIsochrone();
    }, [selectedProfile, selectedMinutes, selectedCoordinates, drawIsochroneOnMap]);

    // Обновление цвета маркера при смене профиля
    useEffect(() => {
        if (marker && selectedCoordinates) {
            createOrUpdateMarker(selectedCoordinates, selectedProfile);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProfile]);

    // Обработчик выбора локации через поиск
    const handleLocationSelect = useCallback(
        (coordinates: [number, number], name: string, address?: string) => {
            setSelectedCoordinates(coordinates);
            setSelectedName(name);
            setFullAddress(address || '');

            createOrUpdateMarker(coordinates, selectedProfile);

            // Центрируем карту
            map.flyTo({ center: coordinates, zoom: 12 });

            console.log('Location selected from search:', { coordinates, name, address });
        },
        [map, selectedProfile, createOrUpdateMarker]
    );

    // Обработчик очистки
    const handleClear = useCallback(() => {
        setSelectedCoordinates(null);
        setSelectedName('');
        setFullAddress('');
        setIsochroneData(null);
        clearIsochroneFromMap();

        // Удаляем маркер
        if (marker) {
            marker.remove();
            setMarker(null);
        }

        console.log('Isochrone cleared');
    }, [marker, clearIsochroneFromMap]);

    // Обработчик изменения названия
    const handleNameChange = useCallback((newName: string) => {
        setSelectedName(newName);
        console.log('Name changed:', newName);
    }, []);

    // Cleanup при размонтировании
    useEffect(() => {
        return () => {
            try {
                if (map && map.getLayer('isochrone-fill')) {
                    map.removeLayer('isochrone-fill');
                }
                if (map && map.getLayer('isochrone-line')) {
                    map.removeLayer('isochrone-line');
                }
                if (map && map.getSource('isochrone')) {
                    map.removeSource('isochrone');
                }
            } catch (error) {
                console.error('Error cleaning up isochrone:', error);
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
        // UI состояние
        selectedProfile,
        setSelectedProfile,
        selectedMinutes,
        setSelectedMinutes,
        isSelectingPoint,
        setIsSelectingPoint,
        isLoading,

        // Данные состояния
        selectedCoordinates,
        setSelectedCoordinates,
        selectedName,
        setSelectedName,
        fullAddress,
        setFullAddress,
        isochroneData,

        // Маркер
        marker,

        // Методы
        handleLocationSelect,
        handleClear,
        handleNameChange,
    };
}
