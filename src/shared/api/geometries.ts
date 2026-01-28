'use client';

export interface GeometryDTO {
    id: number;
    type: 'polygon' | 'isochrone' | 'radius';
    geometry: unknown; // GeoJSON geometry или {center, radiusKm}
    name: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

const API_BASE = '/api/geometries';

/**
 * Получить все сохранённые геометрии пользователя
 */
export async function getGeometries(): Promise<GeometryDTO[]> {
    try {
        const response = await fetch(API_BASE);
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
    const response = await fetch(API_BASE, {
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
    const response = await fetch(`${API_BASE}?id=${id}`, {
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
