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
    initializeDemoScenario: () => Promise<void>;
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

            initializeDemoScenario: async () => {
                const state = get();
                const aiConv = state.conversations.find((c) => c.type === 'ai-agent');
                
                if (!aiConv) {
                    await state.fetchConversations();
                    // Retry once
                    const retryConv = get().conversations.find((c) => c.type === 'ai-agent');
                    if (!retryConv) return;
                    
                    // Recursive call with fresh state
                    get().initializeDemoScenario();
                    return;
                }

                // Clear existing messages for this conversation to ensure clean demo state
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [aiConv.id]: [],
                    }
                }));

                const now = new Date();
                const messages: ChatMessage[] = [];
                let msgIdCounter = 1000;

                // Helper to create batch message
                const createBatch = (count: number, date: Date, startId: number) => {
                    const properties = [];
                    for (let i = 0; i < count; i++) {
                        properties.push(generateMockProperty(startId + i));
                    }
                    
                    // Create multiple messages or one batch? 
                    // Requirement: "Grouped". The current UI groups by time.
                    // Let's create individual messages closely timed so they group.
                    
                    const msgs: ChatMessage[] = [];
                    const filterNames = ['Barcelona Center', 'Gracia Budget', 'Eixample Premium'];
                    
                    // We'll create one message per property to allow existing grouping logic to work,
                    // or we could create batch messages if the backend supports it.
                    // Looking at the code, it supports 'property' type with multiple properties array?
                    // "msg.properties?.length || 1" implies it handles arrays.
                    // But to ensure "grouped" UI (which groups by time), individual messages might be better tested.
                    // valid types: 'text' | 'property' | 'property-batch'
                    
                    // Let's simulate distinct messages to rely on the frontend grouping logic we saw in AIAgentPropertyFeed
                    // (getGroupKey function)
                    
                    for (let i = 0; i < count; i++) {
                        const property = properties[i];
                        const filterIdx = i % 3;
                        
                        msgs.push({
                            id: `msg_demo_${startId + i}`,
                            conversationId: aiConv.id,
                            senderId: 'ai-agent',
                            type: 'property',
                            content: '',
                            properties: [property],
                            status: 'delivered',
                            createdAt: date.toISOString(),
                            metadata: {
                                filterName: filterNames[filterIdx],
                                filterId: `filter_${filterIdx}`,
                            },
                        });
                    }
                    return msgs;
                };

                // 1. Yesterday: 10 objects
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(14, 0, 0, 0); // Yesterday 2 PM
                messages.push(...createBatch(10, yesterday, 2000));

                // 2. Today: 20 objects (grouped)
                const today = new Date(now);
                today.setHours(10, 0, 0, 0); // Today 10 AM
                messages.push(...createBatch(20, today, 3000));

                // Update store with historical data
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [aiConv.id]: messages
                    }
                }));

                // 3. Start simulation: New object every 5 seconds
                get().startSimulation();
            },

            startSimulation: () => {
                const existing = get().simulationInterval;
                if (existing) return;

                let counter = 5000;
                const interval = setInterval(() => {
                    const state = get();
                    const aiConv = state.conversations.find(
                        (c) => c.type === 'ai-agent'
                    );
                    if (!aiConv) return;

                    counter++;
                    const property = generateMockProperty(counter);
                    // Add "NEW" flag to property or handle via isRealTime
                    property.isNew = true; 

                    const filterNames = ['Barcelona Center', 'Gracia Budget', 'Eixample Premium'];
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
                            filterId: `filter_${filterIdx}`,
                        },
                    });
                }, 5000); // Every 5 seconds

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
            // Don't persist activeConversationId - user should select chat on each visit
            partialize: () => ({}),
        }
    )
);
