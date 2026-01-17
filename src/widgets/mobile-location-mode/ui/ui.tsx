'use client';

import { useTranslations } from 'next-intl';
import { X, Search, Pencil, Clock, Circle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MobileRadiusPanel } from '@/features/location-radius-mode/ui/mobile-radius-panel';
import type { LocationFilterMode } from '@/features/location-filter/model';
import type mapboxgl from 'mapbox-gl';

type MobileLocationModeProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
};

// Конфигурация табов режимов
const LOCATION_MODES = [
    { mode: 'search' as LocationFilterMode, icon: Search },
    { mode: 'draw' as LocationFilterMode, icon: Pencil },
    { mode: 'isochrone' as LocationFilterMode, icon: Clock },
    { mode: 'radius' as LocationFilterMode, icon: Circle },
];

/**
 * Мобильный режим работы с локацией
 * Заменяет верхний сайдбар когда активен режим локации на мобильных
 * 
 * Структура:
 * - Вверху: Табы режимов + кнопка закрыть
 * - По центру: Контент текущего режима (под табами)
 * - Внизу: Кнопки "Очистить" и "Сохранить"
 */
export function MobileLocationMode({ map }: MobileLocationModeProps) {
    const t = useTranslations('filters');
    const { activeLocationMode, setLocationMode } = useFilterStore();

    const handleClose = () => {
        setLocationMode(null);
    };

    const handleClear = () => {
        // TODO: Реализовать очистку через соответствующий режим
        console.log('Clear location filter');
    };

    const handleApply = () => {
        // TODO: Реализовать применение через URL/store
        console.log('Apply location filter');
        setLocationMode(null);
    };

    if (!activeLocationMode) return null;

    return (
        <>
            {/* Верхняя панель с заголовком, табами и кнопкой закрыть */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border md:hidden">
                {/* Заголовок и кнопка закрыть */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                    <h2 className="text-base font-semibold text-text-primary">
                        {t('location')}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Табы режимов */}
                <div className="px-3 py-2">
                    <Tabs
                        value={activeLocationMode}
                        onValueChange={(value) => setLocationMode(value as LocationFilterMode)}
                    >
                        <TabsList className="w-full h-10">
                            {LOCATION_MODES.map(({ mode, icon: Icon }) => (
                                <TabsTrigger key={mode} value={mode} className="flex-1 h-8">
                                    <Icon className="w-4 h-4" />
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Кнопки внизу экрана - зафиксированы */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
                {/* Контент режима - над кнопками */}
                <div className="max-h-[35vh] overflow-y-auto border-b border-border">
                    <Tabs value={activeLocationMode}>
                        <TabsContent value="radius" className="m-0">
                            <MobileRadiusPanel map={map} />
                        </TabsContent>

                        <TabsContent value="search" className="m-0">
                            <div className="px-4 py-6 text-center text-sm text-text-secondary">
                                {t('locationSearch')} (в разработке)
                            </div>
                        </TabsContent>

                        <TabsContent value="draw" className="m-0">
                            <div className="px-4 py-6 text-center text-sm text-text-secondary">
                                {t('locationDraw')} (в разработке)
                            </div>
                        </TabsContent>

                        <TabsContent value="isochrone" className="m-0">
                            <div className="px-4 py-6 text-center text-sm text-text-secondary">
                                {t('locationTimeFrom')} (в разработке)
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Кнопки действий */}
                <div className="px-4 py-3 bg-background">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleClear}
                            className="flex-1 h-10"
                            variant="outline"
                        >
                            {t('clear')}
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="flex-1 h-10 bg-brand-primary text-white"
                            variant="default"
                        >
                            {t('apply')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
