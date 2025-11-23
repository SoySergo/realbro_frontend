'use client';

import { useEffect, useState } from 'react';
import { Map, List } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { SearchMap } from '@/components/features/map/SearchMap';
import { FilterBar } from '@/components/features/search/FilterBar';
import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/store/sidebarStore';
import { useFilterStore } from '@/store/filterStore';

type ViewMode = 'map' | 'list';

export default function SearchPage() {
    const { activeQueryId, queries } = useSidebarStore();
    const { loadFiltersFromQuery, setActiveQueryId, activeQueryId: filterActiveQueryId } = useFilterStore();
    const [viewMode, setViewMode] = useState<ViewMode>('map');

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

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar (Desktop + Mobile) */}
            <Sidebar />

            {/* Основной контент */}
            <main className="flex-1 md:ml-16 pb-16 md:pb-0">
                {/* Отступ сверху для мобильного верхнего меню */}
                <div className="h-20 md:hidden" />

                {/* Контейнер карты/списка и фильтров */}
                <div className="relative h-[calc(100vh-5rem)] md:h-screen w-full">
                    {/* Панель фильтров поверх карты */}
                    <div className="absolute top-0 left-0 right-0 z-50">
                        <FilterBar />
                    </div>

                    {/* Переключатель режима просмотра */}
                    <div className="absolute top-16 right-4 z-40 flex gap-2">
                        <Button
                            variant={viewMode === 'map' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('map')}
                            className="gap-2"
                        >
                            <Map className="w-4 h-4" />
                            Карта
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="gap-2"
                        >
                            <List className="w-4 h-4" />
                            Список
                        </Button>
                    </div>

                    {/* Контент: карта или список (отступ сверху для фильтров ~60px) */}
                    <div className="absolute z-10 inset-0 pt-[60px]">
                        {viewMode === 'map' ? (
                            <SearchMap />
                        ) : (
                            <div className="h-full w-full overflow-y-auto bg-background p-4">
                                {/* TODO: Список недвижимости */}
                                <div className="text-center text-text-secondary mt-20">
                                    Список недвижимости (в разработке)
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
