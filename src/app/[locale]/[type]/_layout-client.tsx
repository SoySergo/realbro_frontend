'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { useActiveLocationMode } from '@/features/search-filters/model/use-location-mode';
import { usePathname } from '@/shared/config/routing';
import { SearchPageHeader } from './_header/ui';
import { CatalogScrollHeader } from './_header/catalog-scroll-header';
import { SearchPageSidebar } from './_sidebar/ui';
import { CollapsedSidebarToolbar } from './_sidebar/collapsed-toolbar';
import { CatalogContext } from './_catalog-context';

interface SlugLayoutClientProps {
    children: ReactNode;
}

/**
 * Клиентская обёртка layout для страницы [slug].
 *
 * Desktop (>= 900px):
 * Горизонтальный flex: слева — хедер + карта, справа — сайдбар (на всю высоту).
 * При активации режима локации сайдбар сворачивается (w-0),
 * вместо него справа вверху появляется компактная панель кнопок (CollapsedSidebarToolbar),
 * выровненная по высоте хедера.
 *
 * На страницах деталей объектов ([detail]) — сайдбар скрыт,
 * отображается SearchPageHeader (основной хедер) + контент на всю ширину.
 * Mobile (< 900px):
 * Полноэкранный контейнер, children занимают весь экран.
 * Мобильные элементы (bottom sheet, кнопки) рендерятся внутри страниц.
 * Два режима:
 * 1. Карта (map) — горизонтальный flex: хедер + карта слева, сайдбар справа.
 * 2. Каталог (catalog) — полноширинный контент без сайдбара.
 *    При скролле фильтров из видимой области хедер подменяется на CatalogScrollHeader.
 */
export function SlugLayoutClient({ children }: SlugLayoutClientProps) {
    const pathname = usePathname();
    const activeLocationMode = useActiveLocationMode();
    const [mounted, setMounted] = useState(false);
    const [catalogFiltersVisible, setCatalogFiltersVisible] = useState(true);

    useEffect(() => setMounted(true), []);

    const isCollapsed = mounted && !!activeLocationMode;
    const isCatalog = pathname?.endsWith('/catalog');

    // Каталог — полноширинный layout без сайдбара, работает и на мобильных
    if (isCatalog) {
        return (
            <CatalogContext.Provider
                value={{
                    filtersVisible: catalogFiltersVisible,
                    setFiltersVisible: setCatalogFiltersVisible,
                }}
            >
                <div className="flex flex-col min-h-screen bg-background slug-desktop:bg-background-tertiary">
                    {/* Desktop header — scrolls with page, not fixed */}
                    <div className="hidden slug-desktop:block shrink-0">
                        <SearchPageHeader />
                    </div>
                    <main className="flex-1 min-h-0 slug-desktop:px-[5px] slug-desktop:pb-[5px]">
                        {children}
                    </main>
                </div>
            </CatalogContext.Provider>
        );
    }

    // Определяем, находимся ли на странице деталей объекта
    const segment = useSelectedLayoutSegment();
    const isDetailPage = segment !== null && segment !== 'map' && segment !== 'catalog';

    // Страница деталей — без сайдбара, только хедер + второй уровень навигации + контент
    if (isDetailPage) {
        return (
            <div className="relative hidden slug-desktop:flex flex-col h-screen bg-background-tertiary">
                {/* Основной хедер — full-width */}
                <div className="shrink-0">
                    <SearchPageHeader />
                </div>

                {/* Контент страницы деталей */}
                <main className="flex-1 min-h-0 overflow-auto">
                    {children}
                </main>
            </div>
        );
    }

    // Карта — оригинальный layout с сайдбаром
    return (
        <>
            {/* Desktop layout */}
            <div className="relative hidden slug-desktop:flex h-screen p-[5px] bg-background-tertiary">
                {/* Левая секция — хедер + контент */}
                <div className="flex-1 flex flex-col gap-[5px] min-w-0">
                    {/* Строка хедера + collapsed toolbar */}
                    <div className="flex shrink-0">
                        <div className="flex-1 min-w-0">
                            <SearchPageHeader floating />
                        </div>
                        <CollapsedSidebarToolbar visible={isCollapsed} />
                    </div>
                    <main className="flex-1 min-h-0">
                        {children}
                    </main>
                </div>

                {/* Правый сайдбар — анимируемая ширина, на всю высоту */}
                <div
                    className={cn(
                        'transition-[width,opacity] duration-300 ease-in-out shrink-0 overflow-hidden will-change-[width,opacity]',
                        isCollapsed ? 'w-0 opacity-0' : 'w-[400px] slug-xl:w-[660px] ml-[5px] opacity-100'
                    )}
                >
                    <SearchPageSidebar />
                </div>
            </div>

            {/* Mobile layout — полноэкранный контейнер */}
            <div className="slug-desktop:hidden h-dvh flex flex-col overflow-hidden bg-background">
                {children}
            </div>
        </>
    );
}
