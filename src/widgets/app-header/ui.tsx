'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSidebarStore } from '@/widgets/sidebar';
import { useHeaderSlotStore } from './model';
import { Link } from '@/shared/config/routing';

/**
 * AppHeader — общий хедер приложения (desktop, md+).
 *
 * Механика как на YouTube:
 * - Кнопка-гамбургер слева для открытия/закрытия сайдбара
 * - Лого и название справа от кнопки (видны когда сайдбар свёрнут)
 * - Когда сайдбар развёрнут — лого/название скрываются из хедера (они в сайдбаре)
 * - Справа от лого — динамический слот для контента страниц (фильтры, навигация и т.д.)
 */
export function AppHeader() {
    const isExpanded = useSidebarStore((s) => s.isExpanded);
    const toggleExpanded = useSidebarStore((s) => s.toggleExpanded);
    const setPortalTarget = useHeaderSlotStore((s) => s.setPortalTarget);

    // Callback ref для портал-слота
    const slotRef = useCallback(
        (node: HTMLDivElement | null) => {
            setPortalTarget(node);
        },
        [setPortalTarget]
    );

    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-50 h-[52px] flex items-center',
                'bg-background/95 backdrop-blur-md border-b border-border',
                'transition-[left] duration-300 ease-in-out',
                // Хедер начинается после сайдбара
                isExpanded ? 'left-72' : 'left-14'
            )}
        >
            <div className="flex items-center h-full w-full px-3 gap-3">
                {/* Кнопка-гамбургер для сайдбара */}
                <button
                    onClick={toggleExpanded}
                    className={cn(
                        'shrink-0 p-2 rounded-lg cursor-pointer',
                        'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                        'transition-colors duration-150'
                    )}
                    aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Лого + название — видны только когда сайдбар свёрнут */}
                <Link
                    href="/"
                    className={cn(
                        'flex items-center gap-2 shrink-0 transition-all duration-300',
                        isExpanded
                            ? 'w-0 opacity-0 overflow-hidden pointer-events-none'
                            : 'w-auto opacity-100'
                    )}
                >
                    <Image
                        src="/logo.svg"
                        alt="RealBro"
                        width={28}
                        height={28}
                        className="shrink-0 w-7 h-7"
                    />
                    <span className="font-bold text-lg text-text-primary whitespace-nowrap">
                        RealBro
                    </span>
                </Link>

                {/* Динамический слот для контента страниц */}
                <div
                    ref={slotRef}
                    className="flex-1 flex items-center min-w-0 h-full"
                />
            </div>
        </header>
    );
}
