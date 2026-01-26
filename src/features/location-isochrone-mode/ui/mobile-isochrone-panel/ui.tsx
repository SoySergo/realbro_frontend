'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { IsochroneControls } from '../isochrone-controls';
import { useIsochroneState } from '../../model/hooks/use-isochrone-state';
import type mapboxgl from 'mapbox-gl';

type MobileIsochronePanelProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
};

/**
 * Мобильная панель режима изохрона (время в пути)
 * Компактная версия для отображения под табами на карте
 *
 * Функциональность:
 * - Выбор точки на карте или поиском
 * - Выбор профиля передвижения (пешком, велосипед, авто)
 * - Выбор времени в пути (5-60 минут)
 * - Визуализация зоны досягаемости
 */
export const MobileIsochronePanel = memo(function MobileIsochronePanel({
    map,
}: MobileIsochronePanelProps) {
    const t = useTranslations('isochrone');

    const {
        selectedProfile,
        setSelectedProfile,
        selectedMinutes,
        setSelectedMinutes,
        isSelectingPoint,
        setIsSelectingPoint,
        isLoading,
        selectedCoordinates,
        selectedName,
        handleNameChange,
    } = useIsochroneState({ map });

    return (
        <div className="px-4 py-3 space-y-3">
            {/* До выбора точки - кнопка выбора */}
            {!selectedCoordinates && (
                <Button
                    variant="outline"
                    className="w-full h-11 flex items-center justify-center gap-2 touch-manipulation"
                    onClick={() => setIsSelectingPoint(true)}
                    disabled={isSelectingPoint}
                >
                    <MapPin className="w-4 h-4" />
                    {isSelectingPoint ? t('clickOnMap') : t('pickPoint')}
                </Button>
            )}

            {/* После выбора точки - полные настройки */}
            {selectedCoordinates && (
                <div className="space-y-4">
                    {/* Инпут названия точки */}
                    <div className="flex items-center gap-2">
                        <Input
                            value={selectedName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder={t('pointName')}
                            className="flex-1 h-9 text-sm"
                        />
                        {isLoading && (
                            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                        )}
                    </div>

                    {/* Настройки изохрона (профиль + время) */}
                    <IsochroneControls
                        selectedProfile={selectedProfile}
                        onProfileChange={setSelectedProfile}
                        selectedMinutes={selectedMinutes}
                        onMinutesChange={setSelectedMinutes}
                    />
                </div>
            )}

            {/* Пустое состояние */}
            {!selectedCoordinates && !isSelectingPoint && (
                <div className="text-center py-4 text-text-secondary">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">{t('emptyStateHint')}</p>
                </div>
            )}
        </div>
    );
});
