'use client';

import type { SearchFilters } from '@/entities/filter';
import type { TabResponseDTO, TabsListResponseDTO, FolderResponseDTO } from '@/widgets/sidebar/model/types';
import { apiClient } from './lib/api-client';
import { FEATURES } from '@/shared/config/features';

export interface SearchQueryDTO {
    id: string;
    title: string;
    filters: SearchFilters;
    resultsCount?: number;
    createdAt: string;
    lastUpdated: string;
}

const MOCK_API_BASE = '/api/search-queries';

/**
 * Конвертирует TabResponseDTO бекенда → SearchQueryDTO фронтенда
 */
function tabResponseToSearchQueryDTO(tab: TabResponseDTO): SearchQueryDTO {
    return {
        id: tab.id,
        title: tab.title,
        filters: tab.filters as unknown as SearchFilters,
        resultsCount: tab.resultsCount,
        createdAt: tab.createdAt,
        lastUpdated: tab.updatedAt,
    };
}

/**
 * Получить все вкладки поиска пользователя
 */
export async function getSearchQueries(): Promise<SearchQueryDTO[]> {
    if (FEATURES.USE_REAL_TABS) {
        try {
            const response = await apiClient.get<TabsListResponseDTO>('/search-tabs');
            return response.data.tabs.map(tabResponseToSearchQueryDTO);
        } catch (error) {
            console.error('[API] Failed to get search tabs:', error);
            return [];
        }
    }

    try {
        const response = await fetch(MOCK_API_BASE);
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
    if (FEATURES.USE_REAL_TABS) {
        const response = await apiClient.post<{ data: TabResponseDTO }>('/search-tabs', {
            title: data.title,
            filters: data.filters,
            view_mode: 'map',
        });
        return tabResponseToSearchQueryDTO(response.data);
    }

    const response = await fetch(MOCK_API_BASE, {
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
    if (FEATURES.USE_REAL_TABS) {
        const body: Record<string, unknown> = {};
        if (updates.title !== undefined) body.title = updates.title;
        if (updates.filters !== undefined) body.filters = updates.filters;

        const response = await apiClient.put<{ data: TabResponseDTO }>(`/search-tabs/${id}`, body);
        return tabResponseToSearchQueryDTO(response.data);
    }

    const response = await fetch(`${MOCK_API_BASE}/${id}`, {
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
    if (FEATURES.USE_REAL_TABS) {
        await apiClient.delete(`/search-tabs/${id}`);
        return;
    }

    const response = await fetch(`${MOCK_API_BASE}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

/**
 * Изменить порядок вкладок
 */
export async function reorderSearchTabs(tabIds: string[]): Promise<void> {
    if (FEATURES.USE_REAL_TABS) {
        await apiClient.post('/search-tabs/reorder', { tabIds });
        return;
    }
    // Моки не поддерживают reorder
}

/**
 * Отметить использование вкладки
 */
export async function markTabUsage(id: string, resultsCount?: number): Promise<void> {
    if (FEATURES.USE_REAL_TABS) {
        await apiClient.post(`/search-tabs/${id}/usage`, { resultsCount });
        return;
    }
    // Моки не поддерживают usage tracking
}

/**
 * Получить шаблоны вкладок
 */
export async function getSearchTabTemplates(): Promise<TabResponseDTO[]> {
    if (FEATURES.USE_REAL_TABS) {
        const response = await apiClient.get<{ data: TabResponseDTO[] }>('/search-tabs/templates');
        return response.data;
    }
    return [];
}

// === Папки вкладок ===

/**
 * Создать папку вкладок
 */
export async function createTabFolder(data: {
    name: string;
    icon?: string;
    color?: string;
}): Promise<FolderResponseDTO> {
    const response = await apiClient.post<{ data: FolderResponseDTO }>('/search-tabs/folders', data);
    return response.data;
}

/**
 * Обновить папку вкладок
 */
export async function updateTabFolder(
    id: string,
    updates: Partial<{ name: string; icon: string; color: string }>
): Promise<FolderResponseDTO> {
    const response = await apiClient.put<{ data: FolderResponseDTO }>(`/search-tabs/folders/${id}`, updates);
    return response.data;
}

/**
 * Удалить папку вкладок (вкладки перемещаются в корень)
 */
export async function deleteTabFolder(id: string): Promise<void> {
    await apiClient.delete(`/search-tabs/folders/${id}`);
}
