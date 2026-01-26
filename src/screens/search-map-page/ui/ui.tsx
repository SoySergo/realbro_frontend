'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

import {
    SearchFiltersBar,
    useFilterStore,
    MobileSearchHeader,
    MobileViewToggle,
    MobileFiltersSheet,
} from '@/widgets/search-filters-bar';
import { MapSidebar } from '@/widgets/map-sidebar';
import { useSidebarStore } from '@/widgets/sidebar';
import type { Property } from '@/entities/property';

// Lazy load Mapbox для оптимизации
const SearchMap = dynamic(
    () => import('@/features/map').then((mod) => ({ default: mod.SearchMap })),
    {
        ssr: false,
        loading: () => <MapLoadingPlaceholder />,
    }
);

/**
 * SearchMapPage - клиентская страница с картой
 *
 * - Полностью клиентский рендеринг
 * - Lazy loading Mapbox GL JS
 * - Синхронизация фильтров через URL параметры
 */
export function SearchMapPage() {
    const searchParams = useSearchParams();
    const { activeQueryId, queries } = useSidebarStore();
    const {
        loadFiltersFromQuery,
        setActiveQueryId,
        activeQueryId: filterActiveQueryId,
        activeLocationMode,
        setLocationMode,
    } = useFilterStore();

    // Состояние мобильного sheet фильтров
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Проверяем, нужно ли автоматически открыть режим рисования
    const autoOpenDraw = searchParams.get('openDraw') === 'true';

    // Инициализация фильтров при загрузке страницы
    useEffect(() => {
        if (activeQueryId && !filterActiveQueryId) {
            const query = queries.find((q) => q.id === activeQueryId);
            if (query) {
                loadFiltersFromQuery(query.filters);
                setActiveQueryId(activeQueryId);
                console.log('[SearchMapPage] Initialized filters from active query');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Автоматически открыть режим рисования при редиректе с листинга
    useEffect(() => {
        if (autoOpenDraw && !activeLocationMode) {
            setLocationMode('draw');
            console.log('[SearchMapPage] Auto-opened draw mode from redirect');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoOpenDraw]);

    // Обработчик клика на объект - центрировать карту
    const handlePropertyClick = useCallback((property: Property) => {
        console.log('Property clicked:', property.id);
        // TODO: Центрировать карту на координатах объекта
    }, []);

    // Обработчик наведения - подсветить на карте
    const handlePropertyHover = useCallback((property: Property | null) => {
        if (property) {
            console.log('Property hover:', property.id);
        }
    }, []);

    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex flex-col md:flex-row">
                {/* Мобильный хедер с фильтрами - только на мобильных */}
                {!activeLocationMode && (
                    <div className="md:hidden">
                        <MobileSearchHeader onOpenFilters={() => setIsMobileFiltersOpen(true)} />
                    </div>
                )}

                {/* Мобильный sheet фильтров */}
                <MobileFiltersSheet
                    open={isMobileFiltersOpen}
                    onOpenChange={setIsMobileFiltersOpen}
                />

                {/* Кнопка переключения карта/список - только на мобильных */}
                <div className="md:hidden">
                    <MobileViewToggle />
                </div>

                {/* Контейнер карты и фильтров */}
                <div className="flex-1 relative">
                    <div className="relative h-[calc(100vh-8rem)] md:h-screen w-full">
                        {/* Панель фильтров поверх карты - только на desktop */}
                        <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
                            <SearchFiltersBar />
                        </div>

                        {/* Карта (отступ сверху для фильтров на desktop) */}
                        <div className="absolute z-10 inset-0 md:pt-[60px]">
                            <SearchMap />
                        </div>
                    </div>
                </div>

                {/* Сайдбар со списком объектов - только на desktop */}
                <div className="hidden md:block">
                    <MapSidebar
                        onPropertyClick={handlePropertyClick}
                        onPropertyHover={handlePropertyHover}
                        className="fixed right-0 h-screen z-40 mt-[52px]"
                    />
                </div>
            </main>
        </div>
    );
}

/**
 * Плейсхолдер загрузки карты
 */
function MapLoadingPlaceholder() {
    return (
        <div className="w-full h-full bg-background-secondary flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    {/* Анимированная иконка карты */}
                    <svg
                        className="w-16 h-16 text-text-tertiary animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                    </svg>
                    {/* Спиннер */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
                <p className="text-sm text-text-secondary">Загрузка карты...</p>
            </div>
        </div>
    );
}
