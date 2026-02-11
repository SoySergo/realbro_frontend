'use client';

import { useCallback } from 'react';
import { useUserActionsStore } from '../model/store';
import { setPropertyReaction, setPropertyNote, deletePropertyNote } from '../api/client';
import type { PropertyReaction } from '../model/types';

/**
 * Хук для работы с действиями пользователя
 * Предоставляет единый интерфейс для лайков, дизлайков и заметок
 * Автоматически синхронизирует с бекендом
 */
export function usePropertyActions(propertyId: string) {
    const {
        getReaction,
        getNote,
        hasLike,
        hasDislike,
        hasNote,
        setReaction,
        setNote: setNoteStore,
        deleteNote: deleteNoteStore,
    } = useUserActionsStore();
    
    const reaction = getReaction(propertyId);
    const note = getNote(propertyId);
    const isLiked = hasLike(propertyId);
    const isDisliked = hasDislike(propertyId);
    const noteExists = hasNote(propertyId);
    
    // Установить лайк
    const toggleLike = useCallback(async () => {
        const newReaction: PropertyReaction = isLiked ? null : 'like';
        
        // Оптимистичное обновление
        setReaction(propertyId, newReaction);
        
        // Синхронизация с бекендом
        try {
            await setPropertyReaction(propertyId, newReaction);
        } catch (error) {
            console.error('Failed to sync like', error);
            // Откатываем изменение при ошибке
            setReaction(propertyId, reaction);
        }
    }, [propertyId, isLiked, reaction, setReaction]);
    
    // Установить дизлайк
    const toggleDislike = useCallback(async () => {
        const newReaction: PropertyReaction = isDisliked ? null : 'dislike';
        
        // Оптимистичное обновление
        setReaction(propertyId, newReaction);
        
        // Синхронизация с бекендом
        try {
            await setPropertyReaction(propertyId, newReaction);
        } catch (error) {
            console.error('Failed to sync dislike', error);
            // Откатываем изменение при ошибке
            setReaction(propertyId, reaction);
        }
    }, [propertyId, isDisliked, reaction, setReaction]);
    
    // Установить заметку
    const saveNote = useCallback(async (text: string) => {
        // Оптимистичное обновление
        setNoteStore(propertyId, text);
        
        // Синхронизация с бекендом
        try {
            await setPropertyNote(propertyId, text);
        } catch (error) {
            console.error('Failed to sync note', error);
            // Откатываем изменение при ошибке
            if (note !== null) {
                setNoteStore(propertyId, note);
            } else {
                deleteNoteStore(propertyId);
            }
        }
    }, [propertyId, note, setNoteStore, deleteNoteStore]);
    
    // Удалить заметку
    const removeNote = useCallback(async () => {
        const oldNote = note;
        
        // Оптимистичное обновление
        deleteNoteStore(propertyId);
        
        // Синхронизация с бекендом
        try {
            await deletePropertyNote(propertyId);
        } catch (error) {
            console.error('Failed to sync note deletion', error);
            // Откатываем изменение при ошибке
            if (oldNote !== null) {
                setNoteStore(propertyId, oldNote);
            }
        }
    }, [propertyId, note, deleteNoteStore, setNoteStore]);
    
    return {
        // Состояние
        reaction,
        note,
        isLiked,
        isDisliked,
        hasNote: noteExists,
        
        // Действия
        toggleLike,
        toggleDislike,
        saveNote,
        removeNote,
    };
}

/**
 * Хук для массовых операций с действиями
 * Используется для синхронизации, импорта/экспорта данных
 */
export function useUserActionsBulk() {
    const {
        reactions,
        notes,
        setReactions,
        setNotes,
        clearAll,
        isLoading,
        isSyncing,
        setLoading,
        setSyncing,
    } = useUserActionsStore();
    
    return {
        // Состояние
        reactions,
        notes,
        isLoading,
        isSyncing,
        
        // Массовые операции
        setReactions,
        setNotes,
        clearAll,
        
        // Служебные методы
        setLoading,
        setSyncing,
    };
}
