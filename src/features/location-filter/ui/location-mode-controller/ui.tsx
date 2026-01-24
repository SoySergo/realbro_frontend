'use client';

import { useEffect } from 'react';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MapIsochrone } from '@/features/location-isochrone-mode';
import { MapDraw } from '@/features/location-draw-mode';
import { MapRadius } from '@/features/location-radius-mode';
import { LocationSearchMode } from '@/features/location-search-mode';

type MapLocationControllerProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
};

/**
 * Контроллер для управления режимами фильтра локации на карте (Desktop версия)
 * Отображает соответствующую панель управления в зависимости от activeLocationMode
 *
 * ВАЖНО: На desktop иконки режимов НЕ показываются здесь - выбор режима происходит
 * через LocationFilterButton в панели фильтров (SearchFiltersBar)
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

    // Рендерим только панель управления для текущего режима (без табов - они в хедере фильтров)
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
