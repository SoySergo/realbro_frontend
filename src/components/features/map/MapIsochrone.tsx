'use client';

import { useState, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { IsochroneControls } from './IsochroneControls';
import { IsochroneAddressSearch } from './IsochroneAddressSearch';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2 } from 'lucide-react';
import { getIsochrone, getProfileColor } from '@/services/mapbox-isochrone';
import type { IsochroneProfile } from '@/services/mapbox-isochrone';
import { cn } from '@/lib/utils';

type MapIsochroneProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент для работы с изохронами на карте
 * Позволяет выбрать точку на карте или через поиск, выбрать профиль и время
 */
export function MapIsochrone({ map, className }: MapIsochroneProps) {
    // Состояние UI
    const [selectedProfile, setSelectedProfile] = useState<IsochroneProfile>('walking');
    const [selectedMinutes, setSelectedMinutes] = useState(15);
    const [isSelectingPoint, setIsSelectingPoint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Состояние данных
    const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
    const [selectedName, setSelectedName] = useState<string>('');
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

    // Обработчик выбора точки на карте
    useEffect(() => {
        if (!isSelectingPoint) return;

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setSelectedCoordinates(coordinates);
            setSelectedName(`${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`);
            setIsSelectingPoint(false);

            // Добавляем маркер
            if (marker) {
                marker.setLngLat(coordinates);
            } else {
                const newMarker = new mapboxgl.Marker({ color: getProfileColor(selectedProfile) })
                    .setLngLat(coordinates)
                    .addTo(map);
                setMarker(newMarker);
            }

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
    }, [isSelectingPoint, map, marker, selectedProfile]);

    // Обработчик выбора локации через поиск
    const handleLocationSelect = (coordinates: [number, number], name: string) => {
        setSelectedCoordinates(coordinates);
        setSelectedName(name);

        // Добавляем/перемещаем маркер
        if (marker) {
            marker.setLngLat(coordinates);
        } else {
            const newMarker = new mapboxgl.Marker({ color: getProfileColor(selectedProfile) })
                .setLngLat(coordinates)
                .addTo(map);
            setMarker(newMarker);
        }

        // Центрируем карту
        map.flyTo({ center: coordinates, zoom: 12 });

        console.log('Location selected from search:', { coordinates, name });
    };

    // Обработчик очистки
    const handleClear = () => {
        setSelectedCoordinates(null);
        setSelectedName('');
        setIsochroneData(null);
        clearIsochroneFromMap();

        // Удаляем маркер
        if (marker) {
            marker.remove();
            setMarker(null);
        }

        console.log('Isochrone cleared');
    };

    // Обновление цвета маркера при смене профиля
    useEffect(() => {
        if (marker && selectedCoordinates) {
            const color = getProfileColor(selectedProfile);
            const lngLat = marker.getLngLat();
            marker.remove();
            const newMarker = new mapboxgl.Marker({ color })
                .setLngLat(lngLat)
                .addTo(map);
            setMarker(newMarker);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProfile]);

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

    return (
        <div className={cn('bg-background border border-border rounded-lg shadow-lg p-4 space-y-4', className)}>
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Isochrone Tool</h3>
                {(selectedCoordinates || isochroneData) && (
                    <Button variant="ghost" size="sm" onClick={handleClear}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Поиск адреса */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Select Location</label>
                <IsochroneAddressSearch
                    onLocationSelect={handleLocationSelect}
                    selectedCoordinates={selectedCoordinates}
                    selectedName={selectedName}
                    onClear={handleClear}
                />
            </div>

            {/* Кнопка выбора точки на карте */}
            {!selectedCoordinates && (
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSelectingPoint(true)}
                    disabled={isSelectingPoint}
                >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isSelectingPoint ? 'Click on map...' : 'Pick point on map'}
                </Button>
            )}

            {/* Управление изохроном */}
            {selectedCoordinates && (
                <>
                    <div className="border-t border-border pt-4">
                        <IsochroneControls
                            selectedProfile={selectedProfile}
                            onProfileChange={setSelectedProfile}
                            selectedMinutes={selectedMinutes}
                            onMinutesChange={setSelectedMinutes}
                        />
                    </div>

                    {/* Индикатор загрузки */}
                    {isLoading && (
                        <div className="text-center text-sm text-text-secondary">
                            Calculating isochrone...
                        </div>
                    )}
                </>
            )}

            {/* Подсказка */}
            {!selectedCoordinates && (
                <p className="text-xs text-text-tertiary">
                    Search for an address or click on the map to select a starting point
                </p>
            )}
        </div>
    );
}
