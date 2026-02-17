import type { SearchFilters } from '../model/types';
import type { DrawPolygon } from '@/entities/map-draw/model/types';
import type { LocationItem } from '@/entities/location';
import { adminLevelToLocationField } from '@/entities/boundary';

/**
 * Утилиты для конвертации фильтров между разными форматами
 * Перенесено из src/store/filterStore.ts
 */

/**
 * Преобразует LocationFilter в структуру SearchFilters
 */
export function convertLocationFilterToFilters(locationFilter: {
    mode: 'search' | 'draw' | 'isochrone' | 'radius';
    selectedLocations?: LocationItem[];
    polygon?: DrawPolygon;
    isochrone?: {
        center: [number, number];
        profile: 'walking' | 'cycling' | 'driving';
        minutes: number;
    };
    radius?: {
        center: [number, number];
        radiusKm: number;
    };
}): Partial<SearchFilters> {
    const result: Partial<SearchFilters> = {};

    if (locationFilter.mode === 'search' && locationFilter.selectedLocations) {
        // Группируем по adminLevel
        const groupedByLevel: Record<number, number[]> = {};
        const locationsMeta: Array<{ id: number; wikidata?: string; adminLevel?: number }> = [];

        locationFilter.selectedLocations.forEach((loc) => {
            if (loc.adminLevel && loc.id) {
                if (!groupedByLevel[loc.adminLevel]) {
                    groupedByLevel[loc.adminLevel] = [];
                }
                groupedByLevel[loc.adminLevel].push(loc.id);

                // Сохраняем мета-информацию для восстановления границ
                locationsMeta.push({
                    id: loc.id,
                    wikidata: loc.wikidata,
                    adminLevel: loc.adminLevel,
                });
            }
        });

        // Применяем к нужным полям
        if (groupedByLevel[2]) result.adminLevel2 = groupedByLevel[2];
        if (groupedByLevel[4]) result.adminLevel4 = groupedByLevel[4];
        if (groupedByLevel[6]) result.adminLevel6 = groupedByLevel[6];
        if (groupedByLevel[7]) result.adminLevel7 = groupedByLevel[7];
        if (groupedByLevel[8]) result.adminLevel8 = groupedByLevel[8];
        if (groupedByLevel[9]) result.adminLevel9 = groupedByLevel[9];
        if (groupedByLevel[10]) result.adminLevel10 = groupedByLevel[10];

        // Сохраняем мета-информацию
        result.locationsMeta = locationsMeta;
    }

    if (locationFilter.mode === 'draw' && locationFilter.polygon) {
        result.geometryIds = [parseInt(locationFilter.polygon.id.replace('polygon_', ''))];
    }

    if (locationFilter.mode === 'radius' && locationFilter.radius) {
        result.radiusCenter = locationFilter.radius.center;
        result.radiusKm = locationFilter.radius.radiusKm;
    }

    return result;
}

/**
 * Преобразует SearchFilters обратно в LocationFilter
 */
export function convertFiltersToLocationFilter(
    filters: SearchFilters,
    savedPolygons: DrawPolygon[]
): {
    mode: 'search' | 'draw' | 'isochrone' | 'radius';
    selectedLocations?: LocationItem[];
    polygon?: DrawPolygon;
    radius?: { center: [number, number]; radiusKm: number };
} | null {
    // Проверяем наличие adminLevel полей
    const hasAdminLevels =
        filters.adminLevel2 ||
        filters.adminLevel4 ||
        filters.adminLevel6 ||
        filters.adminLevel7 ||
        filters.adminLevel8 ||
        filters.adminLevel9 ||
        filters.adminLevel10;

    if (hasAdminLevels && filters.locationsMeta) {
        // Восстанавливаем локации из мета-информации
        const selectedLocations: LocationItem[] = filters.locationsMeta.map((meta) => {
            // Определяем тип локации по adminLevel
            let type: 'city' | 'province' | 'district' | 'country' | 'neighborhood' | 'region' | 'comarca' =
                'city';
            if (meta.adminLevel === 2) type = 'country';
            else if (meta.adminLevel === 4) type = 'region';
            else if (meta.adminLevel === 6) type = 'province';
            else if (meta.adminLevel === 7 || meta.adminLevel === 8) type = 'city';
            else if (meta.adminLevel === 9) type = 'district';
            else if (meta.adminLevel === 10) type = 'neighborhood';

            return {
                id: meta.id,
                name: '', // Название будет загружено позже
                type,
                adminLevel: meta.adminLevel,
                wikidata: meta.wikidata,
            };
        });

        return {
            mode: 'search',
            selectedLocations,
        };
    }

    // Проверяем полигоны
    if (filters.geometryIds && filters.geometryIds.length > 0) {
        const polygonId = `polygon_${filters.geometryIds[0]}`;
        const polygon = savedPolygons.find((p) => p.id === polygonId);

        if (polygon) {
            return {
                mode: 'draw',
                polygon,
            };
        }
    }

    // Проверяем радиус
    if (filters.radiusCenter && filters.radiusKm) {
        return {
            mode: 'radius',
            selectedLocations: undefined,
            polygon: undefined,
            radius: {
                center: filters.radiusCenter,
                radiusKm: filters.radiusKm,
            },
        };
    }

    return null;
}

/**
 * Конвертирует adminLevel-поля в snake_case поля бекенда
 * Использует единый маппинг adminLevelToLocationField из @/entities/boundary
 */
export function locationToBackendFilters(filters: SearchFilters): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    
    const levelMap: Record<string, number> = {
        adminLevel2: 2,
        adminLevel4: 4,
        adminLevel6: 6,
        adminLevel7: 7,
        adminLevel8: 8,
        adminLevel9: 9,
        adminLevel10: 10,
    };

    for (const [key, level] of Object.entries(levelMap)) {
        const values = filters[key as keyof SearchFilters] as number[] | undefined;
        if (values && values.length > 0) {
            const backendField = adminLevelToLocationField(level);
            if (result[backendField]) {
                // city_ids получает значения от level 7 и 8
                result[backendField] = [...result[backendField], ...values];
            } else {
                result[backendField] = values;
            }
        }
    }

    return result;
}

/**
 * Формирует query string из SearchFilters для бекенд-запросов
 * Числовые массивы → CSV: [1, 2, 3] → "1,2,3"
 * UUID массивы → CSV: ["uuid1", "uuid2"] → "uuid1,uuid2"
 */
export function filtersToQueryString(filters: SearchFilters): string {
    const params = new URLSearchParams();

    // Тип сделки
    if (filters.property_types) {
        params.set('property_types', filters.property_types);
    } else if (filters.dealType) {
        params.set('property_types', filters.dealType);
    }

    // Вид недвижимости
    if (filters.property_kind_ids?.length) {
        params.set('property_kind_ids', filters.property_kind_ids.join(','));
    }

    // Категория / подкатегория
    if (filters.categories?.length) {
        params.set('categories', filters.categories.join(','));
    } else if (filters.categoryIds?.length) {
        params.set('categories', filters.categoryIds.join(','));
    }
    if (filters.sub_categories?.length) {
        params.set('sub_categories', filters.sub_categories.join(','));
    }

    // Локации (snake_case → бекенд)
    const locationFields = locationToBackendFilters(filters);
    for (const [field, ids] of Object.entries(locationFields)) {
        if (ids.length > 0) {
            params.set(field, ids.join(','));
        }
    }
    
    // Также добавляем прямые snake_case поля, если они заданы
    if (filters.country_ids?.length) params.set('country_ids', filters.country_ids.join(','));
    if (filters.region_ids?.length) params.set('region_ids', filters.region_ids.join(','));
    if (filters.province_ids?.length) params.set('province_ids', filters.province_ids.join(','));
    if (filters.city_ids?.length) params.set('city_ids', filters.city_ids.join(','));
    if (filters.district_ids?.length) params.set('district_ids', filters.district_ids.join(','));
    if (filters.neighborhood_ids?.length) params.set('neighborhood_ids', filters.neighborhood_ids.join(','));

    // Цена
    if (filters.minPrice !== undefined) params.set('min_price', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('max_price', String(filters.maxPrice));

    // Площадь
    if (filters.minArea !== undefined) params.set('min_area', String(filters.minArea));
    if (filters.maxArea !== undefined) params.set('max_area', String(filters.maxArea));

    // Комнаты / ванные
    if (filters.rooms?.length) params.set('rooms', filters.rooms.join(','));
    if (filters.bathrooms?.length) params.set('bathrooms', filters.bathrooms.join(','));

    // Геолокация
    if (filters.bbox) params.set('bbox', filters.bbox);
    if (filters.radius !== undefined) params.set('radius', String(filters.radius));
    if (filters.radius_lat !== undefined) params.set('radius_lat', String(filters.radius_lat));
    if (filters.radius_lng !== undefined) params.set('radius_lng', String(filters.radius_lng));
    if (filters.geojson) params.set('geojson', filters.geojson);
    if (filters.polygon_ids?.length) params.set('polygon_ids', filters.polygon_ids.join(','));

    // Включение / исключение
    if (filters.include_ids?.length) params.set('include_ids', filters.include_ids.join(','));
    if (filters.exclude_ids?.length) params.set('exclude_ids', filters.exclude_ids.join(','));

    // Маркеры
    if (filters.exclude_marker_types?.length) {
        params.set('exclude_marker_types', filters.exclude_marker_types.join(','));
    }

    // Сортировка
    if (filters.sort_by) params.set('sort_by', filters.sort_by);
    if (filters.sort_order_backend) params.set('sort_order', filters.sort_order_backend);
    if (filters.sort && !filters.sort_by) params.set('sort_by', filters.sort);
    if (filters.sortOrder && !filters.sort_order_backend) params.set('sort_order', filters.sortOrder);

    // Пагинация
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.cursor) params.set('cursor', filters.cursor);

    // Язык
    if (filters.language) params.set('language', filters.language);
    else if (filters.lang) params.set('language', filters.lang);

    return params.toString();
}
