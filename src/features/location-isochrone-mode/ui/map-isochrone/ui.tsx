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

    // Отслеживание изменений: dirty = данные изменились с момента последнего сохранения/восстановления
    const [isDirty, setIsDirty] = useState(!initialData);

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
        restoreFromPolygon,
    } = useIsochroneState({ map });

    // Восстановление сохранённого изохрона при повторном открытии
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initialData && !initializedRef.current) {
            initializedRef.current = true;
            setSelectedProfile(initialData.profile);
            setSelectedMinutes(initialData.minutes);

            // Если есть сохранённый полигон — восстанавливаем без вызова Mapbox API
            if (initialData.polygon) {
                restoreFromPolygon(initialData.polygon);
            }

            handleLocationSelect(initialData.center, initialData.name || t('selectedPoint'));
            console.log('[MapIsochrone] Restored saved isochrone from saved polygon data');
        }
    }, [initialData, setSelectedProfile, setSelectedMinutes, handleLocationSelect, restoreFromPolygon, t]);

    // Очистка с удалением геометрий на бекенде
    const handleClearWithDelete = async () => {
        handleClear();
        setIsDirty(false);
        const { deleteLocationGeometries, setLocationFilter } = useFilterStore.getState();
        await deleteLocationGeometries(isAuthenticated);
        setLocationFilter(null);
    };

    // Обработчик выбора точки на карте
    useEffect(() => {
        if (!isSelectingPoint) return;

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setSelectedCoordinates(coordinates);
            handleNameChange(t('selectedPoint'));
            setIsSelectingPoint(false);
            setIsDirty(true);

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
            const { setLocationFilter, setFilters, setLocationMode, addGeometryMeta, locationGeometryMeta, deleteLocationGeometries, clearGeometryMeta } = useFilterStore.getState();

            // Определяем режим сохранения: фильтр или гостевой
            const activeQuery = activeQueryId ? queries.find(q => q.id === activeQueryId) : null;
            const hasSavedFilter = isAuthenticated && activeQuery && !activeQuery.isUnsaved;

            // Удаляем старые геометрии перед созданием новых (чтобы не дублировать)
            if (locationGeometryMeta.length > 0) {
                await deleteLocationGeometries(isAuthenticated);
                clearGeometryMeta();
            }

            // Сохраняем изохрон как геометрию на бекенд
            const geojsonStr = JSON.stringify({
                type: 'Polygon',
                coordinates: isochroneData,
            });

            const params = {
                type: 'isochrone' as const,
                geometry: geojsonStr,
                name: selectedName || '',
                center_lat: selectedCoordinates[1],
                center_lng: selectedCoordinates[0],
            };

            let geometryId: string | undefined;

            try {
                if (hasSavedFilter && activeQueryId) {
                    const result = await createFilterGeometry(activeQueryId, params);
                    geometryId = result.id;
                    console.log('[GEO] Isochrone saved to filter:', activeQueryId);
                } else {
                    const result = await createGuestGeometry(params);
                    geometryId = result.id;
                    console.log('[GEO] Isochrone saved as guest geometry:', geometryId);
                }
            } catch (geoError) {
                console.error('[GEO] Failed to save isochrone geometry:', geoError);
            }

            // Сохраняем мету (id + name)
            if (geometryId) {
                addGeometryMeta({ id: geometryId, name: selectedName || '', type: 'isochrone' });
            }

            // Сохраняем в filter store как LocationFilter
            setLocationFilter({
                mode: 'isochrone',
                isochrone: {
                    center: selectedCoordinates,
                    profile: selectedProfile as 'walking' | 'cycling' | 'driving',
                    minutes: selectedMinutes,
                    name: selectedName || undefined,
                    polygon: isochroneData,
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
            isDirty={isDirty}
            onClear={handleClearWithDelete}
            onApply={handleApply}
            onClose={handleClose}
            isSaving={isSaving}
            className={className}
        >
            {/* Поиск адреса */}
            <div className="space-y-2">
                <LocationSearch
                    onLocationSelect={(coords, name, address) => {
                        handleLocationSelect(coords, name, address);
                        setIsDirty(true);
                    }}
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

            {/* Управление изохроном */}
            {selectedCoordinates && (
                <>
                    <div className="border-t border-border pt-4">
                        <IsochroneControls
                            selectedProfile={selectedProfile}
                            onProfileChange={(p) => { setSelectedProfile(p); setIsDirty(true); }}
                            selectedMinutes={selectedMinutes}
                            onMinutesChange={(m) => { setSelectedMinutes(m); setIsDirty(true); }}
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
