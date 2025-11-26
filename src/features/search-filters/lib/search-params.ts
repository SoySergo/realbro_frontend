/**
 * Утилиты для сериализации и десериализации фильтров поиска в URL параметры
 * 
 * Формат URL: /search?price=500-2000&rooms=2,3&area=50-100&admin2=123&categories=1,2,3
 */

import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { SearchFilters } from '@/entities/filter';

/**
 * Парсит числовой массив из строки формата "1,2,3"
 */
function parseNumberArray(value: string | null): number[] | undefined {
    if (!value) return undefined;
    const numbers = value.split(',').map(Number).filter(n => !isNaN(n));
    return numbers.length > 0 ? numbers : undefined;
}

/**
 * Парсит числовой диапазон из строки формата "min-max"
 */
function parseRange(value: string | null): { min?: number; max?: number } {
    if (!value) return {};
    const parts = value.split('-');

    const min = parts[0] ? Number(parts[0]) : undefined;
    const max = parts[1] ? Number(parts[1]) : undefined;

    return {
        min: !isNaN(min as number) ? min : undefined,
        max: !isNaN(max as number) ? max : undefined,
    };
}

/**
 * Конвертирует числовой массив в строку формата "1,2,3"
 */
function serializeNumberArray(arr: number[] | undefined): string | null {
    if (!arr || arr.length === 0) return null;
    return arr.join(',');
}

/**
 * Конвертирует диапазон в строку формата "min-max"
 */
function serializeRange(min?: number, max?: number): string | null {
    if (min === undefined && max === undefined) return null;
    return `${min ?? ''}-${max ?? ''}`;
}

/**
 * Десериализует URL параметры в объект фильтров
 */
export function parseFiltersFromSearchParams(searchParams: URLSearchParams | ReadonlyURLSearchParams | null): SearchFilters {
    if (!searchParams) return {};

    const filters: SearchFilters = {};

    // Цена (price=500-2000)
    const priceRange = parseRange(searchParams.get('price'));
    if (priceRange.min !== undefined) filters.minPrice = priceRange.min;
    if (priceRange.max !== undefined) filters.maxPrice = priceRange.max;

    // Комнаты (rooms=2,3)
    filters.rooms = parseNumberArray(searchParams.get('rooms'));

    // Площадь (area=50-100)
    const areaRange = parseRange(searchParams.get('area'));
    if (areaRange.min !== undefined) filters.minArea = areaRange.min;
    if (areaRange.max !== undefined) filters.maxArea = areaRange.max;

    // Категории (categories=1,2,3)
    filters.categoryIds = parseNumberArray(searchParams.get('categories'));

    // Административные уровни
    filters.adminLevel2 = parseNumberArray(searchParams.get('admin2'));
    filters.adminLevel4 = parseNumberArray(searchParams.get('admin4'));
    filters.adminLevel6 = parseNumberArray(searchParams.get('admin6'));
    filters.adminLevel7 = parseNumberArray(searchParams.get('admin7'));
    filters.adminLevel8 = parseNumberArray(searchParams.get('admin8'));
    filters.adminLevel9 = parseNumberArray(searchParams.get('admin9'));
    filters.adminLevel10 = parseNumberArray(searchParams.get('admin10'));

    // Полигоны (geometry=123,456)
    filters.geometryIds = parseNumberArray(searchParams.get('geometry'));

    // Тип маркеров (marker=like)
    const markerType = searchParams.get('marker');
    if (markerType && ['view', 'no_view', 'like', 'dislike', 'all'].includes(markerType)) {
        filters.markerType = markerType as SearchFilters['markerType'];
    }

    // Сортировка (sort=price&order=desc)
    const sort = searchParams.get('sort');
    if (sort) filters.sort = sort;

    const sortOrder = searchParams.get('order');
    if (sortOrder && (sortOrder === 'asc' || sortOrder === 'desc')) {
        filters.sortOrder = sortOrder;
    }

    return filters;
}

/**
 * Сериализует объект фильтров в URLSearchParams
 */
export function serializeFiltersToSearchParams(filters: SearchFilters): URLSearchParams {
    const params = new URLSearchParams();

    // Цена
    const priceStr = serializeRange(filters.minPrice, filters.maxPrice);
    if (priceStr) params.set('price', priceStr);

    // Комнаты
    const roomsStr = serializeNumberArray(filters.rooms);
    if (roomsStr) params.set('rooms', roomsStr);

    // Площадь
    const areaStr = serializeRange(filters.minArea, filters.maxArea);
    if (areaStr) params.set('area', areaStr);

    // Категории
    const categoriesStr = serializeNumberArray(filters.categoryIds);
    if (categoriesStr) params.set('categories', categoriesStr);

    // Административные уровни
    const admin2Str = serializeNumberArray(filters.adminLevel2);
    if (admin2Str) params.set('admin2', admin2Str);

    const admin4Str = serializeNumberArray(filters.adminLevel4);
    if (admin4Str) params.set('admin4', admin4Str);

    const admin6Str = serializeNumberArray(filters.adminLevel6);
    if (admin6Str) params.set('admin6', admin6Str);

    const admin7Str = serializeNumberArray(filters.adminLevel7);
    if (admin7Str) params.set('admin7', admin7Str);

    const admin8Str = serializeNumberArray(filters.adminLevel8);
    if (admin8Str) params.set('admin8', admin8Str);

    const admin9Str = serializeNumberArray(filters.adminLevel9);
    if (admin9Str) params.set('admin9', admin9Str);

    const admin10Str = serializeNumberArray(filters.adminLevel10);
    if (admin10Str) params.set('admin10', admin10Str);

    // Полигоны
    const geometryStr = serializeNumberArray(filters.geometryIds);
    if (geometryStr) params.set('geometry', geometryStr);

    // Тип маркеров
    if (filters.markerType && filters.markerType !== 'all') {
        params.set('marker', filters.markerType);
    }

    // Сортировка
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.sortOrder && filters.sortOrder !== 'desc') {
        params.set('order', filters.sortOrder);
    }

    return params;
}

/**
 * Проверяет, есть ли активные фильтры
 */
export function hasActiveFilters(filters: SearchFilters): boolean {
    return !!(
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined ||
        (filters.rooms && filters.rooms.length > 0) ||
        filters.minArea !== undefined ||
        filters.maxArea !== undefined ||
        (filters.categoryIds && filters.categoryIds.length > 0) ||
        (filters.adminLevel2 && filters.adminLevel2.length > 0) ||
        (filters.adminLevel4 && filters.adminLevel4.length > 0) ||
        (filters.adminLevel6 && filters.adminLevel6.length > 0) ||
        (filters.adminLevel7 && filters.adminLevel7.length > 0) ||
        (filters.adminLevel8 && filters.adminLevel8.length > 0) ||
        (filters.adminLevel9 && filters.adminLevel9.length > 0) ||
        (filters.adminLevel10 && filters.adminLevel10.length > 0) ||
        (filters.geometryIds && filters.geometryIds.length > 0) ||
        (filters.markerType && filters.markerType !== 'all')
    );
}

/**
 * Подсчитывает количество активных фильтров
 */
export function countActiveFilters(filters: SearchFilters): number {
    let count = 0;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.rooms && filters.rooms.length > 0) count++;
    if (filters.minArea !== undefined || filters.maxArea !== undefined) count++;
    if (filters.categoryIds && filters.categoryIds.length > 0) count++;

    // Считаем административные уровни как один фильтр локации
    const hasAdminLevels =
        (filters.adminLevel2 && filters.adminLevel2.length > 0) ||
        (filters.adminLevel4 && filters.adminLevel4.length > 0) ||
        (filters.adminLevel6 && filters.adminLevel6.length > 0) ||
        (filters.adminLevel7 && filters.adminLevel7.length > 0) ||
        (filters.adminLevel8 && filters.adminLevel8.length > 0) ||
        (filters.adminLevel9 && filters.adminLevel9.length > 0) ||
        (filters.adminLevel10 && filters.adminLevel10.length > 0);

    if (hasAdminLevels) count++;

    if (filters.geometryIds && filters.geometryIds.length > 0) count++;
    if (filters.markerType && filters.markerType !== 'all') count++;

    return count;
}

/**
 * Создает читабельное описание фильтров
 */
export function getFiltersDescription(filters: SearchFilters): string {
    const parts: string[] = [];

    if (filters.minPrice || filters.maxPrice) {
        const min = filters.minPrice ? `€${filters.minPrice}` : '€0';
        const max = filters.maxPrice ? `€${filters.maxPrice}` : '∞';
        parts.push(`${min} - ${max}`);
    }

    if (filters.rooms && filters.rooms.length > 0) {
        parts.push(`${filters.rooms.length} rooms`);
    }

    if (filters.minArea || filters.maxArea) {
        const min = filters.minArea ? `${filters.minArea}m²` : '0m²';
        const max = filters.maxArea ? `${filters.maxArea}m²` : '∞';
        parts.push(`${min} - ${max}`);
    }

    return parts.join(', ') || 'All properties';
}
