/**
 * useEnsureGeometries — хук проверки/восстановления геометрий при инициализации страницы.
 *
 * При первой загрузке страницы поиска:
 * 1. Читает polygon/isochrone/radius IDs из URL (filters)
 * 2. Для каждого пробует GET из БД
 * 3. Если в БД нет → ищет в localStorage → пересохраняет в БД с тем же ID
 * 4. Если нет нигде → убирает ID из URL
 * 5. Возвращает isReady=true когда проверка завершена
 *
 * ID стабильный (UUIDv7, генерируется фронтендом), remapping не нужен.
 * Следит за filters.polygonIds/isochroneIds/radiusIds: если nuqs ещё не
 * гидрировался при первом рендере (IDs пусты), хук перезапустится
 * когда IDs появятся.
 */

import { useEffect, useRef, useState } from 'react';
import type { SearchFilters } from '@/entities/filter';
import {
    getGuestGeometry,
    createGuestGeometry,
} from '@/shared/api/geometries';
import {
    getGeometryFromStorage,
    localDataToCreateParams,
} from '@/shared/lib/geometry-storage';

/**
 * Проверяет массив geometry IDs и возвращает те, что потеряны (нет ни в БД, ни в localStorage).
 * Для найденных в localStorage — пересохраняет в БД с тем же ID.
 */
async function ensureIds(ids: string[]): Promise<string[]> {
    const lostIds: string[] = [];

    await Promise.all(
        ids.map(async (id) => {
            // 1. Пробуем БД
            const fromDb = await getGuestGeometry(id);
            if (fromDb) {
                console.log('[EnsureGeo] Found in DB:', id);
                return;
            }

            // 2. Fallback: localStorage → пушим в БД с тем же ID
            const local = getGeometryFromStorage(id);
            if (local) {
                try {
                    await createGuestGeometry({ id, ...localDataToCreateParams(local) });
                    console.log('[EnsureGeo] Restored from localStorage to DB:', id);
                } catch (err) {
                    console.error('[EnsureGeo] Failed to re-save geometry:', id, err);
                    lostIds.push(id);
                }
                return;
            }

            // 3. Нигде нет
            console.warn('[EnsureGeo] Geometry not found anywhere:', id);
            lostIds.push(id);
        })
    );

    return lostIds;
}

function filterOutLost(ids: string[] | undefined, lostIds: string[]): string[] | undefined {
    if (!ids?.length) return undefined;
    const remaining = ids.filter((id) => !lostIds.includes(id));
    return remaining.length > 0 ? remaining : undefined;
}

export function useEnsureGeometries(
    filters: SearchFilters,
    setFilters: (updates: Partial<SearchFilters>) => void
): { isReady: boolean } {
    const [isReady, setIsReady] = useState(false);
    const checkedRef = useRef(false);
    const setFiltersRef = useRef(setFilters);
    setFiltersRef.current = setFilters;

    // Следим за geometry IDs из фильтров. Если nuqs гидрируется позже —
    // эффект перезапустится когда IDs появятся.
    const polygonIds = filters.polygonIds;
    const isochroneIds = filters.isochroneIds;
    const radiusIds = filters.radiusIds;

    useEffect(() => {
        if (checkedRef.current) return;

        const allIds = [
            ...(polygonIds ?? []),
            ...(isochroneIds ?? []),
            ...(radiusIds ?? []),
        ];

        // Если нет geometry IDs — сразу ready, но НЕ ставим checkedRef.
        // Если IDs появятся позже (nuqs hydration), эффект перезапустится.
        if (allIds.length === 0) {
            console.log('[EnsureGeo] No geometry IDs in URL, ready');
            setIsReady(true);
            return;
        }

        // IDs есть — проверяем один раз
        checkedRef.current = true;
        setIsReady(false);
        console.log('[EnsureGeo] Checking geometry IDs:', allIds);

        ensureIds(allIds).then((lostIds) => {
            if (lostIds.length > 0) {
                const updates: Partial<SearchFilters> = {};

                if (polygonIds?.length) {
                    updates.polygonIds = filterOutLost(polygonIds, lostIds);
                }
                if (isochroneIds?.length) {
                    updates.isochroneIds = filterOutLost(isochroneIds, lostIds);
                }
                if (radiusIds?.length) {
                    updates.radiusIds = filterOutLost(radiusIds, lostIds);
                }

                // Если все геометрии потеряны — очищаем geoSrc
                const anyRemain = updates.polygonIds?.length ||
                    updates.isochroneIds?.length ||
                    updates.radiusIds?.length;
                if (!anyRemain) {
                    updates.geoSrc = undefined;
                }

                setFiltersRef.current(updates);
                console.log('[EnsureGeo] Removed lost IDs from URL:', lostIds);
            } else {
                console.log('[EnsureGeo] All geometry IDs verified OK');
            }

            setIsReady(true);
        }).catch((err) => {
            console.error('[EnsureGeo] Error during geometry check:', err);
            setIsReady(true); // всё равно разрешаем загрузку
        });
    }, [polygonIds, isochroneIds, radiusIds]);

    return { isReady };
}
