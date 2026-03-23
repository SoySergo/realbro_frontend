'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MapIsochrone } from '@/features/location-isochrone-mode';
import { MapDraw } from '@/features/location-draw-mode';
import { MapRadius } from '@/features/location-radius-mode';
import { LocationSearchMode } from '@/features/location-search-mode';
import { Search, Pencil, Clock, Circle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/ui/tooltip';
import type { LocationFilterMode } from '@/features/location-filter/model';

type MapLocationControllerProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
};

const LOCATION_MODES: { mode: LocationFilterMode; icon: typeof Search }[] = [
    { mode: 'search', icon: Search },
    { mode: 'draw', icon: Pencil },
    { mode: 'isochrone', icon: Clock },
    { mode: 'radius', icon: Circle },
];

/**
 * Контроллер для управления режимами фильтра локации на карте (Desktop версия)
 * Отображает табы для выбора режима + соответствующую панель управления
 *
 * Поддерживаемые режимы:
 * - search: Поиск и выбор локаций (с OSM полигонами)
 * - draw: Рисование произвольной области
 * - isochrone: Изохрон (время в пути)
 * - radius: Радиус от точки
 */
export function MapLocationController({ map }: MapLocationControllerProps) {
    const { activeLocationMode, setLocationMode, locationFilter } = useFilterStore();
    const t = useTranslations('locationFilter.modes');

    // Логирование смены режима
    useEffect(() => {
        if (activeLocationMode) {
            console.log('[MapLocationController] Active mode:', activeLocationMode);
        }
    }, [activeLocationMode]);

    // Обработчик закрытия панели
    const handleClosePanel = () => {
        setLocationMode(null);
        console.log('[MapLocationController] Panel closed');
    };

    // Если нет активного режима - ничего не показываем
    if (!activeLocationMode) {
        return null;
    }

    return (
        <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100vw-2rem)] flex flex-col gap-2">
            {/* Табы выбора режима — иконки с тултипами */}
            <TooltipProvider delayDuration={300}>
                <div className="flex bg-background border border-border rounded-lg overflow-hidden shadow-md">
                    {LOCATION_MODES.map(({ mode, icon: Icon }) => (
                        <Tooltip key={mode}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setLocationMode(mode)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center py-3.5',
                                        'transition-colors cursor-pointer',
                                        'border-b-2',
                                        activeLocationMode === mode
                                            ? 'border-brand-primary text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10'
                                            : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {t(mode)}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>

            {/* Панель управления текущего режима */}
            {activeLocationMode === 'isochrone' && (
                <MapIsochrone
                    map={map}
                    onClose={handleClosePanel}
                    initialData={locationFilter?.mode === 'isochrone' ? locationFilter.isochrone : undefined}
                />
            )}

            {activeLocationMode === 'draw' && (
                <MapDraw
                    map={map}
                    onClose={handleClosePanel}
                    initialData={locationFilter?.mode === 'draw' ? locationFilter.polygons : undefined}
                />
            )}

            {activeLocationMode === 'radius' && (
                <MapRadius
                    map={map}
                    onClose={handleClosePanel}
                    initialData={locationFilter?.mode === 'radius' ? locationFilter.radius : undefined}
                />
            )}

            {activeLocationMode === 'search' && (
                <LocationSearchMode
                    map={map}
                    onClose={handleClosePanel}
                    initialLocations={locationFilter?.mode === 'search' ? locationFilter.selectedLocations : undefined}
                />
            )}
        </div>
    );
}
