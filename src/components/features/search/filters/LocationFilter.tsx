'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, ChevronDown } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { cn } from '@/lib/utils';
import type { LocationFilterMode, IsochroneSettings, RadiusSettings } from '@/types/filter';

/**
 * Фильтр локации
 * Три режима: рисование полигона, изохрон (время до точки), радиус
 */
export function LocationFilter() {
    const t = useTranslations('filters');
    const { locationFilter } = useFilterStore();
    const [open, setOpen] = useState(false);
    const [selectedMode, setSelectedMode] = useState<LocationFilterMode | null>(null);

    // Для изохрона
    const [isochroneSettings, setIsochroneSettings] = useState<Partial<IsochroneSettings>>({
        profile: 'walking',
        minutes: 15,
    });

    // Для радиуса
    const [radiusSettings, setRadiusSettings] = useState<Partial<RadiusSettings>>({
        radiusKm: 5,
    });

    const handleModeSelect = (mode: LocationFilterMode) => {
        setSelectedMode(mode);
        // Не закрываем меню, показываем дополнительные опции
    };

    const handleApply = () => {
        if (!selectedMode) return;

        // TODO: В зависимости от режима, запускаем разную логику
        // Для полигона - активируем режим рисования на карте
        // Для изохрона и радиуса - нужна точка на карте

        console.log('Location filter mode selected:', selectedMode);

        if (selectedMode === 'polygon') {
            // TODO: Активировать режим рисования на карте
            console.log('Activate polygon drawing mode');
        } else if (selectedMode === 'isochrone') {
            console.log('Isochrone settings:', isochroneSettings);
            // TODO: После выбора точки на карте, применить изохрон
        } else if (selectedMode === 'radius') {
            console.log('Radius settings:', radiusSettings);
            // TODO: После выбора точки на карте, применить радиус
        }

        setOpen(false);
    };

    const isActive = !!locationFilter;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'border-input focus-visible:border-ring focus-visible:ring-ring/50',
                        'flex h-9 items-center justify-between gap-2 rounded-md border cursor-pointer',
                        'bg-background dark:bg-input/30 dark:hover:bg-input/50',
                        'px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow]',
                        'outline-none focus-visible:ring-[3px] hover:bg-accent/50',
                        isActive && 'bg-brand-primary-light text-brand-primary border-brand-primary/20 dark:bg-brand-primary/20 dark:text-brand-primary dark:border-brand-primary/30'
                    )}
                >
                    <MapPin className="w-4 h-4" />
                    {t('location')}
                    <ChevronDown className={cn(
                        "w-4 h-4 opacity-50 transition-transform",
                        open && "rotate-180"
                    )} />
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 bg-background border-border" align="start">
                <div className="space-y-4">
                    {/* Выбор режима */}
                    <div className="space-y-2">
                        <Label className="text-text-primary">
                            {t('location')}
                        </Label>

                        <div className="space-y-1">
                            {/* Режим полигона */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleModeSelect('polygon')}
                                className={cn(
                                    'w-full justify-start hover:bg-background-secondary',
                                    selectedMode === 'polygon' && 'bg-brand-primary-light text-brand-primary hover:bg-brand-primary-light'
                                )}
                            >
                                {t('locationDrawArea')}
                            </Button>

                            {/* Режим изохрона */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleModeSelect('isochrone')}
                                className={cn(
                                    'w-full justify-start hover:bg-background-secondary',
                                    selectedMode === 'isochrone' && 'bg-brand-primary-light text-brand-primary hover:bg-brand-primary-light'
                                )}
                            >
                                {t('locationTimeFrom')}
                            </Button>

                            {/* Режим радиуса */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleModeSelect('radius')}
                                className={cn(
                                    'w-full justify-start hover:bg-background-secondary',
                                    selectedMode === 'radius' && 'bg-brand-primary-light text-brand-primary hover:bg-brand-primary-light'
                                )}
                            >
                                {t('locationRadius')}
                            </Button>
                        </div>
                    </div>

                    {/* Дополнительные настройки для изохрона */}
                    {selectedMode === 'isochrone' && (
                        <div className="space-y-3 p-3 bg-background-secondary rounded-md border border-border">
                            {/* Профиль (пешком/велосипед/машина) */}
                            <div className="space-y-2">
                                <Label className="text-xs text-text-secondary">
                                    {t('locationTimeFrom')}
                                </Label>
                                <div className="flex gap-1">
                                    {(['walking', 'cycling', 'driving'] as const).map((profile) => (
                                        <Button
                                            key={profile}
                                            variant={isochroneSettings.profile === profile ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setIsochroneSettings({ ...isochroneSettings, profile })}
                                            className={cn(
                                                'flex-1 text-xs',
                                                isochroneSettings.profile === profile && 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                            )}
                                        >
                                            {t(profile)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Минуты */}
                            <div className="space-y-2">
                                <Label className="text-xs text-text-secondary">
                                    {t('minutes')}
                                </Label>
                                <div className="flex gap-1 flex-wrap">
                                    {[5, 10, 15, 30, 45, 60].map((min) => (
                                        <Button
                                            key={min}
                                            variant={isochroneSettings.minutes === min ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setIsochroneSettings({ ...isochroneSettings, minutes: min })}
                                            className={cn(
                                                'text-xs',
                                                isochroneSettings.minutes === min && 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                            )}
                                        >
                                            {min}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Дополнительные настройки для радиуса */}
                    {selectedMode === 'radius' && (
                        <div className="space-y-2 p-3 bg-background-secondary rounded-md border border-border">
                            <Label className="text-xs text-text-secondary">
                                {t('radiusKm')}
                            </Label>
                            <div className="flex gap-1 flex-wrap">
                                {[1, 3, 5, 10, 15, 20].map((km) => (
                                    <Button
                                        key={km}
                                        variant={radiusSettings.radiusKm === km ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setRadiusSettings({ radiusKm: km })}
                                        className={cn(
                                            'text-xs',
                                            radiusSettings.radiusKm === km && 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                                        )}
                                    >
                                        {km} км
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Кнопка применить */}
                    {selectedMode && (
                        <Button
                            onClick={handleApply}
                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white"
                            size="sm"
                        >
                            {t('apply')}
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
