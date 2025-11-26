import type { SearchFilters } from '../model/types';
import type { DrawPolygon } from '@/entities/map-draw/model/types';
import type { LocationItem } from '@/entities/location';

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

    // TODO: isochrone и radius когда будут реализованы

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

    return null;
}
