'use client';

import { apiClient } from './lib/api-client';
import { FEATURES } from '@/shared/config/features';

// === Типы ===

// DTO бекенда (snake_case)
export interface GeometryResponseDTO {
    id: string; // UUID
    filter_id: string;
    geometry: string; // GeoJSON строка
    created_at: string;
}

// Legacy DTO для моков (обратная совместимость)
export interface GeometryDTO {
    id: number;
    type: 'polygon' | 'isochrone' | 'radius';
    geometry: unknown; // GeoJSON geometry или {center, radiusKm}
    name: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

const MOCK_API_BASE = '/api/geometries';

// === Реальный API (привязанные к фильтру) ===

/**
 * Создать геометрию для фильтра
 * Авторизованные: filter_id = ID фильтра текущего таба
 * Неавторизованные: используйте createGuestGeometry()
 */
export async function createFilterGeometry(
    filterId: string,
    geometry: string // GeoJSON строка
): Promise<GeometryResponseDTO> {
    const response = await apiClient.post<{ data: GeometryResponseDTO }>(
        `/filters/${filterId}/geometry`,
        { geometry }
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
 * Обновить геометрию фильтра
 */
export async function updateFilterGeometry(
    filterId: string,
    geometry: string
): Promise<GeometryResponseDTO> {
    const response = await apiClient.put<{ data: GeometryResponseDTO }>(
        `/filters/${filterId}/geometry`,
        { geometry }
    );
    return response.data;
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
    geometry: string // GeoJSON строка
): Promise<GeometryResponseDTO> {
    const response = await apiClient.post<{ data: GeometryResponseDTO }>(
        '/filters/guest/geometry',
        { geometry },
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

// === Legacy API (для моков / обратная совместимость) ===

/**
 * Получить все сохранённые геометрии пользователя
 */
export async function getGeometries(): Promise<GeometryDTO[]> {
    if (FEATURES.USE_REAL_FILTERS) {
        // Реальный API не поддерживает получение всех геометрий списком
        // Геометрии привязаны к конкретным фильтрам
        console.warn('[API] getGeometries() not supported with real API, use getFilterGeometry() per filter');
        return [];
    }

    try {
        const response = await fetch(MOCK_API_BASE);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error('[API] Failed to get geometries:', error);
        return [];
    }
}

/**
 * Сохранить геометрию (polygon/isochrone/radius)
 */
export async function createGeometry(data: {
    type: 'polygon' | 'isochrone' | 'radius';
    geometry: unknown;
    name?: string;
    metadata?: Record<string, unknown>;
}): Promise<GeometryDTO> {
    if (FEATURES.USE_REAL_FILTERS) {
        // Для реального API используем guest-геометрию как fallback
        const geojsonStr = typeof data.geometry === 'string'
            ? data.geometry
            : JSON.stringify(data.geometry);

        const result = await createGuestGeometry(geojsonStr);
        const parsedId = parseInt(result.id);
        return {
            id: Number.isNaN(parsedId) ? Date.now() : parsedId,
            type: data.type,
            geometry: data.geometry,
            name: data.name || '',
            metadata: data.metadata || {},
            createdAt: result.created_at,
        };
    }

    const response = await fetch(MOCK_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return json.data;
}

/**
 * Удалить геометрию
 */
export async function deleteGeometry(id: number): Promise<void> {
    if (FEATURES.USE_REAL_FILTERS) {
        await deleteGuestGeometry(String(id));
        return;
    }

    const response = await fetch(`${MOCK_API_BASE}?id=${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

/**
 * Сохранить радиус (convenience function)
 * @param center - [lng, lat]
 * @param radiusKm - радиус в км (0.1 - 100)
 */
export async function saveRadius(
    center: [number, number],
    radiusKm: number,
    name?: string
): Promise<GeometryDTO> {
    if (radiusKm < 0.1 || radiusKm > 100) {
        throw new Error('radiusKm must be between 0.1 and 100');
    }

    return createGeometry({
        type: 'radius',
        geometry: { center, radiusKm },
        name: name || `Радиус ${radiusKm} км`,
        metadata: { radiusKm },
    });
}
