import type { Property } from '@/entities/property';

// === AutoSearch Types ===

/**
 * Каналы уведомлений для автоподборки
 */
export type NotificationChannel = 'online' | 'telegram' | 'push' | 'email';

/**
 * Частота отправки уведомлений
 */
export type SendFrequency = 'instant' | 'daily' | 'weekly';

/**
 * Статус задания AutoSearch
 */
export type AutosearchStatus = 'active' | 'paused' | 'error';

/**
 * Запрос на создание AutoSearch задания
 */
export interface CreateAutosearchRequest {
    filter_id: string;                 // UUID сохранённого фильтра поиска
    name: string;                      // Название задания ("Barcelona Center apartments")
    notification_channels: NotificationChannel[];   // ['push', 'telegram', 'email']
    send_frequency: SendFrequency;
    is_active: boolean;
    notify_start_hour: number;         // Начало окна уведомлений (0-23), default: 8
    notify_end_hour: number;           // Конец окна уведомлений (0-23), default: 22
    timezone: string;                  // IANA timezone, default: 'Europe/Madrid'
}

/**
 * Задание AutoSearch (элемент списка)
 */
export interface AutosearchTask {
    id: string;
    filter_id: string;
    user_id: string;
    name: string;
    notification_channels: NotificationChannel[];
    send_frequency: SendFrequency;
    is_active: boolean;
    notify_start_hour: number;         // 0-23, окно отправки: с этого часа
    notify_end_hour: number;           // 0-23, окно отправки: до этого часа
    timezone: string;                  // IANA timezone
    created_at: string;
    updated_at: string;
}

/**
 * Ответ со списком заданий
 */
export interface AutosearchListResponse {
    items: AutosearchTask[];
    total: number;
}

/**
 * Статистика задания AutoSearch
 */
export interface AutosearchStats {
    total_sent: number;               // Общее количество отправленных объектов
    last_sent_at?: string;            // Время последней отправки
    pending_count?: number;           // Количество накопленных объектов (вне quiet hours)
}

/**
 * Входящий объект от AutoSearch через Centrifugo
 */
export interface AutosearchPropertyMessage {
    property_id: string;
    filter_ids: string[];              // К каким фильтрам относится объект
    payload: {
        slug: string;
        property_type: string;
        category: string;
        title: string;
        price: number;
        currency: string;
        city: string;
        country: string;
        rooms?: number;
        area?: number;
        main_photo?: string;
        created_at: string;
    };
}

/**
 * Объект в ленте AutoSearch (обогащённый Property)
 */
export interface AutosearchProperty extends Property {
    autosearchMetadata: {
        receivedAt: string;           // Когда получен через WS
        filterIds: string[];          // К каким фильтрам относится
        filterNames: string[];        // Названия фильтров
        isNew: boolean;               // Флаг "новый" (для анимации)
        channel: NotificationChannel; // Через какой канал пришёл
    };
}

/**
 * Группа объектов для отображения (по времени/фильтру)
 */
export interface AutosearchPropertyGroup {
    id: string;
    label: string;                    // "Сегодня, 14:30" или "Barcelona Center"
    date: Date;
    properties: AutosearchProperty[];
    filterName?: string;
    isViewed: boolean;
}
