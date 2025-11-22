'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useLocalLocationState } from '@/hooks/useLocalLocationState';
import { LocationModeActions } from './LocationModeActions';
import type { RadiusSettings } from '@/types/filter';

/**
 * Режим радиуса от точки
 * Позволяет выбрать радиус в километрах от выбранной точки на карте
 * 
 * ДВУХСЛОЙНАЯ СИСТЕМА:
 * - Локальный слой (localStorage): временные изменения до применения
 * - Глобальный слой (store): применённые фильтры
 */

type LocationRadiusModeProps = {
    /** Коллбэк для выбора точки на карте */
    onSelectPoint: () => void;
    /** Коллбэк для отображения радиуса на карте */
    onShowRadius?: (center: [number, number], radiusKm: number) => void;
    /** Коллбэк для удаления радиуса с карты */
    onClearRadius?: () => void;
    /** Выбранные координаты (передаются с карты) */
    selectedCoordinates?: [number, number] | null;
};

export function LocationRadiusMode({
    onSelectPoint,
    onShowRadius,
    onClearRadius,
    selectedCoordinates
}: LocationRadiusModeProps) {
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
        updateRadiusState,
        clearLocalState,
        getModesWithData,
        loadFromGlobalFilter,
        forceCleanLocalStorage,
    } = useLocalLocationState(activeLocationMode);

    // Локальные настройки радиуса (до применения)
    const localRadiusState = currentLocalState as { radius: RadiusSettings | null } | null;
    const localRadius = useMemo(
        () => localRadiusState?.radius || null,
        [localRadiusState]
    );

    // UI состояние для радиуса
    const [radiusKm, setRadiusKm] = useState(5);

    // Инициализация: при открытии режима загружаем из глобального фильтра
    useEffect(() => {
        if (locationFilter?.mode === 'radius' && locationFilter.radius) {
            loadFromGlobalFilter('radius', locationFilter);
            setRadiusKm(locationFilter.radius.radiusKm);
            console.log('[LOCAL] Loaded radius mode from global filter');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeLocationMode]);

    // Создание радиуса при выборе точки на карте
    useEffect(() => {
        if (selectedCoordinates && !localRadius) {
            const radiusSettings: RadiusSettings = {
                center: selectedCoordinates,
                radiusKm,
            };

            updateRadiusState({ radius: radiusSettings });

            // Отображаем на карте
            if (onShowRadius) {
                onShowRadius(selectedCoordinates, radiusKm);
            }

            console.log('[LOCAL] Radius created and saved');
        }
    }, [selectedCoordinates, localRadius, radiusKm, updateRadiusState, onShowRadius]);

    // Обновление радиуса при изменении значения
    const handleRadiusChange = (newRadiusKm: number) => {
        setRadiusKm(newRadiusKm);

        if (localRadius) {
            const updatedRadius: RadiusSettings = {
                ...localRadius,
                radiusKm: newRadiusKm,
            };

            updateRadiusState({ radius: updatedRadius });

            // Обновляем на карте
            if (onShowRadius) {
                onShowRadius(localRadius.center, newRadiusKm);
            }

            console.log('[LOCAL] Radius updated:', newRadiusKm, 'km');
        }
    };

    // Удаление радиуса
    const handleDelete = () => {
        if (onClearRadius) {
            onClearRadius();
        }
        clearLocalState('radius');
        console.log('[LOCAL] Radius deleted from local state');
    };

    // Очистка локального состояния (кнопка "Очистить")
    const handleClear = () => {
        if (onClearRadius) {
            onClearRadius();
        }
        clearLocalState('radius');
        console.log('[LOCAL] Cleared local radius state');
    };

    // Выход из режима (кнопка X)
    const handleExit = () => {
        // Удаляем радиус с карты
        if (onClearRadius) {
            onClearRadius();
        }
        // Полностью очищаем ВСЕ локальные состояния
        forceCleanLocalStorage();
        // Закрываем панель деталей
        setLocationMode(null);
        console.log('[LOCAL] Exited radius mode and cleaned all local states');
    };

    // Сохранение фильтра в глобальный store
    const handleSave = () => {
        if (!localRadius) return;

        // Применяем локальные изменения в глобальный store
        setLocationFilter({
            mode: 'radius',
            radius: localRadius,
        });

        // Полностью очищаем localStorage после сохранения
        forceCleanLocalStorage();

        // Закрываем панель деталей
        setLocationMode(null);

        console.log('[GLOBAL] Radius filter saved');
        console.log('[LOCAL] Cleaned localStorage after save');
    };

    return (
        <>
            <div className="flex items-center gap-3 flex-wrap flex-1">
                <Label className="text-sm text-text-primary">
                    {t('locationRadius')}:
                </Label>

                {/* Радиус в км */}
                <div className="flex gap-1">
                    {[1, 3, 5, 10, 15, 20].map((km) => (
                        <Button
                            key={km}
                            size="sm"
                            onClick={() => handleRadiusChange(km)}
                            className={cn(
                                'h-8 text-xs cursor-pointer transition-colors',
                                radiusKm === km
                                    ? 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                    : cn(
                                        'bg-background text-text-secondary border border-border',
                                        'dark:bg-background-secondary dark:text-text-primary dark:border-border',
                                        'hover:bg-background-secondary hover:text-text-primary',
                                        'dark:hover:bg-background-tertiary dark:hover:text-text-primary'
                                    )
                            )}
                        >
                            {km} км
                        </Button>
                    ))}
                </div>

                {/* Статус */}
                {!localRadius && (
                    <>
                        <div className="text-xs text-text-secondary">
                            {t('selectPointOnMap')}
                        </div>
                        <Button
                            size="sm"
                            onClick={onSelectPoint}
                            className={cn(
                                'h-8 cursor-pointer transition-colors',
                                'bg-brand-primary hover:bg-brand-primary-hover text-white'
                            )}
                        >
                            <MapPin className="w-4 h-4 mr-1.5" />
                            {t('selectPoint')}
                        </Button>
                    </>
                )}

                {/* Информация о созданном радиусе */}
                {localRadius && (
                    <>
                        <div className="text-xs text-success font-medium">
                            {t('radiusReady', { radius: localRadius.radiusKm })}
                        </div>

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
                currentMode="radius"
                hasCurrentData={!!localRadius}
                otherModesWithData={getModesWithData('radius')}
                onClear={handleClear}
                onApply={handleSave}
                onExit={handleExit}
            />
        </>
    );
}
