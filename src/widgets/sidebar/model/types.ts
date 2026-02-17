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
    // Поля из бекенд TabResponse
    view_mode?: string; // 'map' | 'list'
    listing_view_mode?: string; // режим карточек
    map_state?: Record<string, unknown>; // zoom, center и т.д.
    is_pinned?: boolean; // закреплённая вкладка
    is_default?: boolean; // дефолтная вкладка
    folder_id?: string; // ID папки
    usage_count?: number; // счётчик использований
    description?: string; // описание вкладки
    icon?: string; // иконка вкладки
    color?: string; // цвет вкладки
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

// === Бекенд DTO типы ===

// Ответ бекенда для вкладки поиска
export interface TabResponseDTO {
    id: string;
    userId: string;
    folderId?: string;
    filterId?: string; // ID связанного сохранённого фильтра
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    filters: Record<string, unknown>; // JSON — параметры фильтра
    viewMode: string;
    listingViewMode?: string;
    sort?: string;
    sortOrder?: string;
    mapState?: Record<string, unknown>; // JSON — zoom, center и т.д.
    isPinned: boolean;
    isDefault: boolean;
    resultsCount?: number;
    lastUsedAt: string; // ISO 8601
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

// Ответ бекенда для папки вкладок
export interface FolderResponseDTO {
    id: string;
    userId: string;
    name: string;
    icon?: string;
    color?: string;
    sortPosition: number;
    createdAt: string;
    updatedAt: string;
}

// Ответ бекенда для списка вкладок + папок
export interface TabsListResponseDTO {
    data: {
        tabs: TabResponseDTO[];
        folders: FolderResponseDTO[];
    };
}
