/**
 * localStorage-кеш для геометрий (polygon, isochrone, radius).
 *
 * Ключ: `geo_guest:{uuid}` → JSON-строка GeometryLocalData.
 * Используется как fallback, когда БД периодически чистит старые геометрии.
 */

import type { CreateGeometryParams, GeometryType } from '@/shared/api/geometries';

const GEO_PREFIX = 'geo_guest:';
const GEO_PREFIX_OLD = 'geo:';

export interface GeometryLocalData {
    id: string;
    type: GeometryType;
    geometry?: string;   // GeoJSON строка (polygon / isochrone)
    name?: string;
    radius?: number;     // km (radius type)
    center_lat?: number;
    center_lng?: number;
}

/** Сохранить геометрию в localStorage */
export function saveGeometryToStorage(data: GeometryLocalData): void {
    try {
        localStorage.setItem(`${GEO_PREFIX}${data.id}`, JSON.stringify(data));
    } catch {
        // quota exceeded — не критично
    }
}

/** Получить геометрию из localStorage (проверяет новый и старый префикс) */
export function getGeometryFromStorage(id: string): GeometryLocalData | null {
    try {
        let raw = localStorage.getItem(`${GEO_PREFIX}${id}`);
        if (raw) return JSON.parse(raw) as GeometryLocalData;

        // Backward compat: проверяем старый префикс
        raw = localStorage.getItem(`${GEO_PREFIX_OLD}${id}`);
        if (raw) {
            const data = JSON.parse(raw) as GeometryLocalData;
            // Мигрируем на новый префикс
            localStorage.setItem(`${GEO_PREFIX}${id}`, raw);
            localStorage.removeItem(`${GEO_PREFIX_OLD}${id}`);
            return data;
        }

        return null;
    } catch {
        return null;
    }
}

/** Удалить геометрию из localStorage (оба префикса) */
export function removeGeometryFromStorage(id: string): void {
    try {
        localStorage.removeItem(`${GEO_PREFIX}${id}`);
        localStorage.removeItem(`${GEO_PREFIX_OLD}${id}`);
    } catch {
        // ignore
    }
}

/** Конвертация GeometryLocalData → CreateGeometryParams для пересохранения в БД */
export function localDataToCreateParams(data: GeometryLocalData): CreateGeometryParams {
    return {
        type: data.type,
        geometry: data.geometry,
        name: data.name,
        radius: data.radius,
        center_lat: data.center_lat,
        center_lng: data.center_lng,
    };
}

/**
 * Синхронизация геометрий с бекендом.
 * Для каждого ID: проверяет наличие в БД, если нет — пушит из localStorage с тем же ID.
 * Фронтенд генерирует UUIDv7, бекенд сохраняет с ним — ID не меняется.
 * Выполняется асинхронно, не блокирует UI.
 */
export async function syncGeometriesToBackend(ids: string[]): Promise<void> {
    const { getGuestGeometry, createGuestGeometry } = await import('@/shared/api/geometries');

    await Promise.allSettled(
        ids.map(async (id) => {
            // 1. Проверяем наличие в БД
            const fromDb = await getGuestGeometry(id);
            if (fromDb) return; // уже есть

            // 2. Достаём из localStorage
            const local = getGeometryFromStorage(id);
            if (!local) return; // нет нигде — ничего не делаем

            // 3. Пушим в БД с тем же ID
            try {
                await createGuestGeometry({ id, ...localDataToCreateParams(local) });
                console.log('[SyncGeo] Pushed to backend with same ID:', id);
            } catch (err) {
                console.error('[SyncGeo] Failed to push geometry to backend:', id, err);
            }
        })
    );
}
