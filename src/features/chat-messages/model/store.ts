'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, Conversation, ContactInfo, PropertyNote } from '@/entities/chat';
import type { PropertyChatCard } from '@/entities/property';
import {
    getConversations,
    getMessages,
    sendMessage as sendMessageAPI,
    generateMockProperty,
} from '@/shared/api/chat';

interface PropertyThreadState {
    propertyId: string;
    property: PropertyChatCard;
}

interface ChatStore {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, ChatMessage[]>;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    isSending: boolean;

    // Ветка обсуждения объекта
    activePropertyThread: PropertyThreadState | null;
    propertyThreadMessages: Record<string, ChatMessage[]>;
    propertyDiscussionIds: string[];

    setActiveConversation: (id: string | null) => void;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, content: string) => Promise<void>;
    retryMessage: (messageId: string, conversationId: string) => Promise<void>;
    addIncomingMessage: (message: ChatMessage) => void;
    markAsRead: (conversationId: string) => void;
    totalUnread: () => number;

    // Действия с веткой объекта
    openPropertyThread: (propertyId: string, property: PropertyChatCard) => void;
    closePropertyThread: () => void;
    sendThreadMessage: (propertyId: string, content: string) => void;
    requestLocation: (propertyId: string) => void;
    requestContact: (propertyId: string) => void;
    addThreadNote: (propertyId: string, note: { content: string; date: string; time: string }) => void;
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

            // Ветка обсуждения объекта
            activePropertyThread: null,
            propertyThreadMessages: {},
            propertyDiscussionIds: [],

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

                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.id === conversationId
                            ? { ...c, lastMessage: { ...optimisticMessage, status: 'sent' }, updatedAt: new Date().toISOString() }
                            : c
                    ),
                }));

                try {
                    const result = await sendMessageAPI(conversationId, content);

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

            // === Действия с веткой объекта ===

            openPropertyThread: (propertyId, property) => {
                set({ activePropertyThread: { propertyId, property } });

                // Добавляем ID в список обсуждённых
                set((state) => ({
                    propertyDiscussionIds: state.propertyDiscussionIds.includes(propertyId)
                        ? state.propertyDiscussionIds
                        : [...state.propertyDiscussionIds, propertyId],
                }));

                // Создаём начальные сообщения если их нет
                const existing = get().propertyThreadMessages[propertyId];
                if (!existing || existing.length === 0) {
                    const welcomeMessage: ChatMessage = {
                        id: `thread_welcome_${propertyId}`,
                        conversationId: `thread_${propertyId}`,
                        senderId: 'ai_agent',
                        type: 'system',
                        content: `${property.title} — ${property.address}`,
                        status: 'delivered',
                        createdAt: new Date().toISOString(),
                    };

                    set((state) => ({
                        propertyThreadMessages: {
                            ...state.propertyThreadMessages,
                            [propertyId]: [welcomeMessage],
                        },
                    }));
                }
            },

            closePropertyThread: () => {
                set({ activePropertyThread: null });
            },

            sendThreadMessage: (propertyId, content) => {
                const userMessage: ChatMessage = {
                    id: `thread_msg_${Date.now()}`,
                    conversationId: `thread_${propertyId}`,
                    senderId: 'current_user',
                    type: 'text',
                    content,
                    status: 'sent',
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    propertyThreadMessages: {
                        ...state.propertyThreadMessages,
                        [propertyId]: [
                            ...(state.propertyThreadMessages[propertyId] || []),
                            userMessage,
                        ],
                    },
                }));

                // Имитация ответа агента
                setTimeout(() => {
                    const thread = get().activePropertyThread;
                    if (!thread || thread.propertyId !== propertyId) return;

                    const prop = thread.property;
                    const aiReply: ChatMessage = {
                        id: `thread_reply_${Date.now()}`,
                        conversationId: `thread_${propertyId}`,
                        senderId: 'ai_agent',
                        type: 'text',
                        content: `This ${prop.type || 'property'} at ${prop.address} has ${prop.area}m² with ${prop.rooms} rooms. The monthly rent is ${prop.price.toLocaleString()}€. Would you like to know more about the neighborhood or contact the owner?`,
                        status: 'delivered',
                        createdAt: new Date().toISOString(),
                    };

                    set((state) => ({
                        propertyThreadMessages: {
                            ...state.propertyThreadMessages,
                            [propertyId]: [
                                ...(state.propertyThreadMessages[propertyId] || []),
                                aiReply,
                            ],
                        },
                    }));
                }, 1200);
            },

            requestLocation: (propertyId) => {
                // Пользователь запросил локацию
                const userMsg: ChatMessage = {
                    id: `thread_loc_req_${Date.now()}`,
                    conversationId: `thread_${propertyId}`,
                    senderId: 'current_user',
                    type: 'text',
                    content: '📍 Show location on map',
                    status: 'sent',
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    propertyThreadMessages: {
                        ...state.propertyThreadMessages,
                        [propertyId]: [
                            ...(state.propertyThreadMessages[propertyId] || []),
                            userMsg,
                        ],
                    },
                }));

                // Агент отправляет карту
                setTimeout(() => {
                    const thread = get().activePropertyThread;
                    if (!thread || thread.propertyId !== propertyId) return;

                    const locationMsg: ChatMessage = {
                        id: `thread_loc_resp_${Date.now()}`,
                        conversationId: `thread_${propertyId}`,
                        senderId: 'ai_agent',
                        type: 'ai-status',
                        content: 'location_map',
                        status: 'delivered',
                        createdAt: new Date().toISOString(),
                        metadata: {
                            filterName: thread.property.address,
                        },
                    };

                    set((state) => ({
                        propertyThreadMessages: {
                            ...state.propertyThreadMessages,
                            [propertyId]: [
                                ...(state.propertyThreadMessages[propertyId] || []),
                                locationMsg,
                            ],
                        },
                    }));
                }, 800);
            },

            requestContact: (propertyId) => {
                // Пользователь запросил контакт
                const userMsg: ChatMessage = {
                    id: `thread_contact_req_${Date.now()}`,
                    conversationId: `thread_${propertyId}`,
                    senderId: 'current_user',
                    type: 'text',
                    content: '📞 Show contact info',
                    status: 'sent',
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    propertyThreadMessages: {
                        ...state.propertyThreadMessages,
                        [propertyId]: [
                            ...(state.propertyThreadMessages[propertyId] || []),
                            userMsg,
                        ],
                    },
                }));

                // Агент отвечает контактной формой
                setTimeout(() => {
                    const contactMsg: ChatMessage = {
                        id: `thread_contact_resp_${Date.now()}`,
                        conversationId: `thread_${propertyId}`,
                        senderId: 'ai_agent',
                        type: 'ai-status',
                        content: 'contact_card',
                        status: 'delivered',
                        createdAt: new Date().toISOString(),
                        metadata: {
                            filterName: 'contact',
                        },
                    };

                    set((state) => ({
                        propertyThreadMessages: {
                            ...state.propertyThreadMessages,
                            [propertyId]: [
                                ...(state.propertyThreadMessages[propertyId] || []),
                                contactMsg,
                            ],
                        },
                    }));
                }, 800);
            },

            addThreadNote: (propertyId, note) => {
                const noteMsg: ChatMessage = {
                    id: `thread_note_${Date.now()}`,
                    conversationId: `thread_${propertyId}`,
                    senderId: 'current_user',
                    type: 'ai-status',
                    content: 'note',
                    status: 'sent',
                    createdAt: new Date().toISOString(),
                    metadata: {
                        filterName: `${note.date} ${note.time}`,
                        filterId: note.content,
                    },
                };

                set((state) => ({
                    propertyThreadMessages: {
                        ...state.propertyThreadMessages,
                        [propertyId]: [
                            ...(state.propertyThreadMessages[propertyId] || []),
                            noteMsg,
                        ],
                    },
                }));
            },
        }),
        {
            name: 'realbro-chat-store',
            partialize: () => ({}),
        }
    )
);
