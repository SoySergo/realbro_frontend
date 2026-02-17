/**
 * Views API — просмотры объектов недвижимости
 *
 * Записывает и отслеживает просмотры объектов пользователем.
 * Все эндпоинты требуют авторизации.
 */

import { apiClient } from './lib/api-client';

// === Типы ===

export interface ViewResponse {
    id: string;
    user_id: string;
    property_id: string;
    viewed_at: string;
}

export interface ViewListResponse {
    views: ViewResponse[];
    total: number;
    limit: number;
    offset: number;
}

export interface UnviewedPropertiesRequest {
    property_ids: string[];
}

export interface UnviewedPropertiesResponse {
    unviewed_ids: string[];
}

export interface ViewStatsResponse {
    total_views: number;
}

// === API ===

/**
 * Записать просмотр объекта
 */
export function recordView(propertyId: string): Promise<ViewResponse> {
    return apiClient.post<ViewResponse>(`/views/${propertyId}`);
}

/**
 * История просмотров с пагинацией
 */
export function getViews(params?: {
    limit?: number;
    offset?: number;
}): Promise<ViewListResponse> {
    return apiClient.get<ViewListResponse>('/views', { params });
}

/**
 * Статистика просмотров
 */
export function getViewStats(): Promise<ViewStatsResponse> {
    return apiClient.get<ViewStatsResponse>('/views/stats');
}

/**
 * Проверить непросмотренные объекты из списка ID
 */
export function checkUnseen(propertyIds: string[]): Promise<UnviewedPropertiesResponse> {
    return apiClient.post<UnviewedPropertiesResponse>('/views/unseen', {
        property_ids: propertyIds,
    });
}

/**
 * Очистить историю просмотров
 */
export function clearViews(): Promise<void> {
    return apiClient.delete<void>('/views');
}
