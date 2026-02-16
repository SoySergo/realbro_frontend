import type { PropertyGridCard, PropertyHorizontalCard, PropertyChatCard } from '@/entities/property';

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Cursor-based пагинация (бекенд формат)
 * Используется для всех списков: объекты, маркеры, чаты, история
 */
export interface CursorPaginatedResponse<T> {
    data: T[];
    pagination: {
        next_cursor?: string;
        has_more: boolean;
        total: number;
        limit: number;
    };
}

/**
 * Обёртка для одиночных ответов бекенда ({ data: T })
 */
export interface ApiDataResponse<T> {
    data: T;
}

/**
 * Формат ошибки бекенда
 */
export interface ErrorResponse {
    error: string;
    message: string;
}

// Ответы API для разных типов карточек
export type PropertiesGridResponse = ApiResponse<PaginatedResponse<PropertyGridCard>>;
export type PropertiesHorizontalResponse = ApiResponse<PaginatedResponse<PropertyHorizontalCard>>;
export type PropertiesChatResponse = ApiResponse<PaginatedResponse<PropertyChatCard>>;
