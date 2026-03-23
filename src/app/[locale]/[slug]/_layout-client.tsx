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
 * Реагирует на activeLocationMode из Zustand:
 * — когда режим локации активен, сайдбар сворачивается,
 *   карта разворачивается на всю ширину,
 *   а панель кнопок остаётся справа от хедера (там, где был хедер сайдбара).
 */
export function SlugLayoutClient({ children }: SlugLayoutClientProps) {
    const activeLocationMode = useActiveLocationMode();
    const isCollapsed = !!activeLocationMode;

    return (
        <div className="hidden slug-desktop:flex flex-col h-screen p-[5px] gap-[5px] bg-background-tertiary">
            {/* Верхний ряд — хедер + свёрнутая панель сайдбара (справа) */}
            <div className="flex gap-[5px] shrink-0">
                <div className="flex-1 min-w-0">
                    <SearchPageHeader />
                </div>
                <CollapsedSidebarToolbar visible={isCollapsed} />
            </div>

            {/* Нижний ряд — контент (карта) + сайдбар */}
            <div className="flex-1 flex gap-[5px] min-h-0">
                <main className="flex-1 min-h-0">
                    {children}
                </main>

                {/* Правый сайдбар — анимируемая ширина */}
                <div
                    className={cn(
                        'transition-[width,opacity] duration-300 ease-in-out shrink-0 overflow-hidden',
                        isCollapsed ? 'w-0 opacity-0' : 'w-[450px] slug-xl:w-[520px] opacity-100'
                    )}
                >
                    <SearchPageSidebar />
                </div>
            </div>
        </div>
    );
}
