/**
 * Markers API — маркеры объектов недвижимости
 * 
 * Позволяет пользователю отмечать объекты: like, dislike, saved, hidden, to_review, to_think
 * Все эндпоинты требуют авторизации.
 */

import { apiClient } from './lib/api-client';

// === Типы ===

export type MarkerType = 'like' | 'dislike' | 'saved' | 'hidden' | 'to_review' | 'to_think';

export interface SetMarkerRequest {
    property_id: string;
    marker_type: MarkerType;
}

export interface MarkerResponse {
    id: string;
    user_id: string;
    property_id: string;
    marker_type: MarkerType;
    created_at: string;
    updated_at: string;
}

export interface MarkersListResponse {
    markers: MarkerResponse[];
    total: number;
    limit: number;
    offset: number;
}

export interface MarkerStatsResponse {
    like: number;
    dislike: number;
    saved: number;
    hidden: number;
    to_review: number;
    to_think: number;
}

export interface PropertyIDsResponse {
    property_ids: { property_id: string; marker_type: MarkerType }[];
    total: number;
}

// === API ===

/**
 * Установить маркер на объект
 */
export function setMarker(data: SetMarkerRequest): Promise<MarkerResponse> {
    return apiClient.post<MarkerResponse>('/markers', data);
}

/**
 * Получить маркер для объекта
 */
export function getMarker(propertyId: string): Promise<MarkerResponse> {
    return apiClient.get<MarkerResponse>(`/markers/${propertyId}`);
}

/**
 * Удалить маркер определённого типа для объекта
 */
export function deleteMarker(propertyId: string, type: MarkerType): Promise<void> {
    return apiClient.delete<void>(`/markers/${propertyId}`, {
        params: { type },
    });
}

/**
 * Список маркеров пользователя (с фильтрацией по типу)
 */
export function getMarkers(params?: {
    type?: MarkerType;
    limit?: number;
    offset?: number;
}): Promise<MarkersListResponse> {
    return apiClient.get<MarkersListResponse>('/markers', { params });
}

/**
 * Статистика маркеров по типам
 */
export function getMarkerStats(): Promise<MarkerStatsResponse> {
    return apiClient.get<MarkerStatsResponse>('/markers/stats');
}

/**
 * Получить ID объектов с определёнными типами маркеров
 */
export function getMarkerPropertyIds(types: MarkerType[]): Promise<PropertyIDsResponse> {
    return apiClient.get<PropertyIDsResponse>('/markers/property-ids', {
        params: { types: types.join(',') },
    });
}

/**
 * Удалить все маркеры пользователя
 */
export function deleteAllMarkers(): Promise<void> {
    return apiClient.delete<void>('/markers');
}

/**
 * Удалить все маркеры определённого типа
 */
export function deleteMarkersByType(markerType: MarkerType): Promise<void> {
    return apiClient.delete<void>(`/markers/type/${markerType}`);
}
