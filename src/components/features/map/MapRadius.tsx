'use client';

import { useState, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { RadiusControls } from './RadiusControls';
import { IsochroneAddressSearch } from './IsochroneAddressSearch';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type MapRadiusProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** CSS классы для контейнера */
    className?: string;
};

// Цвет круга радиуса
const RADIUS_COLOR = '#3B82F6'; // Синий

/**
 * Компонент для работы с радиусом на карте
 * Позволяет пользователю выбрать точку на карте (кликом или через поиск) и радиус
 */
export function MapRadius({ map, className }: MapRadiusProps) {
    // Состояние UI
    const [selectedRadius, setSelectedRadius] = useState(5);
    const [isSelectingPoint, setIsSelectingPoint] = useState(false);

    // Состояние данных
    const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
    const [selectedName, setSelectedName] = useState<string>('');

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
                const newMarker = new mapboxgl.Marker({ color: RADIUS_COLOR })
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
    }, [isSelectingPoint, map, marker]);

    // Обработчик выбора локации через поиск
    const handleLocationSelect = (coordinates: [number, number], name: string) => {
        setSelectedCoordinates(coordinates);
        setSelectedName(name);

        // Добавляем/перемещаем маркер
        if (marker) {
            marker.setLngLat(coordinates);
        } else {
            const newMarker = new mapboxgl.Marker({ color: RADIUS_COLOR })
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
        clearRadiusFromMap();

        // Удаляем маркер
        if (marker) {
            marker.remove();
            setMarker(null);
        }

        console.log('Radius cleared');
    };

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

    return (
        <div className={cn('bg-background border border-border rounded-lg shadow-lg p-4 space-y-4', className)}>
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Radius Tool</h3>
                {selectedCoordinates && (
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

            {/* Управление радиусом */}
            {selectedCoordinates && (
                <div className="border-t border-border pt-4">
                    <RadiusControls selectedRadius={selectedRadius} onRadiusChange={setSelectedRadius} />
                </div>
            )}

            {/* Подсказка */}
            {!selectedCoordinates && (
                <p className="text-xs text-text-tertiary">
                    Search for an address or click on the map to select a center point
                </p>
            )}
        </div>
    );
}
