/**
 * Типы для сайдбара навигации
 */

import type { SearchFilters } from '@/entities/filter';

// Поисковый запрос (как вкладка браузера)
export type SearchQuery = {
    id: string;
    title: string;
    filters: SearchFilters; // Полная структура фильтров
    resultsCount?: number;
    newResultsCount?: number; // Количество новых результатов
    isLoading?: boolean; // Флаг загрузки данных
    createdAt: Date;
    lastUpdated: Date;
};

// Навигационные элементы сайдбара
export type NavigationItem = {
    id: string;
    label: string;
    icon: string; // Имя иконки из lucide-react
    href: string;
    badge?: number; // Для непрочитанных сообщений и тд
};

// Состояние сайдбара
export type SidebarState = {
    isExpanded: boolean;
    activeQueryId: string | null;
    queries: SearchQuery[];
};

// Варианты отображения сайдбара
export type SidebarVariant = 'minimal' | 'cards' | 'compact-pro';
