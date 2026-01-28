'use client';

import type { SearchFilters } from '@/entities/filter';

export interface SearchQueryDTO {
    id: string;
    title: string;
    filters: SearchFilters;
    resultsCount?: number;
    createdAt: string;
    lastUpdated: string;
}

const API_BASE = '/api/search-queries';

/**
 * Получить все вкладки поиска пользователя
 */
export async function getSearchQueries(): Promise<SearchQueryDTO[]> {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error('[API] Failed to get search queries:', error);
        return [];
    }
}

/**
 * Создать новую вкладку поиска
 */
export async function createSearchQuery(data: {
    title: string;
    filters: SearchFilters;
    resultsCount?: number;
}): Promise<SearchQueryDTO> {
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
 * Обновить вкладку поиска
 */
export async function updateSearchQuery(
    id: string,
    updates: Partial<{ title: string; filters: SearchFilters; resultsCount: number }>
): Promise<SearchQueryDTO> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return json.data;
}

/**
 * Удалить вкладку поиска
 */
export async function deleteSearchQuery(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
