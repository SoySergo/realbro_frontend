'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { useActiveLocationMode } from '@/features/search-filters/model/use-location-mode';
import { SearchPageHeader } from './_header/ui';
import { SearchPageSidebar } from './_sidebar/ui';
import { CollapsedSidebarToolbar } from './_sidebar/collapsed-toolbar';

interface SlugLayoutClientProps {
    children: ReactNode;
}

/**
 * Клиентская обёртка layout для страницы [slug].
 *
 * Горизонтальный flex: слева — хедер + карта, справа — сайдбар (на всю высоту).
 * При активации режима локации сайдбар сворачивается (w-0),
 * вместо него справа вверху появляется компактная панель кнопок (CollapsedSidebarToolbar),
 * выровненная по высоте хедера.
 *
 * На страницах деталей объектов ([detail]) — сайдбар скрыт,
 * отображается SearchPageHeader (основной хедер) + контент на всю ширину.
 */
export function SlugLayoutClient({ children }: SlugLayoutClientProps) {
    const activeLocationMode = useActiveLocationMode();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isCollapsed = mounted && !!activeLocationMode;

    // Определяем, находимся ли на странице деталей объекта
    const segment = useSelectedLayoutSegment();
    const isDetailPage = segment !== null && segment !== 'map' && segment !== 'catalog';

    // Страница деталей — без сайдбара, только хедер + второй уровень навигации + контент
    if (isDetailPage) {
        return (
            <div className="relative hidden slug-desktop:flex flex-col h-screen bg-background-tertiary">
                {/* Основной хедер (SearchPageHeader) */}
                <div className="shrink-0 p-[5px] pb-0">
                    <SearchPageHeader />
                </div>

                {/* Контент страницы деталей (включая PropertyDetailHeader как sub-header) */}
                <main className="flex-1 min-h-0 overflow-auto">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="relative hidden slug-desktop:flex h-screen p-[5px] bg-background-tertiary">
            {/* Левая секция — хедер + контент */}
            <div className="flex-1 flex flex-col gap-[5px] min-w-0">
                {/* Строка хедера + collapsed toolbar */}
                <div className="flex shrink-0">
                    <div className="flex-1 min-w-0">
                        <SearchPageHeader />
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
    );
}
