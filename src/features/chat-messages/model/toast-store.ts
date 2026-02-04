'use client';

import { create } from 'zustand';
import type { PropertyToast } from '@/shared/ui/property-toast';

/**
 * Стор для управления тостами уведомлений о новых объектах
 */
interface ToastStore {
    /** Список активных тостов */
    toasts: PropertyToast[];
    /** Добавить тост */
    addToast: (toast: Omit<PropertyToast, 'timestamp'>) => void;
    /** Удалить тост */
    removeToast: (id: string) => void;
    /** Очистить все тосты */
    clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    
    addToast: (toast) => {
        const newToast: PropertyToast = {
            ...toast,
            timestamp: Date.now(),
        };
        
        set((state) => ({
            // Ограничиваем количество тостов до 5
            toasts: [newToast, ...state.toasts].slice(0, 5),
        }));
    },
    
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
    
    clearToasts: () => {
        set({ toasts: [] });
    },
}));
