'use client';

import { Footprints, Bike, Car, TrafficCone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { IsochroneProfile } from '@/services/mapbox-isochrone';

type IsochroneControlsProps = {
    /** Выбранный профиль передвижения */
    selectedProfile: IsochroneProfile;
    /** Колбэк при изменении профиля */
    onProfileChange: (profile: IsochroneProfile) => void;
    /** Выбранное время в минутах */
    selectedMinutes: number;
    /** Колбэк при изменении времени */
    onMinutesChange: (minutes: number) => void;
};

// Доступные временные интервалы (в минутах)
// Mapbox Isochrone API поддерживает максимум 60 минут
const TIME_STEPS = [5, 10, 15, 30, 45, 60];

// Профили передвижения с иконками
const PROFILES: Array<{
    value: IsochroneProfile;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}> = [
        { value: 'walking', icon: Footprints, label: 'Walking' },
        { value: 'cycling', icon: Bike, label: 'Cycling' },
        { value: 'driving', icon: Car, label: 'Driving' },
        { value: 'driving-traffic', icon: TrafficCone, label: 'With Traffic' },
    ];

/**
 * Форматировать время для отображения
 */
function formatTime(minutes: number): string {
    return `${minutes}min`;
}

/**
 * Компонент управления изохронами
 * Выбор профиля передвижения и времени в пути
 */
export function IsochroneControls({
    selectedProfile,
    onProfileChange,
    selectedMinutes,
    onMinutesChange,
}: IsochroneControlsProps) {
    // Индекс текущего времени в массиве шагов
    const currentStepIndex = TIME_STEPS.indexOf(selectedMinutes);

    // Обработчик изменения слайдера
    const handleSliderChange = (value: number[]) => {
        const newIndex = value[0];
        const newMinutes = TIME_STEPS[newIndex];
        if (newMinutes !== selectedMinutes) {
            onMinutesChange(newMinutes);
        }
    };

    return (
        <div className="space-y-6">
            {/* Выбор профиля передвижения */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-text-primary">
                    Travel Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {PROFILES.map(({ value, icon: Icon, label }) => (
                        <Button
                            key={value}
                            variant="outline"
                            size="sm"
                            onClick={() => onProfileChange(value)}
                            className={cn(
                                'flex flex-col items-center gap-1 h-auto py-3',
                                selectedProfile === value &&
                                'border-brand-primary bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs">{label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Выбор времени в пути */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-primary">
                        Travel Time
                    </label>
                    <span className="text-sm font-mono text-brand-primary">
                        {formatTime(selectedMinutes)}
                    </span>
                </div>

                {/* Слайдер */}
                <div className="px-2">
                    <Slider
                        value={[currentStepIndex >= 0 ? currentStepIndex : 0]}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={TIME_STEPS.length - 1}
                        step={1}
                        className="w-full"
                    />
                </div>

                {/* Метки времени */}
                <div className="flex justify-between text-xs text-text-tertiary px-1">
                    {TIME_STEPS.map((minutes, index) => (
                        <button
                            key={minutes}
                            onClick={() => {
                                if (minutes !== selectedMinutes) {
                                    onMinutesChange(minutes);
                                }
                            }}
                            className={cn(
                                'hover:text-text-primary transition-colors cursor-pointer',
                                currentStepIndex === index && 'text-brand-primary font-medium'
                            )}
                        >
                            {formatTime(minutes)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
