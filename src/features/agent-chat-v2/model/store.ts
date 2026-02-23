'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PropertyChatCard } from '@/entities/property';
import type { PropertyThread, ThreadMessage, PropertyReaction } from './types';

interface AgentChatV2Store {
    // Активный тред (внутренний чат по объекту)
    activeThreadId: string | null;
    threads: Record<string, PropertyThread>;

    // Боковая панель тредов
    isThreadSidebarOpen: boolean;

    // Действия
    setActiveThread: (threadId: string | null) => void;
    openPropertyThread: (property: PropertyChatCard) => void;
    closeThread: () => void;
    toggleThreadSidebar: () => void;
    setThreadSidebarOpen: (open: boolean) => void;

    // Сообщения в треде
    addThreadMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'createdAt'>) => void;

    // Реакции и действия по объекту
    setReaction: (threadId: string, reaction: PropertyReaction | undefined) => void;
    toggleFavorite: (threadId: string) => void;
    setSuitable: (threadId: string, value: boolean | null) => void;
    setNote: (threadId: string, noteText: string) => void;

    // Получить тред по propertyId
    getThreadByPropertyId: (propertyId: string) => PropertyThread | undefined;
    getThreadsList: () => PropertyThread[];
}

export const useAgentChatV2Store = create<AgentChatV2Store>()(
    persist(
        (set, get) => ({
            activeThreadId: null,
            threads: {},
            isThreadSidebarOpen: false,

            setActiveThread: (threadId) => set({ activeThreadId: threadId }),

            openPropertyThread: (property) => {
                const existing = get().getThreadByPropertyId(property.id);
                if (existing) {
                    set({ activeThreadId: existing.id });
                    return;
                }

                const threadId = `thread_${property.id}_${Date.now()}`;
                const now = new Date().toISOString();

                const newThread: PropertyThread = {
                    id: threadId,
                    propertyId: property.id,
                    property,
                    messages: [
                        {
                            id: `tmsg_welcome_${threadId}`,
                            threadId,
                            type: 'agent-text',
                            content: `🏠 ${property.title}\n📍 ${property.address}\n💰 ${property.price.toLocaleString()} €`,
                            senderId: 'agent',
                            createdAt: now,
                        },
                    ],
                    isFavorite: false,
                    isSuitable: null,
                    hasNote: false,
                    createdAt: now,
                    updatedAt: now,
                };

                set((state) => ({
                    threads: { ...state.threads, [threadId]: newThread },
                    activeThreadId: threadId,
                }));
            },

            closeThread: () => set({ activeThreadId: null }),

            toggleThreadSidebar: () =>
                set((state) => ({ isThreadSidebarOpen: !state.isThreadSidebarOpen })),

            setThreadSidebarOpen: (open) => set({ isThreadSidebarOpen: open }),

            addThreadMessage: (threadId, messageData) => {
                const msgId = `tmsg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
                const now = new Date().toISOString();

                const message: ThreadMessage = {
                    ...messageData,
                    id: msgId,
                    createdAt: now,
                };

                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) return state;

                    return {
                        threads: {
                            ...state.threads,
                            [threadId]: {
                                ...thread,
                                messages: [...thread.messages, message],
                                updatedAt: now,
                            },
                        },
                    };
                });
            },

            setReaction: (threadId, reaction) =>
                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) return state;
                    return {
                        threads: {
                            ...state.threads,
                            [threadId]: { ...thread, reaction, updatedAt: new Date().toISOString() },
                        },
                    };
                }),

            toggleFavorite: (threadId) =>
                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) return state;
                    return {
                        threads: {
                            ...state.threads,
                            [threadId]: {
                                ...thread,
                                isFavorite: !thread.isFavorite,
                                updatedAt: new Date().toISOString(),
                            },
                        },
                    };
                }),

            setSuitable: (threadId, value) =>
                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) return state;
                    return {
                        threads: {
                            ...state.threads,
                            [threadId]: {
                                ...thread,
                                isSuitable: value,
                                updatedAt: new Date().toISOString(),
                            },
                        },
                    };
                }),

            setNote: (threadId, noteText) =>
                set((state) => {
                    const thread = state.threads[threadId];
                    if (!thread) return state;
                    return {
                        threads: {
                            ...state.threads,
                            [threadId]: {
                                ...thread,
                                hasNote: noteText.length > 0,
                                noteText,
                                updatedAt: new Date().toISOString(),
                            },
                        },
                    };
                }),

            getThreadByPropertyId: (propertyId) => {
                const threads = get().threads;
                return Object.values(threads).find((t) => t.propertyId === propertyId);
            },

            getThreadsList: () => {
                return Object.values(get().threads).sort(
                    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
            },
        }),
        {
            name: 'realbro-agent-chat-v2',
            partialize: (state) => ({
                threads: state.threads,
            }),
        }
    )
);
