'use client';

import { usePathname } from 'next/navigation';
import { BottomNavigation } from './BottomNavigation';
import { QueriesSelect } from './QueriesSelect';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function MobileSidebar() {
    const t = useTranslations('sidebar');
    const pathname = usePathname();

    // Проверяем, находимся ли мы на странице поиска (но не на странице конкретного property)
    // Показываем QueriesSelect только на:
    // - /[locale]/search
    // - /[locale]/search/... (с query параметрами)
    // НО НЕ на /[locale]/search/property/[id]
    const isSearchPage = pathname.includes('/search') && !pathname.match(/\/search\/property\/[^/]+$/);

    return (
        <>
            {/* Верхнее меню с селектором queries - только на страницах поиска */}
            {isSearchPage && (
                <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border md:hidden">
                    <div className="px-4 py-3 flex items-center gap-2">
                        {/* Queries Select занимает основное место */}
                        <div className="flex-1 min-w-0">
                            <QueriesSelect />
                        </div>

                        {/* Кнопки фильтров и сортировки */}
                        <button
                            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                            aria-label={t('filters')}
                        >
                            <SlidersHorizontal className="w-5 h-5 text-text-secondary" />
                        </button>
                        <button
                            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                            aria-label={t('sort')}
                        >
                            <ArrowUpDown className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>
                </div>
            )}

            {/* Нижняя навигация - всегда видима на мобильных */}
            <BottomNavigation />
        </>
    );
}
