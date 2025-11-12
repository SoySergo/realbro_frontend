'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
    const { activeLocationMode, setLocationMode } = useFilterStore();

    if (!activeLocationMode) return null;

    const handleClose = () => {
        setLocationMode(null);
    };

    // Рендер компонента в зависимости от активного режима
    const renderModeContent = () => {
        switch (activeLocationMode) {
            case 'search':
                return <LocationSearchMode />;
            case 'draw':
                return <LocationDrawMode onActivateDrawing={handleDrawActivate} />;
            case 'isochrone':
                return <LocationIsochroneMode onApply={handleIsochroneApply} />;
            case 'radius':
                return <LocationRadiusMode onApply={handleRadiusApply} />;
            default:
                return null;
        }
    };

    // Обработчики для режимов draw, isochrone, radius (не для search)
    const handleDrawActivate = () => {
        console.log('Activate drawing mode');
        // TODO: Интеграция с картой для рисования
    };

    const handleIsochroneApply = (profile: 'walking' | 'cycling' | 'driving', minutes: number) => {
        console.log('Apply isochrone filter:', { profile, minutes });
        handleClose();
    };

    const handleRadiusApply = (radiusKm: number) => {
        console.log('Apply radius filter:', { radiusKm });
        handleClose();
    };

    return (
        <div className="w-full bg-background border-b border-border shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto">
                {/* Контент в зависимости от режима */}
                {renderModeContent()}

                {/* Кнопка закрыть */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
