'use client';

import { apiClient } from './lib/api-client';

// === Типы справочников ===

export interface Category {
    id: number;
    slug: string;
    translated_name: string;
}

export interface Subcategory {
    id: number;
    category_id: number;
    slug: string;
    translated_name: string;
}

// === API-функции ===

/**
 * Получить список категорий недвижимости
 * @param lang — язык для переводов (ru, en, es и т.д.)
 */
export async function getCategories(lang: string): Promise<Category[]> {
    try {
        const response = await apiClient.get<{ data: Category[] }>(
            '/dictionaries/categories',
            { params: { lang }, skipAuth: true }
        );
        return response.data;
    } catch (error) {
        console.error('[API] Failed to get categories:', error);
        return [];
    }
}

/**
 * Получить список подкатегорий для категории
 * @param categoryId — ID родительской категории
 * @param lang — язык для переводов
 */
export async function getSubcategories(categoryId: number, lang?: string): Promise<Subcategory[]> {
    try {
        const response = await apiClient.get<{ data: Subcategory[] }>(
            `/dictionaries/categories/${categoryId}/subcategories`,
            { params: { lang }, skipAuth: true }
        );
        return response.data;
    } catch (error) {
        console.error('[API] Failed to get subcategories:', error);
        return [];
    }
}
