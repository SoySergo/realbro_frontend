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

// Ответы API для разных типов карточек
export type PropertiesGridResponse = ApiResponse<PaginatedResponse<PropertyGridCard>>;
export type PropertiesHorizontalResponse = ApiResponse<PaginatedResponse<PropertyHorizontalCard>>;
export type PropertiesChatResponse = ApiResponse<PaginatedResponse<PropertyChatCard>>;
