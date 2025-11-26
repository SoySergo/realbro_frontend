'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { MapPin, ChevronDown, Pencil, Clock, Circle, Search } from 'lucide-react';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { cn } from '@/shared/lib/utils';
import type { LocationFilterMode } from '@/features/location-filter/model';

/**
 * Фильтр локации
 * Четыре режима: полигоны, рисование, изохрон (время до точки), радиус
 * При выборе режима открывается панель деталей локации (второй ряд фильтров)
 */
export function LocationFilterButton() {
    const t = useTranslations('filters');
    const { locationFilter, activeLocationMode, setLocationMode } = useFilterStore();
    const [open, setOpen] = useState(false);

    const locationModes = [
        {
            mode: 'search' as LocationFilterMode,
            icon: Search,
            label: t('locationSearch'),
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

        // Проверяем, есть ли активный режим с несохранёнными данными
        // Эту проверку делаем в самом компоненте режима через useLocalLocationState
        // Здесь просто устанавливаем новый режим
        setLocationMode(mode);

        // Закрываем попап
        setOpen(false);
    };

    const isActive = !!locationFilter || !!activeLocationMode;

    // Определяем активную иконку и лейбл (приоритет activeLocationMode)
    const currentMode = activeLocationMode || locationFilter?.mode;
    const activeMode = currentMode ? locationModes.find(m => m.mode === currentMode) : null;
    const ActiveIcon = activeMode?.icon || MapPin;
    const activeLabel = activeMode?.label || t('location');

    // Подсчёт выбранных параметров
    const getSelectedCount = (): number => {
        if (!locationFilter) return 0;

        switch (locationFilter.mode) {
            case 'search':
                return locationFilter.selectedLocations ? 1 : 0;
            case 'draw':
                return locationFilter.polygon ? 1 : 0;
            case 'isochrone':
                return locationFilter.isochrone ? 1 : 0;
            case 'radius':
                return locationFilter.radius ? 1 : 0;
            default:
                return 0;
        }
    };

    const selectedCount = getSelectedCount();

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
                    <ActiveIcon className="w-4 h-4" />
                    <span>{activeLabel}</span>
                    {selectedCount > 0 && (
                        <span className="text-text-tertiary">({selectedCount})</span>
                    )}
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
                    {locationModes.map(({ mode, icon: Icon, label }) => {
                        const isActiveMode = currentMode != null && currentMode === mode;
                        return (
                            <button
                                key={mode}
                                onClick={() => handleModeSelect(mode)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer',
                                    'text-sm transition-colors duration-150',
                                    'focus:outline-none',
                                    // Активный режим
                                    isActiveMode && 'bg-brand-primary-light text-brand-primary dark:bg-brand-primary dark:text-white',
                                    // Неактивный режим
                                    !isActiveMode && [
                                        'text-text-secondary',
                                        'hover:bg-brand-primary-light hover:text-brand-primary',
                                        'dark:hover:bg-brand-primary dark:hover:text-white'
                                    ]
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
