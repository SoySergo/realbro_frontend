'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationSearch } from '@/components/features/search/location-filter/shared/LocationSearch';
import { LocationModeWrapper } from '@/components/features/search/location-filter/shared/LocationModeWrapper';
import { IsochroneControls } from './IsochroneControls';
import { getIsochrone, getProfileColor } from '@/services/mapbox-isochrone';
import type { IsochroneProfile } from '@/services/mapbox-isochrone';

type MapIsochroneProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент для работы с изохронами на карте
 * Позволяет выбрать точку на карте или через поиск, выбрать профиль и время
 */
export function MapIsochrone({ map, onClose, className }: MapIsochroneProps) {
    const t = useTranslations('isochrone');

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
            setSelectedName(t('selectedPoint'));
            setFullAddress('');
            setIsSelectingPoint(false);

            // Добавляем маркер
            if (marker) {
                marker.setLngLat(coordinates);
            } else {
                const newMarker = new mapboxgl.Marker({
                    color: getProfileColor(selectedProfile),
                    draggable: true
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
    }, [isSelectingPoint, map, marker, selectedProfile, t]);

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
                color: getProfileColor(selectedProfile),
                draggable: true
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
        setIsochroneData(null);
        clearIsochroneFromMap();

        // Удаляем маркер
        if (marker) {
            marker.remove();
            setMarker(null);
        }

        console.log('Isochrone cleared');
    };

    // Обработчик изменения названия
    const handleNameChange = (newName: string) => {
        setSelectedName(newName);
        console.log('Name changed:', newName);
    };


    // Обновление цвета маркера при смене профиля
    useEffect(() => {
        if (marker && selectedCoordinates) {
            const color = getProfileColor(selectedProfile);
            const lngLat = marker.getLngLat();
            marker.remove();
            const newMarker = new mapboxgl.Marker({
                color,
                draggable: true
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

    // Обработчик применения фильтра (сохранение в URL)
    const handleApply = () => {
        // TODO: Добавить логику пуша в URL search params
        console.log('Apply isochrone filter:', {
            coordinates: selectedCoordinates,
            profile: selectedProfile,
            minutes: selectedMinutes,
            polygon: isochroneData,
        });
    };

    // Обработчик закрытия панели
    const handleClose = () => {
        onClose?.();
        console.log('Close isochrone panel');
    };

    return (
        <LocationModeWrapper
            title={t('title')}
            hasLocalData={!!selectedCoordinates || !!isochroneData}
            onClear={handleClear}
            onApply={handleApply}
            onClose={handleClose}
            className={className}
        >
            {/* Поиск адреса */}
            <div className="space-y-2">
                {/* <label className="text-sm font-medium text-text-primary">{t('selectLocation')}</label> */}
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
                        <div className="text-center text-sm text-text-secondary">{t('calculating')}</div>
                    )}
                </>
            )}
        </LocationModeWrapper>
    );
}
