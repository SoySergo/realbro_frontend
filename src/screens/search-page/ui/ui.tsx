'use client';

import { useEffect, Suspense, useCallback } from 'react';

import { SearchMap } from '@/features/map';
import { SearchFiltersBar, useFilterStore } from '@/widgets/search-filters-bar';
import { MapSidebar } from '@/widgets/map-sidebar';
import { PropertyListing } from '@/widgets/property-listing';
import { useSidebarStore } from '@/widgets/sidebar';
import type { Property } from '@/entities/property';

/**
 * SearchPage - страница поиска недвижимости
 *
 * Два режима работы:
 * 1. Режим карты (map) - карта + правый сайдбар со списком объектов
 * 2. Режим списка (list) - полноэкранный листинг без карты
 *
 * Переключение режимов:
 * - В SearchFiltersBar есть toggle переключения
 * - В MapSidebar есть кнопка "Список"
 * - В PropertyListing есть кнопка "На карте"
 */
function SearchPageContent() {
    const { activeQueryId, queries } = useSidebarStore();
    const {
        loadFiltersFromQuery,
        setActiveQueryId,
        activeQueryId: filterActiveQueryId,
        activeLocationMode,
        searchViewMode,
    } = useFilterStore();

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

    // Обработчик клика на объект - центрировать карту
    const handlePropertyClick = useCallback(
        (property: Property) => {
            console.log('Property clicked:', property.id);
            // TODO: Центрировать карту на координатах объекта
        },
        []
    );

    // Обработчик наведения - подсветить на карте
    const handlePropertyHover = useCallback((property: Property | null) => {
        // TODO: Подсветить маркер на карте
        if (property) {
            console.log('Property hover:', property.id);
        }
    }, []);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Основной контент */}
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex">
                {searchViewMode === 'map' ? (
                    // === РЕЖИМ КАРТЫ ===
                    <>
                        {/* Контейнер карты и фильтров */}
                        <div className="flex-1 relative">
                            {/* Отступ сверху для мобильного верхнего меню - скрываем когда активен режим локации */}
                            {!activeLocationMode && <div className="h-[60px] md:hidden" />}

                            {/* Контейнер карты и фильтров */}
                            <div className="relative h-[calc(100vh-5rem)] md:h-screen w-full">
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
                    </>
                ) : (
                    // === РЕЖИМ СПИСКА ===
                    <div className="flex-1 flex flex-col">
                        {/* Панель фильтров вверху */}
                        <div className="shrink-0">
                            <SearchFiltersBar />
                        </div>

                        {/* Листинг объектов */}
                        <div className="flex-1 overflow-hidden">
                            <PropertyListing
                                onPropertyClick={handlePropertyClick}
                                className="h-full"
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export function SearchPage() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchPageContent />
        </Suspense>
    );
}

/**
 * Скелетон загрузки страницы
 */
function SearchPageSkeleton() {
    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex">
                <div className="flex-1 relative">
                    {/* Скелетон фильтров */}
                    <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
                        <div className="w-full bg-background-secondary border-b border-border">
                            <div className="flex items-center gap-2 px-4 py-3">
                                <div className="h-8 w-32 bg-background animate-pulse rounded" />
                                <div className="h-8 w-24 bg-background animate-pulse rounded" />
                                <div className="h-8 w-24 bg-background animate-pulse rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Скелетон карты */}
                    <div className="absolute z-10 inset-0 md:pt-[60px] bg-background-secondary animate-pulse" />
                </div>

                {/* Скелетон сайдбара */}
                <div className="hidden md:block w-80 bg-background border-l border-border">
                    <div className="p-3 border-b border-border">
                        <div className="h-8 w-full bg-background-secondary animate-pulse rounded" />
                    </div>
                    <div className="p-3 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-24 bg-background-secondary animate-pulse rounded-lg"
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
