'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PropertyReaction, StoredReactions, StoredNotes } from './types';

/**
 * Централизованный store для действий пользователя
 * Управляет лайками, дизлайками и заметками
 * Синхронизируется с localStorage и бекендом
 */
interface UserActionsStore {
    // Состояние
    reactions: StoredReactions;
    notes: StoredNotes;
    // Флаги загрузки
    isLoading: boolean;
    isSyncing: boolean;
    
    // Геттеры
    getReaction: (propertyId: string) => PropertyReaction;
    getNote: (propertyId: string) => string | null;
    hasLike: (propertyId: string) => boolean;
    hasDislike: (propertyId: string) => boolean;
    hasNote: (propertyId: string) => boolean;
    
    // Сеттеры
    setReaction: (propertyId: string, reaction: PropertyReaction) => void;
    setNote: (propertyId: string, text: string) => void;
    deleteNote: (propertyId: string) => void;
    
    // Массовые операции
    setReactions: (reactions: StoredReactions) => void;
    setNotes: (notes: StoredNotes) => void;
    
    // Служебные методы
    setLoading: (isLoading: boolean) => void;
    setSyncing: (isSyncing: boolean) => void;
    clearAll: () => void;
}

export const useUserActionsStore = create<UserActionsStore>()(
    persist(
        (set, get) => ({
            // Начальное состояние
            reactions: {},
            notes: {},
            isLoading: false,
            isSyncing: false,
            
            // Геттеры
            getReaction: (propertyId: string) => {
                return get().reactions[propertyId]?.reaction ?? null;
            },
            
            getNote: (propertyId: string) => {
                return get().notes[propertyId]?.text ?? null;
            },
            
            hasLike: (propertyId: string) => {
                return get().reactions[propertyId]?.reaction === 'like';
            },
            
            hasDislike: (propertyId: string) => {
                return get().reactions[propertyId]?.reaction === 'dislike';
            },
            
            hasNote: (propertyId: string) => {
                const note = get().notes[propertyId];
                return note != null && note.text.trim().length > 0;
            },
            
            // Сеттеры
            setReaction: (propertyId: string, reaction: PropertyReaction) => {
                set((state) => {
                    const newReactions = { ...state.reactions };
                    
                    if (reaction === null) {
                        // Удалить реакцию
                        delete newReactions[propertyId];
                    } else {
                        // Установить/обновить реакцию
                        newReactions[propertyId] = {
                            reaction,
                            updatedAt: new Date().toISOString(),
                        };
                    }
                    
                    return { reactions: newReactions };
                });
            },
            
            setNote: (propertyId: string, text: string) => {
                set((state) => ({
                    notes: {
                        ...state.notes,
                        [propertyId]: {
                            text,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                }));
            },
            
            deleteNote: (propertyId: string) => {
                set((state) => {
                    const newNotes = { ...state.notes };
                    delete newNotes[propertyId];
                    return { notes: newNotes };
                });
            },
            
            // Массовые операции
            setReactions: (reactions: StoredReactions) => {
                set({ reactions });
            },
            
            setNotes: (notes: StoredNotes) => {
                set({ notes });
            },
            
            // Служебные методы
            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },
            
            setSyncing: (isSyncing: boolean) => {
                set({ isSyncing });
            },
            
            clearAll: () => {
                set({ reactions: {}, notes: {} });
            },
        }),
        {
            name: 'user-actions-storage',
            // Версия для миграций в будущем
            version: 1,
        }
    )
);
