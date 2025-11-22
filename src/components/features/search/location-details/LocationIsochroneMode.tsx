'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useLocalLocationState } from '@/hooks/useLocalLocationState';
import { LocationModeActions } from './LocationModeActions';
import { getIsochrone, getProfileColor } from '@/services/mapbox-isochrone';
import type { IsochroneSettings } from '@/types/filter';

/**
 * Режим изохрона (время в пути до точки)
 * Позволяет выбрать профиль транспорта и время в пути через Mapbox Isochrone API
 * 
 * ДВУХСЛОЙНАЯ СИСТЕМА:
 * - Локальный слой (localStorage): временные изменения до применения
 * - Глобальный слой (store): применённые фильтры
 */

type IsochroneProfile = 'walking' | 'cycling' | 'driving';

type LocationIsochroneModeProps = {
    /** Коллбэк для выбора точки на карте */
    onSelectPoint: () => void;
    /** Коллбэк для отображения изохрона на карте */
    onShowIsochrone?: (polygon: number[][][], color: string) => void;
    /** Коллбэк для удаления изохрона с карты */
    onClearIsochrone?: () => void;
    /** Выбранные координаты (передаются с карты) */
    selectedCoordinates?: [number, number] | null;
};

export function LocationIsochroneMode({
    onSelectPoint,
    onShowIsochrone,
    onClearIsochrone,
    selectedCoordinates
}: LocationIsochroneModeProps) {
    const t = useTranslations('filters');

    const {
        activeLocationMode,
        locationFilter,
        setLocationFilter,
        setLocationMode,
    } = useFilterStore();

    // Локальное состояние для этого режима
    const {
        currentLocalState,
        updateIsochroneState,
        clearLocalState,
        getModesWithData,
        loadFromGlobalFilter,
        forceCleanLocalStorage,
    } = useLocalLocationState(activeLocationMode);

    // Локальные настройки изохрона (до применения)
    const localIsochroneState = currentLocalState as { isochrone: IsochroneSettings | null } | null;
    const localIsochrone = useMemo(
        () => localIsochroneState?.isochrone || null,
        [localIsochroneState]
    );

    // UI состояние для настроек
    const [profile, setProfile] = useState<IsochroneProfile>('walking');
    const [minutes, setMinutes] = useState(15);
    const [isCalculating, setIsCalculating] = useState(false);

    // Инициализация: при открытии режима загружаем из глобального фильтра
    useEffect(() => {
        if (locationFilter?.mode === 'isochrone' && locationFilter.isochrone) {
            loadFromGlobalFilter('isochrone', locationFilter);
            setProfile(locationFilter.isochrone.profile as IsochroneProfile);
            setMinutes(locationFilter.isochrone.minutes);
            console.log('[LOCAL] Loaded isochrone mode from global filter');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeLocationMode]);

    // Расчёт изохрона при выборе точки на карте
    const calculateIsochrone = useCallback(async (coords: [number, number]) => {
        if (!coords) return;

        setIsCalculating(true);
        console.log('[ISOCHRONE] Calculating isochrone:', { profile, minutes, coords });

        try {
            // Получаем изохрон через Mapbox API
            const isochronePolygon = await getIsochrone({
                coordinates: coords,
                profile,
                minutes,
            });

            if (isochronePolygon) {
                // Сохраняем в локальное состояние
                const isochroneSettings: IsochroneSettings = {
                    center: coords,
                    profile,
                    minutes,
                };

                updateIsochroneState({ isochrone: isochroneSettings });

                // Отображаем на карте
                if (onShowIsochrone) {
                    const color = getProfileColor(profile);
                    onShowIsochrone(isochronePolygon, color);
                }

                console.log('[LOCAL] Isochrone calculated and saved');
            } else {
                console.error('[ISOCHRONE] Failed to calculate isochrone');
            }
        } catch (error) {
            console.error('[ISOCHRONE] Error calculating isochrone:', error);
        } finally {
            setIsCalculating(false);
        }
    }, [profile, minutes, updateIsochroneState, onShowIsochrone]);

    // Автоматический расчёт при выборе координат
    useEffect(() => {
        if (selectedCoordinates && !localIsochrone) {
            calculateIsochrone(selectedCoordinates);
        }
    }, [selectedCoordinates, localIsochrone, calculateIsochrone]);

    // Пересчёт изохрона при изменении настроек
    const handleRecalculate = () => {
        if (localIsochrone?.center) {
            calculateIsochrone(localIsochrone.center);
        }
    };

    // Удаление изохрона
    const handleDelete = () => {
        if (onClearIsochrone) {
            onClearIsochrone();
        }
        clearLocalState('isochrone');
        console.log('[LOCAL] Isochrone deleted from local state');
    };

    // Очистка локального состояния (кнопка "Очистить")
    const handleClear = () => {
        if (onClearIsochrone) {
            onClearIsochrone();
        }
        clearLocalState('isochrone');
        console.log('[LOCAL] Cleared local isochrone state');
    };

    // Выход из режима (кнопка X)
    const handleExit = () => {
        // Удаляем изохрон с карты
        if (onClearIsochrone) {
            onClearIsochrone();
        }
        // Полностью очищаем ВСЕ локальные состояния
        forceCleanLocalStorage();
        // Закрываем панель деталей
        setLocationMode(null);
        console.log('[LOCAL] Exited isochrone mode and cleaned all local states');
    };

    // Сохранение фильтра в глобальный store
    const handleSave = () => {
        if (!localIsochrone) return;

        // Применяем локальные изменения в глобальный store
        setLocationFilter({
            mode: 'isochrone',
            isochrone: localIsochrone,
        });

        // Полностью очищаем localStorage после сохранения
        forceCleanLocalStorage();

        // Закрываем панель деталей
        setLocationMode(null);

        console.log('[GLOBAL] Isochrone filter saved');
        console.log('[LOCAL] Cleaned localStorage after save');
    };

    return (
        <>
            <div className="flex items-center gap-3 flex-wrap flex-1">
                <Label className="text-sm text-text-primary">
                    {t('locationTimeFrom')}:
                </Label>

                {/* Профиль (пешком/велосипед/машина) */}
                <div className="flex gap-1">
                    {(['walking', 'cycling', 'driving'] as const).map((p) => (
                        <Button
                            key={p}
                            size="sm"
                            onClick={() => setProfile(p)}
                            disabled={isCalculating}
                            className={cn(
                                'h-8 text-xs cursor-pointer transition-colors',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                profile === p
                                    ? 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                    : cn(
                                        'bg-background text-text-secondary border border-border',
                                        'dark:bg-background-secondary dark:text-text-primary dark:border-border',
                                        'hover:bg-background-secondary hover:text-text-primary',
                                        'dark:hover:bg-background-tertiary dark:hover:text-text-primary'
                                    )
                            )}
                        >
                            {t(p)}
                        </Button>
                    ))}
                </div>

                {/* Минуты */}
                <div className="flex gap-1">
                    {[5, 10, 15, 30, 45, 60].map((min) => (
                        <Button
                            key={min}
                            size="sm"
                            onClick={() => setMinutes(min)}
                            disabled={isCalculating}
                            className={cn(
                                'h-8 text-xs cursor-pointer transition-colors',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                minutes === min
                                    ? 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                    : cn(
                                        'bg-background text-text-secondary border border-border',
                                        'dark:bg-background-secondary dark:text-text-primary dark:border-border',
                                        'hover:bg-background-secondary hover:text-text-primary',
                                        'dark:hover:bg-background-tertiary dark:hover:text-text-primary'
                                    )
                            )}
                        >
                            {min}
                        </Button>
                    ))}
                </div>

                {/* Статус */}
                {!localIsochrone && (
                    <>
                        <div className="text-xs text-text-secondary">
                            {t('selectPointOnMap')}
                        </div>
                        <Button
                            size="sm"
                            onClick={onSelectPoint}
                            disabled={isCalculating}
                            className={cn(
                                'h-8 cursor-pointer transition-colors',
                                'bg-brand-primary hover:bg-brand-primary-hover text-white',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            <MapPin className="w-4 h-4 mr-1.5" />
                            {t('selectPoint')}
                        </Button>
                    </>
                )}

                {isCalculating && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('calculating')}
                    </div>
                )}

                {/* Информация о созданном изохроне */}
                {localIsochrone && !isCalculating && (
                    <>
                        <div className="text-xs text-success font-medium">
                            {t('isochroneReady', {
                                profile: t(profile),
                                minutes: localIsochrone.minutes
                            })}
                        </div>

                        <Button
                            size="sm"
                            onClick={handleRecalculate}
                            className={cn(
                                'h-8 cursor-pointer transition-colors',
                                'bg-background text-text-secondary border border-border',
                                'dark:bg-background-secondary dark:text-text-primary dark:border-border',
                                'hover:bg-background-secondary hover:text-text-primary',
                                'dark:hover:bg-background-tertiary dark:hover:text-text-primary'
                            )}
                        >
                            {t('recalculate')}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className={cn(
                                'h-8 cursor-pointer',
                                'text-error hover:text-error hover:bg-error/10'
                            )}
                        >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            {t('delete')}
                        </Button>
                    </>
                )}
            </div>

            {/* Кнопки управления */}
            <LocationModeActions
                currentMode="isochrone"
                hasCurrentData={!!localIsochrone && !isCalculating}
                otherModesWithData={getModesWithData('isochrone')}
                onClear={handleClear}
                onApply={handleSave}
                onExit={handleExit}
                applyDisabled={isCalculating}
            />
        </>
    );
}
