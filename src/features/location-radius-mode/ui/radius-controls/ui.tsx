'use client';

import { useTranslations } from 'next-intl';
import { Circle } from 'lucide-react';
import { Slider } from '@/shared/ui/slider';
import { cn } from '@/shared/lib/utils';

type RadiusControlsProps = {
    /** Выбранный радиус в километрах */
    selectedRadius: number;
    /** Колбэк при изменении радиуса */
    onRadiusChange: (radius: number) => void;
};

// Доступные радиусы (в километрах)
const RADIUS_STEPS = [1, 3, 5, 10, 15, 20];

/**
 * Компонент управления радиусом
 * Выбор расстояния в километрах
 */
export function RadiusControls({ selectedRadius, onRadiusChange }: RadiusControlsProps) {
    const t = useTranslations('radius');

    // Индекс текущего радиуса в массиве шагов
    const currentStepIndex = RADIUS_STEPS.indexOf(selectedRadius);

    // Обработчик изменения слайдера
    const handleSliderChange = (value: number[]) => {
        const newIndex = value[0];
        const newRadius = RADIUS_STEPS[newIndex];
        if (newRadius !== selectedRadius) {
            onRadiusChange(newRadius);
        }
    };

    // Форматировать расстояние для отображения
    const formatDistance = (km: number): string => {
        return `${km}${t('distance.km')}`;
    };

    return (
        <div className="space-y-6">
            {/* Выбор радиуса */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-primary">{t('radiusDistance')}</label>
                    <span className="text-sm font-mono text-brand-primary">{formatDistance(selectedRadius)}</span>
                </div>

                {/* Слайдер */}
                <div className="px-2">
                    <Slider
                        value={[currentStepIndex >= 0 ? currentStepIndex : 0]}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={RADIUS_STEPS.length - 1}
                        step={1}
                        className="w-full"
                    />
                </div>

                {/* Метки расстояния */}
                <div className="flex justify-between text-xs text-text-tertiary px-1">
                    {RADIUS_STEPS.map((radius, index) => (
                        <button
                            key={radius}
                            onClick={() => {
                                if (radius !== selectedRadius) {
                                    onRadiusChange(radius);
                                }
                            }}
                            className={cn(
                                'hover:text-text-primary transition-colors cursor-pointer',
                                currentStepIndex === index && 'text-brand-primary font-medium'
                            )}
                        >
                            {formatDistance(radius)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Визуальная подсказка */}
            {/* <div className="flex items-center gap-2 text-xs text-text-secondary bg-background-secondary p-3 rounded-lg">
                <Circle className="h-4 w-4 shrink-0" />
                <p>{t('hint', { radius: selectedRadius })}</p>
            </div> */}
        </div>
    );
}
