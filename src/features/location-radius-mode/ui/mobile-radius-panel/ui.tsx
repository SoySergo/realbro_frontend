'use client';

import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { RadiusControls } from '../radius-controls';
import { useRadiusState } from '../../model/hooks/use-radius-state';
import type mapboxgl from 'mapbox-gl';

type MobileRadiusPanelProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для очистки (вызывается кнопкой "Очистить" внизу) */
    onClear?: () => void;
    /** Колбэк для применения (вызывается кнопкой "Сохранить" внизу) */
    onApply?: () => void;
};

/**
 * Мобильная панель управления режимом радиуса
 * Компактная версия для отображения под табами на карте
 * 
 * Логика:
 * 1. До выбора точки - кнопка "Выбрать точку на карте"
 * 2. После выбора точки - инпут с названием + слайдер радиуса
 */
export function MobileRadiusPanel({ map }: MobileRadiusPanelProps) {
    const t = useTranslations('radius');

    const {
        selectedRadius,
        isSelectingPoint,
        selectedCoordinates,
        selectedName,
        setSelectedRadius,
        setIsSelectingPoint,
        handleNameChange,
    } = useRadiusState({
        map,
        defaultPointName: t('selectedPoint'),
    });

    return (
        <div className="px-4 py-3 space-y-3">
            {/* До выбора точки - кнопка выбора */}
            {!selectedCoordinates && (
                <Button
                    variant="outline"
                    className="w-full h-11 flex items-center justify-center gap-2"
                    onClick={() => setIsSelectingPoint(true)}
                    disabled={isSelectingPoint}
                >
                    <MapPin className="w-4 h-4" />
                    {isSelectingPoint ? t('clickOnMap') : t('pickPoint')}
                </Button>
            )}

            {/* После выбора точки - инпут и слайдер */}
            {selectedCoordinates && (
                <div className="space-y-3">
                    {/* Индикатор выбранной точки + инпут названия */}
                    <div className="flex items-center gap-2">
                        <Input
                            value={selectedName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder={t('pointName')}
                            className="flex-1 h-9 text-sm"
                        />

                    </div>

                    {/* Слайдер радиуса */}
                    <RadiusControls
                        selectedRadius={selectedRadius}
                        onRadiusChange={setSelectedRadius}
                    />
                </div>
            )}
        </div>
    );
}
