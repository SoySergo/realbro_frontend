'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Режим изохрона (время в пути до точки)
 * Позволяет выбрать профиль транспорта и время в пути
 */

type IsochroneProfile = 'walking' | 'cycling' | 'driving';

type LocationIsochroneModeProps = {
    onApply: (profile: IsochroneProfile, minutes: number) => void;
};

export function LocationIsochroneMode({ onApply }: LocationIsochroneModeProps) {
    const t = useTranslations('filters');

    // Локальное состояние для настроек изохрона
    const [isochroneProfile, setIsochroneProfile] = useState<IsochroneProfile>('walking');
    const [isochroneMinutes, setIsochroneMinutes] = useState(15);

    const handleApply = () => {
        onApply(isochroneProfile, isochroneMinutes);
    };

    return (
        <>
            <div className="flex items-center gap-4 flex-wrap flex-1">
                <Label className="text-sm text-text-primary">
                    {t('locationTimeFrom')}:
                </Label>

                {/* Профиль (пешком/велосипед/машина) */}
                <div className="flex gap-1">
                    {(['walking', 'cycling', 'driving'] as const).map((profile) => (
                        <Button
                            key={profile}
                            size="sm"
                            onClick={() => setIsochroneProfile(profile)}
                            className={cn(
                                'h-8 text-xs cursor-pointer transition-colors',
                                isochroneProfile === profile
                                    ? 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                    : cn(
                                        'bg-background text-text-secondary border-border',
                                        'dark:bg-background-secondary dark:text-text-primary dark:border-border',
                                        'hover:bg-background-secondary hover:text-text-primary',
                                        'dark:hover:bg-background-tertiary dark:hover:text-text-primary'
                                    )
                            )}
                        >
                            {t(profile)}
                        </Button>
                    ))}
                </div>

                {/* Минуты */}
                <div className="flex gap-1">
                    {[5, 10, 15, 30, 45, 60].map((min) => (
                        <Button
                            key={min}
                            size="sm"
                            onClick={() => setIsochroneMinutes(min)}
                            className={cn(
                                'h-8 text-xs cursor-pointer transition-colors',
                                isochroneMinutes === min
                                    ? 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                    : cn(
                                        'bg-background text-text-secondary border-border',
                                        'dark:bg-background-secondary dark:text-text-primary dark:border-border',
                                        'hover:bg-background-secondary hover:text-text-primary',
                                        'dark:hover:bg-background-tertiary dark:hover:text-text-primary'
                                    )
                            )}
                        >
                            {min} {t('minutes')}
                        </Button>
                    ))}
                </div>

                <div className="text-xs text-text-secondary">
                    Выберите точку на карте
                </div>
            </div>

            {/* Кнопка применить */}
            <Button
                size="sm"
                onClick={handleApply}
                className={cn(
                    "h-8 ml-auto cursor-pointer",
                    "bg-brand-primary hover:bg-brand-primary-hover text-white"
                )}
            >
                {t('apply')}
            </Button>
        </>
    );
}
