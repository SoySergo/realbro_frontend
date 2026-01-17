'use client';

import { useEffect } from 'react';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MapIsochrone } from '@/features/location-isochrone-mode';
import { MapDraw } from '@/features/location-draw-mode';
import { MapRadius } from '@/features/location-radius-mode';
import { LocationSearchMode } from '@/features/location-search-mode';
import { Search, Pencil, Clock, Circle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type MapLocationControllerProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
};

/**
 * Контроллер для управления режимами фильтра локации на карте
 * Отображает соответствующую панель управления в зависимости от activeLocationMode
 * 
 * Поддерживаемые режимы:
 * - search: Поиск и выбор локаций (с OSM полигонами)
 * - draw: Рисование произвольной области
 * - isochrone: Изохрон (время в пути)
 * - radius: Радиус от точки
 */
export function MapLocationController({ map }: MapLocationControllerProps) {
    const { activeLocationMode, setLocationMode } = useFilterStore();

    const LOCATION_MODES = [
        { mode: 'search' as const, icon: Search },
        { mode: 'draw' as const, icon: Pencil },
        { mode: 'isochrone' as const, icon: Clock },
        { mode: 'radius' as const, icon: Circle },
    ];

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

    // Рендерим табы и панель управления для текущего режима
    return (
        <>
            {/* Табы режимов вверху по центру */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {LOCATION_MODES.map(({ mode, icon: Icon }) => {
                    const isActive = activeLocationMode === mode;
                    return (
                        <button
                            key={mode}
                            onClick={() => setLocationMode(mode)}
                            className={cn(
                                'p-2 rounded-lg transition-colors',
                                isActive ? 'bg-brand-primary text-white' : 'bg-background/80 text-text-secondary hover:bg-background-secondary'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    );
                })}
            </div>

            {/* Сама панель режима (ранее в top-left) */}
            <div className="absolute top-16 left-4 z-10 w-96 max-w-[calc(100vw-2rem)]">
                {activeLocationMode === 'isochrone' && (
                    <MapIsochrone
                        map={map}
                        onClose={handleClosePanel}
                    />
                )}

                {activeLocationMode === 'draw' && (
                    <MapDraw
                        map={map}
                        onClose={handleClosePanel}
                    />
                )}

                {activeLocationMode === 'radius' && (
                    <MapRadius
                        map={map}
                        onClose={handleClosePanel}
                    />
                )}

                {activeLocationMode === 'search' && (
                    <LocationSearchMode
                        map={map}
                        onClose={handleClosePanel}
                    />
                )}
            </div>
        </>
    );
}
