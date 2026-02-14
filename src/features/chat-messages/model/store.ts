'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, Conversation } from '@/entities/chat';
import {
    getConversations,
    getMessages,
    sendMessage as sendMessageAPI,
} from '@/shared/api/chat';

interface ChatStore {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, ChatMessage[]>;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    isSending: boolean;

    setActiveConversation: (id: string | null) => void;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, content: string) => Promise<void>;
    retryMessage: (messageId: string, conversationId: string) => Promise<void>;
    addIncomingMessage: (message: ChatMessage) => void;
    markAsRead: (conversationId: string) => void;
    totalUnread: () => number;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            conversations: [],
            activeConversationId: null,
            messages: {},
            isLoadingConversations: false,
            isLoadingMessages: false,
            isSending: false,

            setActiveConversation: (id) => {
                set({ activeConversationId: id });
                if (id) {
                    const msgs = get().messages[id];
                    if (!msgs || msgs.length === 0) {
                        get().fetchMessages(id);
                    }
                    get().markAsRead(id);
                }
            },

            fetchConversations: async () => {
                set({ isLoadingConversations: true });
                const conversations = await getConversations();
                set({ conversations, isLoadingConversations: false });
            },

            fetchMessages: async (conversationId) => {
                set({ isLoadingMessages: true });
                const data = await getMessages(conversationId);
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [conversationId]: data.messages,
                    },
                    isLoadingMessages: false,
                }));
            },

            sendMessage: async (conversationId, content) => {
                const optimisticMessage: ChatMessage = {
                    id: `msg_opt_${Date.now()}`,
                    conversationId,
                    senderId: 'current_user',
                    type: 'text',
                    content,
                    status: 'sending',
                    createdAt: new Date().toISOString(),
                };

                // Add optimistically
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [conversationId]: [
                            ...(state.messages[conversationId] || []),
                            optimisticMessage,
                        ],
                    },
                    isSending: true,
                }));

                // Update conversation last message
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.id === conversationId
                            ? { ...c, lastMessage: { ...optimisticMessage, status: 'sent' }, updatedAt: new Date().toISOString() }
                            : c
                    ),
                }));

                try {
                    const result = await sendMessageAPI(conversationId, content);

                    // Replace optimistic with real
                    set((state) => ({
                        messages: {
                            ...state.messages,
                            [conversationId]: state.messages[conversationId]?.map((m) =>
                                m.id === optimisticMessage.id
                                    ? { ...result, status: 'sent' as const }
                                    : m
                            ) || [],
                        },
                        isSending: false,
                    }));

                    // Simulate reply for support/p2p after a delay
                    const conv = get().conversations.find((c) => c.id === conversationId);
                    if (conv && conv.type === 'support') {
                        setTimeout(() => {
                            get().addIncomingMessage({
                                id: `msg_reply_${Date.now()}`,
                                conversationId,
                                senderId: 'support',
                                type: 'text',
                                content: 'Thank you for your message! Our team will review it shortly.',
                                status: 'delivered',
                                createdAt: new Date().toISOString(),
                            });
                        }, 1500);
                    }
                } catch (error) {
                    console.error('[Chat] Failed to send message', error);
                    // Mark message as error
                    set((state) => ({
                        messages: {
                            ...state.messages,
                            [conversationId]: state.messages[conversationId]?.map((m) =>
                                m.id === optimisticMessage.id
                                    ? { ...m, status: 'error' as const }
                                    : m
                            ) || [],
                        },
                        isSending: false,
                    }));
                }
            },

            retryMessage: async (messageId, conversationId) => {
                const message = get().messages[conversationId]?.find((m) => m.id === messageId);
                if (!message || message.status !== 'error') return;

                // Update status to sending
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [conversationId]: state.messages[conversationId]?.map((m) =>
                            m.id === messageId ? { ...m, status: 'sending' as const } : m
                        ) || [],
                    },
                }));

                try {
                    const result = await sendMessageAPI(conversationId, message.content);
                    
                    // Replace with successful message
                    set((state) => ({
                        messages: {
                            ...state.messages,
                            [conversationId]: state.messages[conversationId]?.map((m) =>
                                m.id === messageId
                                    ? { ...result, status: 'sent' as const }
                                    : m
                            ) || [],
                        },
                    }));
                } catch (error) {
                    console.error('[Chat] Failed to retry message', error);
                    // Mark as error again
                    set((state) => ({
                        messages: {
                            ...state.messages,
                            [conversationId]: state.messages[conversationId]?.map((m) =>
                                m.id === messageId ? { ...m, status: 'error' as const } : m
                            ) || [],
                        },
                    }));
                }
            },

            addIncomingMessage: (message) => {
                set((state) => {
                    const conversationMsgs = state.messages[message.conversationId] || [];

                    // Mark as real-time message (pushed via WebSocket while chat is open)
                    const messageWithFlag: ChatMessage = {
                        ...message,
                        isRealTime: true,
                    };

                    return {
                        messages: {
                            ...state.messages,
                            [message.conversationId]: [
                                ...conversationMsgs,
                                messageWithFlag,
                            ],
                        },
                    };
                });

                // Update conversation
                set((state) => ({
                    conversations: state.conversations.map((c) => {
                        if (c.id !== message.conversationId) return c;
                        const isActive = state.activeConversationId === c.id;
                        return {
                            ...c,
                            lastMessage: message,
                            updatedAt: message.createdAt,
                            unreadCount: isActive ? c.unreadCount : c.unreadCount + 1,
                        };
                    }),
                }));
            },

            markAsRead: (conversationId) => {
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.id === conversationId ? { ...c, unreadCount: 0 } : c
                    ),
                }));
            },

            totalUnread: () => {
                return get().conversations.reduce(
                    (sum, c) => sum + c.unreadCount,
                    0
                );
            },
        }),
        {
            name: 'realbro-chat-store',
            // Don't persist activeConversationId - user should select chat on each visit
            partialize: () => ({}),
        }
    )
);
