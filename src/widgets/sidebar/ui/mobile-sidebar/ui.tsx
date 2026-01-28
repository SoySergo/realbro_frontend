'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNavigation } from '../bottom-navigation';
import { MobileFiltersSheet } from '@/widgets/search-filters-bar';

export function MobileSidebar() {
    const pathname = usePathname();
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Проверяем, находимся ли мы на странице поиска (но не на странице конкретного property)
    // Показываем QueriesSelect только на:
    // - /[locale]/search
    // - /[locale]/search/... (с query параметрами)
    // НО НЕ на /[locale]/search/property/[id]
    const isSearchPage = pathname?.includes('/search') && !pathname?.match(/\/search\/property\/[^/]+$/);

    return (
        <>
            {/* Нижняя навигация - всегда видима на мобильных */}
            <BottomNavigation />
        </>
    );
}
