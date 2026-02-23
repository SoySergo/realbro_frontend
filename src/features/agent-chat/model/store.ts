'use client';

import { create } from 'zustand';
import type { 
  AgentChatView, 
  AgentMessage, 
  PropertyThread, 
  AgentChatFilter,
  PropertyReaction 
} from '@/entities/agent-chat';
import { getAgentChatData, sendAgentMessage } from '@/shared/api/agent-chat';

interface AgentChatStore {
  // Текущий вид
  currentView: AgentChatView;
  activeThreadId: string | null;
  
  // Основной чат — сообщения
  mainMessages: AgentMessage[];
  
  // Треды по объектам
  threads: PropertyThread[];
  
  // Фильтры
  dayFilter: string;
  selectedFilterIds: string[];
  availableFilters: AgentChatFilter[];
  
  // UI
  isLoading: boolean;
  isSending: boolean;
  
  // Навигация
  setView: (view: AgentChatView) => void;
  openThread: (threadId: string) => void;
  closeThread: () => void;
  
  // Данные
  fetchData: () => Promise<void>;
  sendMessage: (content: string, threadId?: string) => Promise<void>;
  
  // Действия с объектами
  reactToProperty: (threadId: string, reaction: PropertyReaction) => void;
  toggleFavorite: (threadId: string) => void;
  saveNote: (threadId: string, note: string) => void;
  markSuitable: (threadId: string, suitable: boolean) => void;
  
  // Фильтры
  setDayFilter: (filter: string) => void;
  toggleFilterId: (filterId: string) => void;
  
  // Получить текущий тред
  getActiveThread: () => PropertyThread | undefined;
}

export const useAgentChatStore = create<AgentChatStore>()((set, get) => ({
  currentView: 'main',
  activeThreadId: null,
  mainMessages: [],
  threads: [],
  dayFilter: 'all',
  selectedFilterIds: [],
  availableFilters: [],
  isLoading: false,
  isSending: false,

  setView: (view) => set({ currentView: view }),
  
  openThread: (threadId) => set({ 
    currentView: 'thread', 
    activeThreadId: threadId 
  }),
  
  closeThread: () => set({ 
    currentView: 'main', 
    activeThreadId: null 
  }),

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const data = await getAgentChatData();
      set({ 
        mainMessages: data.messages, 
        threads: data.threads,
        availableFilters: data.filters,
        isLoading: false 
      });
    } catch (error) {
      console.error('[AgentChat] Failed to fetch data', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (content, threadId) => {
    const optimisticMsg: AgentMessage = {
      id: `msg_opt_${Date.now()}`,
      threadId,
      sender: 'user',
      type: 'text',
      content,
      createdAt: new Date().toISOString(),
    };

    if (threadId) {
      set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, optimisticMsg], lastActivity: new Date().toISOString() }
            : t
        ),
      }));
    } else {
      set((state) => ({
        mainMessages: [...state.mainMessages, optimisticMsg],
      }));
    }

    set({ isSending: true });
    try {
      const response = await sendAgentMessage(content, threadId);
      
      // Добавляем ответ агента
      if (threadId) {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, response], lastActivity: new Date().toISOString() }
              : t
          ),
          isSending: false,
        }));
      } else {
        set((state) => ({
          mainMessages: [...state.mainMessages, response],
          isSending: false,
        }));
      }
    } catch (error) {
      console.error('[AgentChat] Failed to send message', error);
      set({ isSending: false });
    }
  },

  reactToProperty: (threadId, reaction) => {
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, reaction } : t
      ),
    }));
  },

  toggleFavorite: (threadId) => {
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, isFavorite: !t.isFavorite } : t
      ),
    }));
  },

  saveNote: (threadId, note) => {
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, note } : t
      ),
    }));
  },

  markSuitable: (threadId, suitable) => {
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId 
          ? { ...t, reaction: suitable ? 'like' : 'dislike' } 
          : t
      ),
    }));
  },

  setDayFilter: (filter) => set({ dayFilter: filter }),
  
  toggleFilterId: (filterId) => {
    set((state) => {
      const ids = state.selectedFilterIds.includes(filterId)
        ? state.selectedFilterIds.filter((id) => id !== filterId)
        : [...state.selectedFilterIds, filterId];
      return { selectedFilterIds: ids };
    });
  },

  getActiveThread: () => {
    const { threads, activeThreadId } = get();
    return threads.find((t) => t.id === activeThreadId);
  },
}));
