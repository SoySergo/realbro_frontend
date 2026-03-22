'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useFilterStore, useLocationGeometryMeta } from './store';
import type { SearchFilters } from '@/entities/filter/model/types';
import { getGuestGeometry, getFilterGeometry, type GeometryType } from '@/shared/api/geometries';
import { useSidebarStore } from '@/widgets/sidebar';
import {
    parseFiltersFromSearchParams,
    serializeFiltersToSearchParams,
} from '@/features/search-filters/lib/search-params';

/**
 * Хук синхронизации фильтров с URL-параметрами.
 *
 * URL является единственным источником правды для состояния фильтров.
 *
 * Формат URL:
 *   price=min-max, categories=1,2, polygon=uuid1, isochrone=uuid, radius=uuid
 *   geo_src=guest|filter — источник геометрии (незарегистрированный / авторизованный)
 *
 * - При загрузке страницы парсит URL и применяет фильтры в стор.
 * - При изменении фильтров обновляет URL через history.replaceState.
 * - Загружает геометрии с бекенда при наличии polygon_ids в URL.
 *
 * Сценарии пользователя:
 *   1. Незарегистрированный (guest): геометрии сохраняются через /filters/guest/geometry,
 *      geo_src=guest в URL, загрузка через getGuestGeometry().
 *   2. Авторизованный (filter): геометрии сохраняются через /filters/{filterId}/geometry,
 *      geo_src=filter в URL, загрузка через getFilterGeometry(filterId).
 */
export function useFilterUrlSync() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { currentFilters, setFilters } = useFilterStore();
    // Используем оптимизированный селектор с useShallow — предотвращает лишние ре-рендеры
    // при изменении других частей стора (массив не пересоздаётся при каждом обновлении)
    const locationGeometryMeta = useLocationGeometryMeta();

    // Флаг первой загрузки (URL → стор)
    const isInitialLoad = useRef(true);

    // Флаг: нужно ли пропустить первую запись URL (избегаем гонки при старте)
    // Проблема: Effect 2 запускается одновременно с Effect 1 при первом рендере.
    // Effect 1 ещё не успел применить фильтры в стор, поэтому Effect 2 видит
    // начальное (пустое) состояние и перезаписывает URL пустой строкой.
    // Решение: пропускаем первый запуск Effect 2 — он сработает при следующем
    // изменении currentFilters, которое уже будет содержать данные из URL.
    const skipFirstUrlWrite = useRef(true);

    // 1. При загрузке страницы — парсим URL и применяем фильтры
    useEffect(() => {
        if (!isInitialLoad.current) return;
        isInitialLoad.current = false;

        // Парсим все фильтры из URL единым парсером (включая polygon_ids)
        const filtersFromUrl = parseFiltersFromSearchParams(searchParams);

        // Загружаем геометрии с бекенда при наличии polygon_ids в URL
        if (filtersFromUrl.polygon_ids && filtersFromUrl.polygon_ids.length > 0) {
            loadGeometriesFromBackend(
                filtersFromUrl.polygon_ids,
                filtersFromUrl.geometry_source,
            );
        }

        const hasUrlFilters = Object.keys(filtersFromUrl).some(
            (key) => {
                const val = filtersFromUrl[key as keyof SearchFilters];
                return val !== undefined && (!Array.isArray(val) || val.length > 0);
            }
        );

        if (hasUrlFilters) {
            setFilters(filtersFromUrl);
            console.log('[URL] Applied filters from URL:', filtersFromUrl);
        }
    }, [searchParams, setFilters]);

    // 2. При изменении фильтров — обновляем URL
    useEffect(() => {
        // Пропускаем первый запуск: стор ещё не инициализирован данными из URL
        if (skipFirstUrlWrite.current) {
            skipFirstUrlWrite.current = false;
            return;
        }

        // Сериализуем базовые фильтры
        const params = serializeFiltersToSearchParams(currentFilters);

        // Заменяем общий polygon_ids на тип-специфичные параметры, если есть метаданные геометрий.
        // Это даёт читаемый URL: ?categories=2&isochrone=uuid вместо ?categories=2&polygon_ids=uuid
        const hasGeometries = (currentFilters.polygon_ids?.length ?? 0) > 0;
        const hasMeta = locationGeometryMeta.length > 0;
        const shouldUseTypeSpecificParams = hasGeometries && hasMeta;

        if (shouldUseTypeSpecificParams) {
            // Удаляем общий параметр
            params.delete('polygon_ids');

            // Разбиваем по типу за один проход для эффективности
            const byType = locationGeometryMeta.reduce<{
                polygon: string[];
                isochrone: string[];
                radius: string[];
            }>(
                (acc, m) => {
                    if (m.type === 'polygon') acc.polygon.push(m.id);
                    else if (m.type === 'isochrone') acc.isochrone.push(m.id);
                    else if (m.type === 'radius') acc.radius.push(m.id);
                    return acc;
                },
                { polygon: [], isochrone: [], radius: [] }
            );

            if (byType.polygon.length > 0) params.set('polygon', byType.polygon.join(','));
            if (byType.isochrone.length > 0) params.set('isochrone', byType.isochrone.join(','));
            if (byType.radius.length > 0) params.set('radius', byType.radius.join(','));
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

        window.history.replaceState(null, '', newUrl);
    }, [currentFilters, locationGeometryMeta, pathname]);
}

/**
 * Загружает геометрии: сначала из localStorage (rehydrated store), затем с бекенда как fallback.
 *
 * Поддерживает два сценария:
 *   - geometry_source === 'guest'  → getGuestGeometry(id) (незарегистрированные пользователи)
 *   - geometry_source === 'filter' → getFilterGeometry(filterId) (авторизованные с сохранённым фильтром)
 */
async function loadGeometriesFromBackend(
    polygonIds: string[],
    geometrySource?: 'guest' | 'filter',
) {
    const {
        setLocationFilter,
        addGeometryMeta,
        locationFilter,
        locationGeometryMeta,
    } = useFilterStore.getState();

    // Проверяем, есть ли уже полные данные в store (восстановлены из localStorage через zustand persist)
    if (locationFilter && locationGeometryMeta.length > 0) {
        const hasMatchingMeta = polygonIds.some((id) =>
            locationGeometryMeta.some((m) => m.id === id)
        );
        const hasCoordinateData =
            (locationFilter.mode === 'isochrone' && locationFilter.isochrone?.polygon) ||
            (locationFilter.mode === 'radius' && locationFilter.radius?.center) ||
            (locationFilter.mode === 'draw' && locationFilter.polygon?.points?.length);

        if (hasMatchingMeta && hasCoordinateData) {
            console.log('[URL] Restored geometries from localStorage (skipped backend fetch)');
            return;
        }
    }

    // Fallback: загружаем с бекенда в зависимости от источника геометрии
    try {
        let results;

        if (geometrySource === 'filter') {
            // Авторизованный пользователь: геометрия привязана к сохранённому фильтру.
            // Используем активный filterId из sidebarStore.
            const { activeQueryId } = useSidebarStore.getState();

            if (activeQueryId) {
                // getFilterGeometry принимает filterId и возвращает геометрию фильтра
                const result = await getFilterGeometry(activeQueryId);
                results = result ? [result] : [];
                console.log('[URL] Loading filter geometry for query:', activeQueryId);
            } else {
                // Нет активного фильтра — fallback к гостевому API
                results = await Promise.all(polygonIds.map((id) => getGuestGeometry(id)));
                console.log('[URL] No active query, falling back to guest geometry API');
            }
        } else {
            // Незарегистрированный пользователь (или нет информации об источнике)
            results = await Promise.all(polygonIds.map((id) => getGuestGeometry(id)));
        }

        const validResults = results.filter(Boolean);
        if (validResults.length === 0) return;

        const firstResult = validResults[0]!;
        const geometryType = (firstResult.geometry_type || 'polygon') as GeometryType;

        // Сохраняем мета-данные
        for (const result of validResults) {
            if (!result) continue;
            addGeometryMeta({
                id: result.id,
                name: result.name || '',
                type: result.geometry_type as GeometryType,
            });
        }

        // Восстанавливаем locationFilter в зависимости от типа геометрии
        if (geometryType === 'radius') {
            setLocationFilter({
                mode: 'radius',
                radius: {
                    center: [firstResult.center_lng, firstResult.center_lat],
                    radiusKm: firstResult.radius,
                    name: firstResult.name || undefined,
                },
            });
        } else if (geometryType === 'isochrone') {
            // Парсим сохранённый полигон из GeoJSON
            let savedPolygon: number[][][] | undefined;
            if (firstResult.geometry) {
                try {
                    const geojson = JSON.parse(firstResult.geometry);
                    if (geojson.coordinates) {
                        savedPolygon = geojson.coordinates;
                    }
                } catch {
                    console.error('[URL] Failed to parse isochrone geometry');
                }
            }

            setLocationFilter({
                mode: 'isochrone',
                isochrone: {
                    center: [firstResult.center_lng, firstResult.center_lat],
                    profile: 'walking',
                    minutes: 15,
                    name: firstResult.name || undefined,
                    polygon: savedPolygon,
                },
            });
        } else {
            // polygon — восстанавливаем координаты из GeoJSON
            let restoredPolygon: import('@/entities/map-draw/model/types').DrawPolygon | undefined;
            if (firstResult.geometry) {
                try {
                    const geojson = JSON.parse(firstResult.geometry);
                    if (geojson.coordinates && geojson.coordinates[0]) {
                        const coords = geojson.coordinates[0] as [number, number][];
                        // Убираем замыкающую точку (дубль первой)
                        const points = coords.slice(0, -1).map(([lng, lat]) => ({ lng, lat }));
                        restoredPolygon = {
                            id: `polygon_${firstResult.id}`,
                            name: firstResult.name || '',
                            points,
                            createdAt: new Date(firstResult.created_at),
                        };
                    }
                } catch {
                    console.error('[URL] Failed to parse polygon geometry');
                }
            }

            setLocationFilter({
                mode: 'draw',
                polygon: restoredPolygon,
            });
        }

        console.log('[URL] Restored geometries from backend (fallback):', validResults.length);
    } catch (error) {
        console.error('[URL] Failed to load geometries from backend:', error);
    }
}
