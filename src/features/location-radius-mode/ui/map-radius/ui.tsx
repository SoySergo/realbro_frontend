'use client';

import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { LocationSearch } from '@/features/location-filter/ui/location-search';
import { LocationModeWrapper } from '@/features/location-filter/ui/location-mode-wrapper';
import { RadiusControls } from '../radius-controls';
import { useRadiusState } from '../../model/hooks/use-radius-state';

type MapRadiusProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент для работы с радиусом на карте
 * Позволяет пользователю выбрать точку на карте (кликом или через поиск) и радиус
 * Использует двухслойную систему: локальное состояние + глобальное (store/URL)
 */
export function MapRadius({ map, onClose, className }: MapRadiusProps) {
    const t = useTranslations('radius');

    // Используем хук для управления состоянием радиуса
    const {
        selectedRadius,
        isSelectingPoint,
        selectedCoordinates,
        selectedName,
        fullAddress,
        setSelectedRadius,
        setIsSelectingPoint,
        handleLocationSelect,
        handleClear,
        handleNameChange,
    } = useRadiusState({
        map,
        defaultPointName: t('selectedPoint'),
    });

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
