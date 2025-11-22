'use client';

import { Circle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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

    return (
        <div className="space-y-6">
            {/* Выбор радиуса */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-primary">
                        Radius Distance
                    </label>
                    <span className="text-sm font-mono text-brand-primary">
                        {selectedRadius} km
                    </span>
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
                            {radius}km
                        </button>
                    ))}
                </div>
            </div>

            {/* Визуальная подсказка */}
            <div className="flex items-center gap-2 text-xs text-text-secondary bg-background-secondary p-3 rounded-lg">
                <Circle className="h-4 w-4 shrink-0" />
                <p>
                    A circle with a radius of <span className="font-medium text-brand-primary">{selectedRadius} km</span> will be drawn around the selected point
                </p>
            </div>
        </div>
    );
}
