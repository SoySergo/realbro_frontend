'use client';

import { useEffect } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { MapIsochrone } from '@/components/features/location-filter/isochrone/MapIsochrone';
import { MapDraw } from './draw/MapDraw';
import { MapRadius } from './radius';
import { LocationSearchMode } from './search';


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

    // Рендерим панель управления для текущего режима
    return (
        <div className="absolute top-4 left-4 z-10 w-96 max-w-[calc(100vw-2rem)]">
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
    );
}
