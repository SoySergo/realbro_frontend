'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FEATURES } from '@/shared/config/features';
import {
    setMarker,
    deleteMarker,
    getMarkerPropertyIds,
    type MarkerType,
} from '@/shared/api/markers';
import type { PropertyReaction, StoredReactions, StoredNotes } from './types';

/**
 * Централизованный store для действий пользователя
 * Управляет лайками, дизлайками и заметками
 * Синхронизируется с localStorage и бекендом (через Markers API)
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
    
    // Синхронизация с бекендом
    syncFromBackend: () => Promise<void>;
    
    // Служебные методы
    setLoading: (isLoading: boolean) => void;
    setSyncing: (isSyncing: boolean) => void;
    clearAll: () => void;
}

/**
 * Конвертация PropertyReaction в MarkerType для бекенда
 */
function reactionToMarkerType(reaction: PropertyReaction): MarkerType | null {
    if (reaction === 'like') return 'like';
    if (reaction === 'dislike') return 'dislike';
    return null;
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
            
            // Сеттеры — обновляют локальное состояние и отправляют на бекенд
            setReaction: (propertyId: string, reaction: PropertyReaction) => {
                // Обновляем локально сразу (optimistic update)
                set((state) => {
                    const newReactions = { ...state.reactions };
                    
                    if (reaction === null) {
                        delete newReactions[propertyId];
                    } else {
                        newReactions[propertyId] = {
                            reaction,
                            updatedAt: new Date().toISOString(),
                        };
                    }
                    
                    return { reactions: newReactions };
                });

                // Синхронизируем с бекендом если включен реальный API
                if (FEATURES.USE_REAL_MARKERS) {
                    const markerType = reactionToMarkerType(reaction);
                    if (markerType) {
                        setMarker({ property_id: propertyId, marker_type: markerType }).catch(
                            (error) => console.error('[UserActions] Failed to set marker:', error)
                        );
                    } else {
                        // Удаляем оба типа маркеров при сбросе реакции
                        deleteMarker(propertyId, 'like').catch(() => {});
                        deleteMarker(propertyId, 'dislike').catch(() => {});
                    }
                }
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
            
            // Синхронизация с бекендом — загрузить маркеры пользователя
            syncFromBackend: async () => {
                if (!FEATURES.USE_REAL_MARKERS) return;
                
                set({ isSyncing: true });
                try {
                    const response = await getMarkerPropertyIds(['like', 'dislike']);
                    const newReactions: StoredReactions = {};
                    
                    for (const item of response.property_ids) {
                        if (item.marker_type === 'like' || item.marker_type === 'dislike') {
                            newReactions[item.property_id] = {
                                reaction: item.marker_type,
                                updatedAt: new Date().toISOString(),
                            };
                        }
                    }
                    
                    set({ reactions: newReactions });
                } catch (error) {
                    console.error('[UserActions] Failed to sync from backend:', error);
                } finally {
                    set({ isSyncing: false });
                }
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
            version: 1,
        }
    )
);
