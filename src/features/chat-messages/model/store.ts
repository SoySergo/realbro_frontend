'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, Conversation } from '@/entities/chat';
import {
    getConversations,
    getMessages,
    sendMessage as sendMessageAPI,
    generateMockProperty,
} from '@/shared/api/chat';

interface ChatStore {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, ChatMessage[]>;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    isSending: boolean;
    simulationInterval: ReturnType<typeof setInterval> | null;

    setActiveConversation: (id: string | null) => void;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, content: string) => Promise<void>;
    addIncomingMessage: (message: ChatMessage) => void;
    markAsRead: (conversationId: string) => void;
    startSimulation: () => void;
    stopSimulation: () => void;
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
            simulationInterval: null,

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
            },

            addIncomingMessage: (message) => {
                set((state) => {
                    const conversationMsgs = state.messages[message.conversationId] || [];

                    // Check if we should merge into an existing batch
                    if (message.type === 'property' && message.properties?.length === 1) {
                        const lastMsg = conversationMsgs[conversationMsgs.length - 1];
                        if (
                            lastMsg &&
                            (lastMsg.type === 'property' || lastMsg.type === 'property-batch') &&
                            lastMsg.senderId === 'ai-agent'
                        ) {
                            // Merge into batch
                            const existingProps = lastMsg.properties || [];
                            const mergedMsg: ChatMessage = {
                                ...lastMsg,
                                type: 'property-batch',
                                content: `${existingProps.length + 1} new properties`,
                                properties: [...existingProps, ...(message.properties || [])],
                                createdAt: message.createdAt,
                            };
                            return {
                                messages: {
                                    ...state.messages,
                                    [message.conversationId]: [
                                        ...conversationMsgs.slice(0, -1),
                                        mergedMsg,
                                    ],
                                },
                            };
                        }
                    }

                    return {
                        messages: {
                            ...state.messages,
                            [message.conversationId]: [
                                ...conversationMsgs,
                                message,
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

            startSimulation: () => {
                const existing = get().simulationInterval;
                if (existing) return;

                let counter = 200;
                const interval = setInterval(() => {
                    const state = get();
                    const aiConv = state.conversations.find(
                        (c) => c.type === 'ai-agent'
                    );
                    if (!aiConv) return;

                    counter++;
                    const property = generateMockProperty(counter);
                    const filterNames = ['Barcelona Center', 'Gracia Budget', 'Eixample Premium'];
                    const filterIds = ['filter_1', 'filter_2', 'filter_3'];
                    const filterIdx = counter % 3;

                    state.addIncomingMessage({
                        id: `msg_sim_${Date.now()}`,
                        conversationId: aiConv.id,
                        senderId: 'ai-agent',
                        type: 'property',
                        content: '',
                        properties: [property],
                        status: 'delivered',
                        createdAt: new Date().toISOString(),
                        metadata: {
                            filterName: filterNames[filterIdx],
                            filterId: filterIds[filterIdx],
                        },
                    });
                }, 15000); // Every 15 seconds

                set({ simulationInterval: interval });
            },

            stopSimulation: () => {
                const interval = get().simulationInterval;
                if (interval) {
                    clearInterval(interval);
                    set({ simulationInterval: null });
                }
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
            partialize: (state) => ({
                activeConversationId: state.activeConversationId,
            }),
        }
    )
);
