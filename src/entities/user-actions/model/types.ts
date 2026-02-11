/**
 * Типы для действий пользователя с объектами недвижимости
 * Централизованные типы для лайков, дизлайков и заметок
 */

// Реакция пользователя на объект (лайк/дизлайк)
export type PropertyReaction = 'like' | 'dislike' | null;

// Статус реакции
export interface PropertyReactionState {
    propertyId: string;
    reaction: PropertyReaction;
    updatedAt: string;
}

// Заметка пользователя к объекту
export interface PropertyUserNote {
    propertyId: string;
    text: string;
    updatedAt: string;
}

// Данные для хранения в localStorage
export interface StoredReactions {
    [propertyId: string]: {
        reaction: PropertyReaction;
        updatedAt: string;
    };
}

export interface StoredNotes {
    [propertyId: string]: {
        text: string;
        updatedAt: string;
    };
}

// API типы для запросов
export interface SetReactionRequest {
    propertyId: string;
    reaction: PropertyReaction;
}

export interface SetNoteRequest {
    propertyId: string;
    text: string;
}

export interface DeleteNoteRequest {
    propertyId: string;
}

// API типы для ответов
export interface SetReactionResponse {
    success: boolean;
    reaction: PropertyReaction;
}

export interface SetNoteResponse {
    success: boolean;
    note: PropertyUserNote;
}
