import type { SearchFilters } from '../model/types';
import type { DrawPolygon } from '@/entities/map-draw/model/types';

/**
 * Утилиты для работы с фильтрами
 * Перенесены из src/store/filterStore.ts
 */

// Начальное состояние фильтров
export const initialFilters: SearchFilters = {
    markerType: 'all',
    sortOrder: 'desc',
};

/**
 * Генерация ID для полигона
 */
export const generatePolygonId = (): string => {
    return `polygon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Проверяет, есть ли активные фильтры (кроме дефолтных)
 */
export const hasActiveFilters = (filters: SearchFilters): boolean => {
    const activeKeys = Object.keys(filters).filter(key => {
        const value = filters[key as keyof SearchFilters];
        // Игнорируем дефолтные значения
        if (key === 'markerType' && value === 'all') return false;
        if (key === 'sortOrder') return false;
        return value !== undefined && value !== null;
    });
    return activeKeys.length > 0;
};

/**
 * Подсчитывает количество активных фильтров
 */
export const countActiveFilters = (filters: SearchFilters): number => {
    let count = 0;

    // Категории
    if (filters.categoryIds && filters.categoryIds.length > 0) count++;

    // Цена
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;

    // Площадь
    if (filters.minArea !== undefined || filters.maxArea !== undefined) count++;

    // Комнаты
    if (filters.rooms && filters.rooms.length > 0) count++;

    // Локации (adminLevel)
    if (filters.adminLevel2 || filters.adminLevel4 || filters.adminLevel6 ||
        filters.adminLevel7 || filters.adminLevel8 || filters.adminLevel9 ||
        filters.adminLevel10) count++;

    // Полигоны
    if (filters.geometryIds && filters.geometryIds.length > 0) count++;

    return count;
};

/**
 * Создает новый полигон с уникальным ID
 */
export const createPolygon = (coordinates: [number, number][][]): DrawPolygon => {
    // Преобразуем GeoJSON coordinates в DrawPoint[]
    // Берем первый ring (внешний контур) полигона
    const points = coordinates[0].map(([lng, lat]) => ({ lng, lat }));

    return {
        id: generatePolygonId(),
        points,
        createdAt: new Date(),
    };
};

/**
 * Валидирует значения фильтров
 */
export const validateFilters = (filters: SearchFilters): boolean => {
    // Проверка цены
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        if (filters.minPrice > filters.maxPrice) return false;
    }

    // Проверка площади
    if (filters.minArea !== undefined && filters.maxArea !== undefined) {
        if (filters.minArea > filters.maxArea) return false;
    }

    return true;
};