'use client';

import { useEffect, Suspense, useCallback } from 'react';

import { SearchMap } from '@/features/map';
import { SearchFiltersBar } from '@/widgets/search-filters-bar';
import { PropertySidebar } from '@/widgets/property-sidebar';
import { useSidebarStore } from '@/widgets/sidebar';
import { useFilterStore } from '@/widgets/search-filters-bar';

/**
 * SearchPage - страница поиска недвижимости
 * Композиция виджетов: Sidebar + SearchFiltersBar + SearchMap + PropertySidebar
 *
 * Архитектура:
 * - Sidebar слева (desktop + mobile)
 * - SearchFiltersBar вверху (поверх карты)
 * - SearchMap в центре
 * - PropertySidebar справа (список объектов)
 */
function SearchPageContent() {
    const { activeQueryId, queries } = useSidebarStore();
    const { loadFiltersFromQuery, setActiveQueryId, activeQueryId: filterActiveQueryId, activeLocationMode } = useFilterStore();

    // Инициализация фильтров при загрузке страницы
    useEffect(() => {
        if (activeQueryId && !filterActiveQueryId) {
            const query = queries.find((q) => q.id === activeQueryId);
            if (query) {
                loadFiltersFromQuery(query.filters);
                setActiveQueryId(activeQueryId);
                console.log('[SYNC] Initialized filters from active query on page load');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Обработчик клика на объект в списке - центрировать карту
    const handlePropertyClick = useCallback((property: { id: string; coordinates: { lat: number; lng: number } }) => {
        console.log('Property clicked:', property.id);
        // TODO: Центрировать карту на координатах объекта
    }, []);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Основной контент */}
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex">
                {/* Контейнер карты и фильтров */}
                <div className="flex-1 relative">
                    {/* Отступ сверху для мобильного верхнего меню - скрываем когда активен режим локации */}
                    {!activeLocationMode && <div className="h-[60px] md:hidden" />}

                    {/* Контейнер карты/списка и фильтров */}
                    <div className="relative h-[calc(100vh-5rem)] md:h-screen w-full">
                        {/* Панель фильтров поверх карты - только на desktop */}
                        <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
                            <SearchFiltersBar />
                        </div>

                        {/* Контент: карта (отступ сверху для фильтров на desktop) */}
                        <div className="absolute z-10 inset-0 md:pt-[60px]">
                            <SearchMap />
                        </div>
                    </div>
                </div>

                {/* Сайдбар со списком объектов - только на desktop */}
                <div className="hidden md:block">
                    <PropertySidebar
                        onPropertyClick={handlePropertyClick}
                        className="h-screen"
                    />
                </div>
            </main>
        </div>
    );
}

export function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchPageContent />
        </Suspense>
    );
}
