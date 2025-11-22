'use client';

import { useFilterStore } from '@/store/filterStore';

// Импорты компонентов режимов локации
import {
    LocationSearchMode,
    LocationDrawMode,
    LocationIsochroneMode,
    LocationRadiusMode,
} from './location-details';

/**
 * Панель деталей локации (второй ряд фильтров)
 * Показывается при выборе режима в LocationFilter
 * Содержит специфичные настройки для каждого режима
 */

export function LocationDetailsBar() {
    const { activeLocationMode } = useFilterStore();

    if (!activeLocationMode) return null;

    // Получаем колбэки из глобального объекта карты
    const getMapCallbacks = () => window.mapCallbacks;

    // Рендер компонента в зависимости от активного режима
    const renderModeContent = () => {
        const callbacks = getMapCallbacks();

        switch (activeLocationMode) {
            case 'search':
                return <LocationSearchMode />;
            case 'draw':
                return (
                    <LocationDrawMode
                        onActivateDrawing={() => callbacks?.activateDrawing()}
                        onDeletePolygon={(id) => callbacks?.deletePolygon(id)}
                        drawnPolygon={callbacks?.getDrawnPolygon() ?? null}
                    />
                );
            case 'isochrone':
                return (
                    <LocationIsochroneMode
                        onSelectPoint={() => callbacks?.selectPoint()}
                        onShowIsochrone={(polygon, color) => callbacks?.showIsochrone(polygon, color)}
                        onClearIsochrone={() => callbacks?.clearIsochrone()}
                        selectedCoordinates={callbacks?.getSelectedPoint() ?? null}
                    />
                );
            case 'radius':
                return (
                    <LocationRadiusMode
                        onSelectPoint={() => callbacks?.selectPoint()}
                        onShowRadius={(center, radius) => callbacks?.showRadius(center, radius)}
                        onClearRadius={() => callbacks?.clearRadius()}
                        selectedCoordinates={callbacks?.getSelectedPoint() ?? null}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full bg-background border-b border-border shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto">
                {/* Контент в зависимости от режима (включает кнопки управления с X) */}
                {renderModeContent()}
            </div>
        </div>
    );
}
