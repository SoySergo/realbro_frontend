'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { LocationSearch } from '@/features/location-filter/ui/location-search';
import { LocationModeWrapper } from '@/features/location-filter/ui/location-mode-wrapper';
import { IsochroneControls } from '../isochrone-controls';
import { useIsochroneState } from '../../model/hooks/use-isochrone-state';

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

    // Используем хук для управления состоянием
    const {
        selectedProfile,
        setSelectedProfile,
        selectedMinutes,
        setSelectedMinutes,
        isSelectingPoint,
        setIsSelectingPoint,
        isLoading,
        selectedCoordinates,
        setSelectedCoordinates,
        selectedName,
        fullAddress,
        isochroneData,
        handleLocationSelect,
        handleClear,
        handleNameChange,
    } = useIsochroneState({ map });

    // Обработчик выбора точки на карте
    useEffect(() => {
        if (!isSelectingPoint) return;

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setSelectedCoordinates(coordinates);
            handleNameChange(t('selectedPoint'));
            setIsSelectingPoint(false);

            // Маркер создастся автоматически через хук
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
    }, [isSelectingPoint, map, setSelectedCoordinates, setIsSelectingPoint, handleNameChange, t]);

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
