/**
 * API клиент для синхронизации действий пользователя с бекендом
 * Работает с лайками, дизлайками и заметками
 */

import type {
    PropertyReaction,
    SetReactionRequest,
    SetReactionResponse,
    SetNoteRequest,
    SetNoteResponse,
    DeleteNoteRequest,
    StoredReactions,
    StoredNotes,
} from '../model/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Установить реакцию (лайк/дизлайк) на объект
 */
export async function setPropertyReaction(
    propertyId: string,
    reaction: PropertyReaction
): Promise<SetReactionResponse> {
    // Пока бекенд не готов - возвращаем success
    console.log('[API] Set property reaction', { propertyId, reaction });
    
    // TODO: Раскомментировать когда бекенд будет готов
    /*
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/reaction`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction } as SetReactionRequest),
    });
    
    if (!response.ok) {
        throw new Error('Failed to set reaction');
    }
    
    return await response.json();
    */
    
    return {
        success: true,
        reaction,
    };
}

/**
 * Установить заметку к объекту
 */
export async function setPropertyNote(
    propertyId: string,
    text: string
): Promise<SetNoteResponse> {
    console.log('[API] Set property note', { propertyId, text: text.substring(0, 50) });
    
    // TODO: Раскомментировать когда бекенд будет готов
    /*
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/note`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text } as SetNoteRequest),
    });
    
    if (!response.ok) {
        throw new Error('Failed to set note');
    }
    
    return await response.json();
    */
    
    return {
        success: true,
        note: {
            propertyId,
            text,
            updatedAt: new Date().toISOString(),
        },
    };
}

/**
 * Удалить заметку к объекту
 */
export async function deletePropertyNote(propertyId: string): Promise<{ success: boolean }> {
    console.log('[API] Delete property note', { propertyId });
    
    // TODO: Раскомментировать когда бекенд будет готов
    /*
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/note`, {
        method: 'DELETE',
    });
    
    if (!response.ok) {
        throw new Error('Failed to delete note');
    }
    
    return await response.json();
    */
    
    return { success: true };
}

/**
 * Получить все реакции пользователя
 */
export async function getUserReactions(): Promise<StoredReactions> {
    console.log('[API] Get user reactions');
    
    // TODO: Раскомментировать когда бекенд будет готов
    /*
    const response = await fetch(`${API_BASE_URL}/user/reactions`);
    
    if (!response.ok) {
        throw new Error('Failed to get reactions');
    }
    
    return await response.json();
    */
    
    return {};
}

/**
 * Получить все заметки пользователя
 */
export async function getUserNotes(): Promise<StoredNotes> {
    console.log('[API] Get user notes');
    
    // TODO: Раскомментировать когда бекенд будет готов
    /*
    const response = await fetch(`${API_BASE_URL}/user/notes`);
    
    if (!response.ok) {
        throw new Error('Failed to get notes');
    }
    
    return await response.json();
    */
    
    return {};
}

/**
 * Синхронизировать локальные данные с сервером (batch update)
 */
export async function syncUserActions(
    reactions: StoredReactions,
    notes: StoredNotes
): Promise<{ success: boolean }> {
    console.log('[API] Sync user actions', {
        reactionsCount: Object.keys(reactions).length,
        notesCount: Object.keys(notes).length,
    });
    
    // TODO: Раскомментировать когда бекенд будет готов
    /*
    const response = await fetch(`${API_BASE_URL}/user/actions/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactions, notes }),
    });
    
    if (!response.ok) {
        throw new Error('Failed to sync actions');
    }
    
    return await response.json();
    */
    
    return { success: true };
}
