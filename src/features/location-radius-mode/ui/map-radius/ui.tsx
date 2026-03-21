'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { LocationSearch } from '@/features/location-filter/ui/location-search';
import { LocationModeWrapper } from '@/features/location-filter/ui/location-mode-wrapper';
import { RadiusControls } from '../radius-controls';
import { useRadiusState } from '../../model/hooks/use-radius-state';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { useAuth } from '@/features/auth';
import { useSidebarStore } from '@/widgets/sidebar';
import { createFilterGeometry, createGuestGeometry } from '@/shared/api/geometries';
import type { RadiusSettings } from '@/features/location-filter/model';

type MapRadiusProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** Начальные данные (восстановление сохранённого радиуса) */
    initialData?: RadiusSettings;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент для работы с радиусом на карте
 * Позволяет пользователю выбрать точку на карте (кликом или через поиск) и радиус
 * Использует двухслойную систему: локальное состояние + глобальное (store/URL)
 */
export function MapRadius({ map, onClose, initialData, className }: MapRadiusProps) {
    const t = useTranslations('radius');
    const { isAuthenticated } = useAuth();
    const { activeQueryId, queries } = useSidebarStore();
    const [isSaving, setIsSaving] = useState(false);

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

    // Восстановление сохранённого радиуса при повторном открытии
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initialData && !initializedRef.current) {
            initializedRef.current = true;
            handleLocationSelect(initialData.center, initialData.name || t('selectedPoint'));
            setSelectedRadius(initialData.radiusKm);
            console.log('[MapRadius] Restored saved radius:', initialData);
        }
    }, [initialData, handleLocationSelect, setSelectedRadius, t]);

    // Очистка с удалением геометрий на бекенде
    const handleClearWithDelete = async () => {
        handleClear();
        const { deleteLocationGeometries, setLocationFilter } = useFilterStore.getState();
        await deleteLocationGeometries(isAuthenticated);
        setLocationFilter(null);
    };

    // Обработчик применения фильтра
    const handleApply = async () => {
        if (!selectedCoordinates) return;

        setIsSaving(true);
        try {
            const { setLocationFilter, setFilters, setLocationMode, addGeometryMeta } = useFilterStore.getState();

            // Определяем режим сохранения: фильтр или гостевой
            const activeQuery = activeQueryId ? queries.find(q => q.id === activeQueryId) : null;
            const hasSavedFilter = isAuthenticated && activeQuery && !activeQuery.isUnsaved;

            // Сохраняем на бекенд: type=radius, center+radius (без GeoJSON полигона)
            const params = {
                type: 'radius' as const,
                name: selectedName || '',
                radius: selectedRadius,
                center_lat: selectedCoordinates[1],
                center_lng: selectedCoordinates[0],
            };

            let geometryId: string | undefined;

            try {
                if (hasSavedFilter && activeQueryId) {
                    const result = await createFilterGeometry(activeQueryId, params);
                    geometryId = result.id;
                    console.log('[GEO] Radius saved to filter:', activeQueryId);
                } else {
                    const result = await createGuestGeometry(params);
                    geometryId = result.id;
                    console.log('[GEO] Radius saved as guest geometry:', geometryId);
                }
            } catch (geoError) {
                console.error('[GEO] Failed to save radius to backend:', geoError);
            }

            // Сохраняем мету (id + name)
            if (geometryId) {
                addGeometryMeta({ id: geometryId, name: selectedName || '', type: 'radius' });
            }

            // Сохраняем в store
            setLocationFilter({
                mode: 'radius',
                radius: {
                    center: selectedCoordinates,
                    radiusKm: selectedRadius,
                    name: selectedName || undefined,
                },
            });

            // Обновляем SearchFilters
            const filterUpdates: Record<string, unknown> = {
                radiusCenter: selectedCoordinates,
                radiusKm: selectedRadius,
                geometry_source: hasSavedFilter ? 'filter' : 'guest',
            };

            if (geometryId) {
                filterUpdates.polygon_ids = [geometryId];
            }

            setFilters(filterUpdates);

            // Закрываем панель режима локации
            setLocationMode(null);
            onClose?.();
        } catch (error) {
            console.error('[GEO] Failed to apply radius:', error);
        } finally {
            setIsSaving(false);
        }
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
            onClear={handleClearWithDelete}
            onApply={handleApply}
            onClose={handleClose}
            isSaving={isSaving}
            className={className}
        >
            {/* Поиск адреса */}
            <div className="space-y-2">
                <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    selectedCoordinates={selectedCoordinates}
                    selectedName={selectedName}
                    fullAddress={fullAddress}
                    onClear={handleClearWithDelete}
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
