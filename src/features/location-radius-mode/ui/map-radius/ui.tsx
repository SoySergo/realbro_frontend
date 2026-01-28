'use client';

import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { LocationSearch } from '@/features/location-filter/ui/location-search';
import { LocationModeWrapper } from '@/features/location-filter/ui/location-mode-wrapper';
import { RadiusControls } from '../radius-controls';
import { useRadiusState } from '../../model/hooks/use-radius-state';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { saveRadius } from '@/shared/api/geometries';

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

    // Обработчик применения фильтра
    const handleApply = async () => {
        if (!selectedCoordinates) return;

        const { setLocationFilter, setFilters, setLocationMode } = useFilterStore.getState();

        // Сохраняем в filter store как LocationFilter
        setLocationFilter({
            mode: 'radius',
            radius: {
                center: selectedCoordinates,
                radiusKm: selectedRadius,
            },
        });

        // Обновляем SearchFilters с данными радиуса
        setFilters({
            radiusCenter: selectedCoordinates,
            radiusKm: selectedRadius,
        });

        // Закрываем панель режима локации
        setLocationMode(null);

        // Сохраняем на бекенд (фоном)
        saveRadius(selectedCoordinates, selectedRadius, selectedName).catch((error) => {
            console.error('[Radius] Failed to save to backend:', error);
        });

        onClose?.();
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
