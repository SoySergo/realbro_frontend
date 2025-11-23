'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationSearch } from '@/components/features/location-filter/shared/LocationSearch';
import { LocationModeWrapper } from '@/components/features/location-filter/shared/LocationModeWrapper';
import { RadiusControls } from './RadiusControls';

type MapRadiusProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** CSS классы для контейнера */
    className?: string;
};

// Цвет круга радиуса
const RADIUS_COLOR = '#3B82F6'; // Синий

/**
 * Компонент для работы с радиусом на карте
 * Позволяет пользователю выбрать точку на карте (кликом или через поиск) и радиус
 * Использует двухслойную систему: локальное состояние + глобальное (store/URL)
 */
export function MapRadius({ map, onClose, className }: MapRadiusProps) {
    const t = useTranslations('radius');

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

    // Обработчик выбора точки на карте
    useEffect(() => {
        if (!isSelectingPoint) return;

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setSelectedCoordinates(coordinates);
            setSelectedName(t('selectedPoint'));
            setFullAddress('');
            setIsSelectingPoint(false);

            // Добавляем маркер
            if (marker) {
                marker.setLngLat(coordinates);
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
    }, [isSelectingPoint, map, marker, t]);

    // Обработчик выбора локации через поиск
    const handleLocationSelect = (coordinates: [number, number], name: string, address?: string) => {
        setSelectedCoordinates(coordinates);
        setSelectedName(name);
        setFullAddress(address || '');

        // Добавляем/перемещаем маркер
        if (marker) {
            marker.setLngLat(coordinates);
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
        }

        // Центрируем карту
        map.flyTo({ center: coordinates, zoom: 12 });

        console.log('Location selected from search:', { coordinates, name, address });
    };

    // Обработчик очистки
    const handleClear = () => {
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
    };

    // Обработчик изменения названия
    const handleNameChange = (newName: string) => {
        setSelectedName(newName);
        console.log('Name changed:', newName);
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

    // Обработчик применения фильтра (сохранение в URL)
    const handleApply = () => {
        // TODO: Добавить логику пуша в URL search params
        console.log('Apply radius filter:', {
            coordinates: selectedCoordinates,
            radiusKm: selectedRadius,
            name: selectedName,
        });
    };

    // Обработчик закрытия панели
    const handleClose = () => {
        onClose?.();
        console.log('Close radius panel');
    };

    return (
        <LocationModeWrapper
            title={t('title')}
            hasLocalData={!!selectedCoordinates}
            onClear={handleClear}
            onApply={handleApply}
            onClose={handleClose}
            className={className}
        >
            {/* Поиск адреса */}
            <div className="space-y-2">
                <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    selectedCoordinates={selectedCoordinates}
                    selectedName={selectedName}
                    fullAddress={fullAddress}
                    onClear={handleClear}
                    onNameChange={handleNameChange}
                    placeholder={t('searchPlaceholder')}
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
                    {isSelectingPoint ? t('clickOnMap') : t('pickPoint')}
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
                <p className="text-xs text-text-tertiary">{t('emptyStateHint')}</p>
            )}
        </LocationModeWrapper>
    );
}
