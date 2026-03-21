'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { LocationSearch } from '@/features/location-filter/ui/location-search';
import { LocationModeWrapper } from '@/features/location-filter/ui/location-mode-wrapper';
import { IsochroneControls } from '../isochrone-controls';
import { useIsochroneState } from '../../model/hooks/use-isochrone-state';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { useAuth } from '@/features/auth';
import { useSidebarStore } from '@/widgets/sidebar';
import { createFilterGeometry, createGuestGeometry } from '@/shared/api/geometries';
import type { IsochroneSettings } from '@/features/location-filter/model';

type MapIsochroneProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** Начальные данные (восстановление сохранённого изохрона) */
    initialData?: IsochroneSettings;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент для работы с изохронами на карте
 * Позволяет выбрать точку на карте или через поиск, выбрать профиль и время
 */
export function MapIsochrone({ map, onClose, initialData, className }: MapIsochroneProps) {
    const t = useTranslations('isochrone');
    const { isAuthenticated } = useAuth();
    const { activeQueryId, queries } = useSidebarStore();
    const [isSaving, setIsSaving] = useState(false);

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

    // Восстановление сохранённого изохрона при повторном открытии
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initialData && !initializedRef.current) {
            initializedRef.current = true;
            setSelectedProfile(initialData.profile);
            setSelectedMinutes(initialData.minutes);
            handleLocationSelect(initialData.center, initialData.name || t('selectedPoint'));
            console.log('[MapIsochrone] Restored saved isochrone:', initialData);
        }
    }, [initialData, setSelectedProfile, setSelectedMinutes, handleLocationSelect, t]);

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

    // Обработчик применения фильтра (сохранение в store и на бекенд)
    const handleApply = async () => {
        if (!selectedCoordinates || !isochroneData) return;

        setIsSaving(true);
        try {
            const { setLocationFilter, setFilters, setLocationMode } = useFilterStore.getState();

            // Определяем режим сохранения: фильтр или гостевой
            const activeQuery = activeQueryId ? queries.find(q => q.id === activeQueryId) : null;
            const hasSavedFilter = isAuthenticated && activeQuery && !activeQuery.isUnsaved;

            // Сохраняем изохрон как геометрию на бекенд
            const geojsonStr = JSON.stringify({
                type: 'Polygon',
                coordinates: isochroneData,
            });

            let geometryId: string | undefined;

            try {
                if (hasSavedFilter && activeQueryId) {
                    const result = await createFilterGeometry(activeQueryId, geojsonStr);
                    geometryId = result.id;
                    console.log('[GEO] Isochrone saved to filter:', activeQueryId);
                } else {
                    const result = await createGuestGeometry(geojsonStr, 'isochrone');
                    geometryId = result.id;
                    console.log('[GEO] Isochrone saved as guest geometry:', geometryId);
                }
            } catch (geoError) {
                console.error('[GEO] Failed to save isochrone geometry:', geoError);
            }

            // Сохраняем в filter store как LocationFilter
            setLocationFilter({
                mode: 'isochrone',
                isochrone: {
                    center: selectedCoordinates,
                    profile: selectedProfile as 'walking' | 'cycling' | 'driving',
                    minutes: selectedMinutes,
                    name: selectedName || undefined,
                },
            });

            // Обновляем SearchFilters
            const filterUpdates: Record<string, unknown> = {
                isochroneCenter: selectedCoordinates,
                isochroneMinutes: selectedMinutes,
                isochroneProfile: selectedProfile,
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
            console.error('[GEO] Failed to apply isochrone:', error);
        } finally {
            setIsSaving(false);
        }
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
