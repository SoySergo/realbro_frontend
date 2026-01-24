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
 *
 * При сохранении показывает название режима + количество элементов
 * Например: "Рисование (+2)" или "Поиск (+3)"
 */
export function LocationFilterButton() {
    const t = useTranslations('filters');
    const tLocationFilter = useTranslations('locationFilter.modes');
    const { locationFilter, activeLocationMode, setLocationMode } = useFilterStore();
    const [open, setOpen] = useState(false);

    const locationModes = [
        {
            mode: 'search' as LocationFilterMode,
            icon: Search,
            label: t('locationSearch'),
            shortLabel: tLocationFilter('search'),
        },
        {
            mode: 'draw' as LocationFilterMode,
            icon: Pencil,
            label: t('locationDraw'),
            shortLabel: tLocationFilter('draw'),
        },
        {
            mode: 'isochrone' as LocationFilterMode,
            icon: Clock,
            label: t('locationTimeFrom'),
            shortLabel: tLocationFilter('isochrone'),
        },
        {
            mode: 'radius' as LocationFilterMode,
            icon: Circle,
            label: t('locationRadius'),
            shortLabel: tLocationFilter('radius'),
        },
    ];

    const handleModeSelect = (mode: LocationFilterMode) => {
        console.log('Location filter mode selected:', mode);
        setLocationMode(mode);
        setOpen(false);
    };

    // Проверяем есть ли сохранённый фильтр локации
    const hasSavedFilter = !!locationFilter;
    const isActive = hasSavedFilter || !!activeLocationMode;

    // Определяем текущий режим для отображения
    const currentMode = locationFilter?.mode || activeLocationMode;
    const activeMode = currentMode ? locationModes.find(m => m.mode === currentMode) : null;
    const ActiveIcon = activeMode?.icon || MapPin;

    // Подсчёт выбранных параметров для каждого режима
    const getSelectedCount = (): number => {
        if (!locationFilter) return 0;

        switch (locationFilter.mode) {
            case 'search':
                return locationFilter.selectedLocations?.length || 0;
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

    // Формируем текст кнопки
    const getButtonLabel = (): string => {
        if (hasSavedFilter && activeMode) {
            // Если есть сохранённый фильтр - показываем короткое название режима
            return activeMode.shortLabel;
        }
        if (activeLocationMode && activeMode) {
            // Если режим активен но не сохранён - показываем полное название
            return activeMode.label;
        }
        // По умолчанию
        return t('location');
    };

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
                        // Активное состояние с сохранённым фильтром
                        hasSavedFilter && 'bg-brand-primary-light border-brand-primary text-brand-primary',
                        hasSavedFilter && 'dark:bg-brand-primary dark:text-white'
                    )}
                >
                    <ActiveIcon className="w-4 h-4" />
                    <span>{getButtonLabel()}</span>
                    {selectedCount > 0 && (
                        <span className={cn(
                            'text-xs font-medium',
                            hasSavedFilter ? 'text-brand-primary dark:text-white' : 'text-text-tertiary'
                        )}>
                            (+{selectedCount})
                        </span>
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
                        const isActiveMode = currentMode === mode;
                        const isSavedMode = locationFilter?.mode === mode;

                        return (
                            <button
                                key={mode}
                                onClick={() => handleModeSelect(mode)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer',
                                    'text-sm transition-colors duration-150',
                                    'focus:outline-none',
                                    // Сохранённый режим
                                    isSavedMode && 'bg-brand-primary text-white',
                                    // Активный но не сохранённый
                                    isActiveMode && !isSavedMode && 'bg-brand-primary-light text-brand-primary dark:bg-brand-primary/20',
                                    // Неактивный режим
                                    !isActiveMode && !isSavedMode && [
                                        'text-text-secondary',
                                        'hover:bg-brand-primary-light hover:text-brand-primary',
                                        'dark:hover:bg-brand-primary/20 dark:hover:text-white'
                                    ]
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1 text-left">{label}</span>
                                {isSavedMode && selectedCount > 0 && (
                                    <span className="text-xs font-medium opacity-80">
                                        (+{selectedCount})
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
