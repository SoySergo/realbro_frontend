'use client';

import { create } from 'zustand';
import {
    getContactAccess,
    getCachedContacts,
    type ContactInfo,
    type ContactAccessError,
    type AuthorType,
} from '@/shared/api/contacts';

// ============================================================================
// Типы для store
// ============================================================================

/**
 * Состояние модалки контактов
 */
export interface ContactModalState {
    isOpen: boolean;
    isLoading: boolean;
    propertyId: string | null;
    authorId: string | null;
    authorType: AuthorType | null;
    authorName: string | null;
    authorAvatar?: string;
    contacts: ContactInfo | null;
    error: ContactAccessError | null;
    limit?: {
        current: number;
        max: number;
        resetAt?: string;
    };
}

/**
 * Действия для работы с контактами
 */
interface ContactStoreActions {
    // Открытие/закрытие модалки
    openContactModal: (params: {
        propertyId: string;
        authorId: string;
        authorType: AuthorType;
        authorName: string;
        authorAvatar?: string;
    }) => void;
    closeContactModal: () => void;
    
    // Запрос контактов
    requestContacts: (isAuthenticated: boolean, userTariff?: 'free' | 'standard' | 'maximum') => Promise<void>;
    
    // Очистка ошибки
    clearError: () => void;
    
    // Сброс состояния
    reset: () => void;
}

type ContactStore = ContactModalState & ContactStoreActions;

// ============================================================================
// Начальное состояние
// ============================================================================

const initialState: ContactModalState = {
    isOpen: false,
    isLoading: false,
    propertyId: null,
    authorId: null,
    authorType: null,
    authorName: null,
    authorAvatar: undefined,
    contacts: null,
    error: null,
    limit: undefined,
};

// ============================================================================
// Store
// ============================================================================

export const useContactStore = create<ContactStore>((set, get) => ({
    ...initialState,

    /**
     * Открыть модалку контактов
     * Сначала проверяем кэш, если есть - показываем сразу
     */
    openContactModal: ({ propertyId, authorId, authorType, authorName, authorAvatar }) => {
        console.log('[Contact Store] Opening contact modal', { propertyId, authorId, authorType });
        
        // Проверяем кэш
        const cachedContacts = getCachedContacts(authorId);
        
        set({
            isOpen: true,
            isLoading: !cachedContacts, // Если есть кэш, не показываем loading
            propertyId,
            authorId,
            authorType,
            authorName,
            authorAvatar,
            contacts: cachedContacts,
            error: null,
            limit: undefined,
        });
    },

    /**
     * Закрыть модалку
     */
    closeContactModal: () => {
        console.log('[Contact Store] Closing contact modal');
        set({
            isOpen: false,
            // Не сбрасываем contacts чтобы избежать мигания при повторном открытии
        });
    },

    /**
     * Запросить контакты
     */
    requestContacts: async (isAuthenticated, userTariff = 'free') => {
        const { propertyId, authorId, authorType, contacts } = get();
        
        // Если контакты уже есть, не делаем запрос
        if (contacts) {
            console.log('[Contact Store] Contacts already loaded');
            return;
        }
        
        if (!propertyId || !authorId || !authorType) {
            console.error('[Contact Store] Missing required params');
            return;
        }

        console.log('[Contact Store] Requesting contacts', { isAuthenticated, userTariff });
        set({ isLoading: true, error: null });

        try {
            const response = await getContactAccess(
                { propertyId, authorId, authorType },
                { isAuthenticated, userTariff }
            );

            if (response.success && response.contacts) {
                console.log('[Contact Store] Contacts received successfully');
                set({
                    contacts: response.contacts,
                    isLoading: false,
                    error: null,
                });
            } else {
                console.log('[Contact Store] Contact access denied', { error: response.error });
                set({
                    isLoading: false,
                    error: response.error || null,
                    limit: response.limit,
                });
            }
        } catch (error) {
            console.error('[Contact Store] Failed to get contacts', error);
            set({
                isLoading: false,
                error: 'auth_required', // Fallback error
            });
        }
    },

    /**
     * Очистить ошибку
     */
    clearError: () => {
        set({ error: null, limit: undefined });
    },

    /**
     * Сброс состояния
     */
    reset: () => {
        set(initialState);
    },
}));
