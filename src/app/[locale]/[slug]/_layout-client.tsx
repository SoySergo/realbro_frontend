'use client';

import { type ReactNode, useState, useEffect } from 'react';
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
 * Desktop (>= 900px):
 * Горизонтальный flex: слева — хедер + карта, справа — сайдбар (на всю высоту).
 * При активации режима локации сайдбар сворачивается (w-0),
 * вместо него справа вверху появляется компактная панель кнопок (CollapsedSidebarToolbar),
 * выровненная по высоте хедера.
 *
 * Mobile (< 900px):
 * Полноэкранный контейнер, children занимают весь экран.
 * Мобильные элементы (bottom sheet, кнопки) рендерятся внутри страниц.
 */
export function SlugLayoutClient({ children }: SlugLayoutClientProps) {
    const activeLocationMode = useActiveLocationMode();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isCollapsed = mounted && !!activeLocationMode;

    return (
        <>
            {/* Desktop layout */}
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

            {/* Mobile layout — полноэкранный контейнер */}
            <div className="slug-desktop:hidden h-dvh flex flex-col overflow-hidden bg-background">
                {children}
            </div>
        </>
    );
}
