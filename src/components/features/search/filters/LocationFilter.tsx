'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, ChevronDown, Pencil, Clock, Circle } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { cn } from '@/lib/utils';
import type { LocationFilterMode } from '@/types/filter';

/**
 * Фильтр локации
 * Четыре режима: полигоны, рисование, изохрон (время до точки), радиус
 * При выборе режима открывается панель деталей локации (второй ряд фильтров)
 */
export function LocationFilter() {
    const t = useTranslations('filters');
    const { locationFilter, setLocationMode } = useFilterStore();
    const [open, setOpen] = useState(false);

    const locationModes = [
        {
            mode: 'polygon' as LocationFilterMode,
            icon: MapPin,
            label: t('locationPolygons'),
        },
        {
            mode: 'draw' as LocationFilterMode,
            icon: Pencil,
            label: t('locationDraw'),
        },
        {
            mode: 'isochrone' as LocationFilterMode,
            icon: Clock,
            label: t('locationTimeFrom'),
        },
        {
            mode: 'radius' as LocationFilterMode,
            icon: Circle,
            label: t('locationRadius'),
        },
    ];

    const handleModeSelect = (mode: LocationFilterMode) => {
        console.log('Location filter mode selected:', mode);

        // Устанавливаем режим в стор - это откроет панель деталей
        setLocationMode(mode);

        // Закрываем попап
        setOpen(false);
    };

    const isActive = !!locationFilter;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'flex h-9 items-center justify-between gap-2 rounded-md cursor-pointer',
                        'px-3 py-2 text-sm whitespace-nowrap transition-all duration-200',
                        // Светлая тема: белый фон
                        'bg-background',
                        // Тёмная тема: без бордера
                        'border border-border dark:border-transparent',
                        // Текст
                        'text-text-primary hover:text-text-primary',
                        // Активное состояние
                        isActive && 'text-text-primary'
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

            <PopoverContent
                className="w-[280px] p-2 bg-background border-border"
                align="start"
            >
                <div className="space-y-1">
                    {locationModes.map(({ mode, icon: Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => handleModeSelect(mode)}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer',
                                'text-sm text-text-secondary transition-colors duration-150',
                                // Ховер: синий фон в обеих темах
                                'hover:bg-brand-primary-light hover:text-brand-primary',
                                'dark:hover:bg-brand-primary dark:hover:text-white',
                                // Фокус
                                'focus:outline-none focus:bg-brand-primary-light focus:text-brand-primary',
                                'dark:focus:bg-brand-primary dark:focus:text-white'
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
