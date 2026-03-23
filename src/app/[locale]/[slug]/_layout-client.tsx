'use client';

import { type ReactNode } from 'react';
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
 */
export function SlugLayoutClient({ children }: SlugLayoutClientProps) {
    const activeLocationMode = useActiveLocationMode();
    const isCollapsed = !!activeLocationMode;

    return (
        <div className="relative hidden slug-desktop:flex h-screen p-[5px] gap-[5px] bg-background-tertiary">
            {/* Левая секция — хедер + контент (растягивается на всю ширину при свёрнутом сайдбаре) */}
            <div className="flex-1 flex flex-col gap-[5px] min-w-0">
                <SearchPageHeader />
                <main className="flex-1 min-h-0">
                    {children}
                </main>
            </div>

            {/* Панель кнопок при свёрнутом сайдбаре — абсолютно позиционирована справа вверху */}
            <CollapsedSidebarToolbar visible={isCollapsed} />

            {/* Правый сайдбар — анимируемая ширина */}
            <div
                className={cn(
                    'transition-[width,opacity] duration-300 ease-in-out shrink-0 overflow-hidden will-change-[width,opacity]',
                    isCollapsed ? 'w-0 opacity-0' : 'w-[450px] slug-xl:w-[520px] opacity-100'
                )}
            >
                <SearchPageSidebar />
            </div>
        </div>
    );
}
