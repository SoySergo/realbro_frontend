'use client';

import { create } from 'zustand';

/**
 * Стор для управления UI состоянием чата
 * Отслеживает открыт ли чат на мобильных устройствах
 */
interface ChatUIStore {
    /** Открыт ли чат (для скрытия мобильного меню) */
    isChatOpen: boolean;
    /** Открыть чат */
    openChat: () => void;
    /** Закрыть чат */
    closeChat: () => void;
    /** Установить состояние чата */
    setChatOpen: (isOpen: boolean) => void;
}

export const useChatUIStore = create<ChatUIStore>((set) => ({
    isChatOpen: false,
    openChat: () => set({ isChatOpen: true }),
    closeChat: () => set({ isChatOpen: false }),
    setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
}));
