'use client';

import type {
    CreateAutosearchRequest,
    AutosearchTask,
    AutosearchListResponse,
    AutosearchStats,
} from '@/entities/autosearch';

const API_BASE = '/api/v1/autosearch';

// ============ API Functions ============

/**
 * Создать новое задание AutoSearch
 */
export async function createAutosearch(
    data: CreateAutosearchRequest
): Promise<AutosearchTask> {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('[AutoSearch API] Failed to create autosearch:', error);
        throw error;
    }
}

/**
 * Получить список заданий AutoSearch
 */
export async function getAutosearchList(): Promise<AutosearchListResponse> {
    try {
        const response = await fetch(API_BASE);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('[AutoSearch API] Failed to get autosearch list:', error);
        // Возвращаем пустой список при ошибке
        return { items: [], total: 0 };
    }
}

/**
 * Получить детали задания AutoSearch
 */
export async function getAutosearch(id: string): Promise<AutosearchTask> {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`[AutoSearch API] Failed to get autosearch ${id}:`, error);
        throw error;
    }
}

/**
 * Обновить задание AutoSearch
 */
export async function updateAutosearch(
    id: string,
    data: Partial<CreateAutosearchRequest>
): Promise<AutosearchTask> {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`[AutoSearch API] Failed to update autosearch ${id}:`, error);
        throw error;
    }
}

/**
 * Удалить задание AutoSearch
 */
export async function deleteAutosearch(id: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error(`[AutoSearch API] Failed to delete autosearch ${id}:`, error);
        throw error;
    }
}

/**
 * Активировать задание AutoSearch
 */
export async function activateAutosearch(id: string): Promise<AutosearchTask> {
    try {
        const response = await fetch(`${API_BASE}/${id}/activate`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`[AutoSearch API] Failed to activate autosearch ${id}:`, error);
        throw error;
    }
}

/**
 * Деактивировать задание AutoSearch
 */
export async function deactivateAutosearch(id: string): Promise<AutosearchTask> {
    try {
        const response = await fetch(`${API_BASE}/${id}/deactivate`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`[AutoSearch API] Failed to deactivate autosearch ${id}:`, error);
        throw error;
    }
}

/**
 * Получить статистику задания AutoSearch
 */
export async function getAutosearchStats(id: string): Promise<AutosearchStats> {
    try {
        const response = await fetch(`${API_BASE}/${id}/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`[AutoSearch API] Failed to get autosearch stats ${id}:`, error);
        throw error;
    }
}
