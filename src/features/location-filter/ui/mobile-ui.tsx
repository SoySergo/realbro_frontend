'use client';

import { useState, memo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MobileLocationSheet } from './mobile-location-sheet';
import type { LocationFilterMode } from '@/features/location-filter/model';

interface LocationFilterMobileProps {
    value?: LocationFilterMode | null;
    onChange?: (mode: LocationFilterMode) => void;
    /** Called when user wants to open the selected mode on the map (and close filters) */
    onLaunch?: (mode: LocationFilterMode) => void;
}

/**
 * Мобильная версия фильтра локации
 * Одна кнопка, открывающая полноэкранный режим с картой и табами
 */
export const LocationFilterMobile = memo(({
    value: propValue,
    onLaunch,
}: LocationFilterMobileProps) => {
    const t = useTranslations('filters');
    const { activeLocationMode } = useFilterStore();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Используем пропс если есть, иначе берём из store
    const currentMode = propValue !== undefined ? propValue : activeLocationMode;

    // Получаем текст для кнопки в зависимости от режима
    const getButtonText = () => {
        if (!currentMode) return t('location');

        switch (currentMode) {
            case 'search':
                return t('locationSearch');
            case 'draw':
                return t('locationDraw');
            case 'isochrone':
                return t('locationTimeFrom');
            case 'radius':
                return t('locationRadius');
            default:
                return t('location');
        }
    };

    const modeToOpen: LocationFilterMode = (currentMode as LocationFilterMode) || 'radius';

    return (
        <>
            <Button
                variant={currentMode ? 'default' : 'outline'}
                className="w-full h-12 flex items-center justify-center gap-3 text-sm"
                onClick={() => {
                    if (onLaunch) {
                        onLaunch(modeToOpen);
                        return;
                    }
                    // fallback: open internal sheet
                    setIsSheetOpen(true);
                }}
            >
                <MapPin className="w-5 h-5" />
                {getButtonText()}
            </Button>

            {/* legacy fallback sheet */}
            <MobileLocationSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </>
    );
});

LocationFilterMobile.displayName = 'LocationFilterMobile';
