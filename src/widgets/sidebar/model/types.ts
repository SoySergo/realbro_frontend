/**
 * Типы для сайдбара навигации
 */

import type { SearchFilters } from '@/entities/filter';

// Тип поискового запроса — определяет иконку вкладки
export type SearchQueryType =
    | 'search'                  // Дефолтный поиск (Search)
    | 'residential_rooms'       // Жилая — комнаты (BedDouble)
    | 'residential_apartments'  // Жилая — квартиры (Building2)
    | 'residential_houses'      // Жилая — дома (Home)
    | 'commercial'              // Коммерческая (Store)
    | 'agent';                  // Агент (Users)

// Статус ИИ-агента на вкладке
export type AiAgentStatus = 'idle' | 'searching' | 'found';

// Поисковый запрос (как вкладка браузера)
export type SearchQuery = {
    id: string;
    title: string;
    filters: SearchFilters; // Полная структура фильтров
    queryType?: SearchQueryType; // Тип вкладки для динамической иконки (дефолт: 'search')
    resultsCount?: number;
    newResultsCount?: number; // Количество новых результатов
    isLoading?: boolean; // Флаг загрузки данных
    isUnsaved?: boolean; // Флаг несохранённой вкладки (для новых вкладок)
    hasAiAgent?: boolean; // Привязан ли ИИ-агент к вкладке
    aiAgentStatus?: AiAgentStatus; // Статус работы ИИ-агента
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

// Тарифный план пользователя
export type SubscriptionPlan = 'free' | 'basic' | 'pro';

// Данные подписки пользователя
export type UserSubscription = {
    plan: SubscriptionPlan;
    maxTabs: number;
    aiAgentEnabled: boolean;
    expiresAt: string | null; // ISO string
};
