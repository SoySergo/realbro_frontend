'use client';

import { apiClient } from './lib/api-client';

// === Типы ===

export type GeometryType = 'polygon' | 'isochrone' | 'radius';

// DTO бекенда (snake_case) — соответствует GeometryResponse на бекенде
export interface GeometryResponseDTO {
    id: string; // UUID
    filter_id: string;
    geometry: string; // GeoJSON строка (nullable для radius)
    name: string;
    geometry_type: GeometryType;
    radius: number; // км (для radius type)
    center_lat: number;
    center_lng: number;
    created_at: string;
}

// Параметры создания геометрии
export interface CreateGeometryParams {
    type: GeometryType;
    geometry?: string; // GeoJSON строка (обязательна для polygon/isochrone)
    name?: string;
    radius?: number; // км (обязательно для radius type)
    center_lat?: number; // обязательно для radius type
    center_lng?: number; // обязательно для radius type
}

// === Реальный API (привязанные к фильтру) ===

/**
 * Создать геометрию для фильтра (авторизованные пользователи)
 */
export async function createFilterGeometry(
    filterId: string,
    params: CreateGeometryParams
): Promise<GeometryResponseDTO> {
    const response = await apiClient.post<{ data: GeometryResponseDTO }>(
        `/filters/${filterId}/geometry`,
        params
    );
    return response.data;
}

/**
 * Получить геометрию фильтра
 */
export async function getFilterGeometry(filterId: string): Promise<GeometryResponseDTO | null> {
    try {
        const response = await apiClient.get<{ data: GeometryResponseDTO }>(
            `/filters/${filterId}/geometry`
        );
        return response.data;
    } catch {
        return null;
    }
}

/**
 * Удалить геометрию фильтра
 */
export async function deleteFilterGeometry(filterId: string): Promise<void> {
    await apiClient.delete(`/filters/${filterId}/geometry`);
}

// === Guest геометрии (без авторизации) ===

/**
 * Создать guest-геометрию (без авторизации)
 * Возвращённый id можно использовать в polygon_ids для поиска
 */
export async function createGuestGeometry(
    params: CreateGeometryParams
): Promise<GeometryResponseDTO> {
    const response = await apiClient.post<{ data: GeometryResponseDTO }>(
        '/filters/guest/geometry',
        params,
        { skipAuth: true }
    );
    return response.data;
}

/**
 * Получить guest-геометрию по ID
 */
export async function getGuestGeometry(id: string): Promise<GeometryResponseDTO | null> {
    try {
        const response = await apiClient.get<{ data: GeometryResponseDTO }>(
            `/filters/guest/geometry/${id}`,
            { skipAuth: true }
        );
        return response.data;
    } catch {
        return null;
    }
}

/**
 * Удалить guest-геометрию
 */
export async function deleteGuestGeometry(id: string): Promise<void> {
    await apiClient.delete(`/filters/guest/geometry/${id}`, { skipAuth: true });
}
