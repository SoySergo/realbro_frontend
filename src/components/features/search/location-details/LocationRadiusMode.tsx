'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Режим радиуса от точки
 * Позволяет выбрать радиус в километрах от выбранной точки на карте
 */

type LocationRadiusModeProps = {
    onApply: (radiusKm: number) => void;
};

export function LocationRadiusMode({ onApply }: LocationRadiusModeProps) {
    const t = useTranslations('filters');

    // Локальное состояние для радиуса
    const [radiusKm, setRadiusKm] = useState(5);

    const handleApply = () => {
        onApply(radiusKm);
    };

    return (
        <>
            <div className="flex items-center gap-4 flex-wrap flex-1">
                <Label className="text-sm text-text-primary">
                    {t('locationRadius')}:
                </Label>

                {/* Радиус в км */}
                <div className="flex gap-1">
                    {[1, 3, 5, 10, 15, 20].map((km) => (
                        <Button
                            key={km}
                            size="sm"
                            onClick={() => setRadiusKm(km)}
                            className={cn(
                                'h-8 text-xs cursor-pointer transition-colors',
                                radiusKm === km
                                    ? 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                    : cn(
                                        'bg-background text-text-secondary border-border',
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
