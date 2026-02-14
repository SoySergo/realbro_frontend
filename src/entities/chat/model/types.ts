import type { Property } from '@/entities/property';

// === Chat Types ===

export type ChatType = 'p2p' | 'support';

export type MessageType =
    | 'text'
    | 'property'
    | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export type PropertyAction = 'like' | 'dislike' | 'save' | 'view';

export type DayFilter = 'today' | 'yesterday' | 'this-week' | 'this-month' | 'all';

export type NotificationFrequency =
    | 'immediately'
    | '15min'
    | '30min'
    | '1hour'
    | '2hours';

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    type: MessageType;
    content: string;
    properties?: Property[];
    status: MessageStatus;
    createdAt: string;
    readAt?: string;
    /** True if message was pushed via WebSocket (real-time) */
    isRealTime?: boolean;
    metadata?: {
        filterName?: string;
        filterId?: string;
        batchId?: string;
        matchedFilters?: Array<{ id: string; name: string }>;
        actionTaken?: PropertyAction;
    };
}

export interface Conversation {
    id: string;
    type: ChatType;
    title: string;
    avatar?: string;
    participants: string[];
    lastMessage?: ChatMessage;
    unreadCount: number;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ChatFilterState {
    dayFilter: DayFilter;
    selectedFilterIds: string[];
    showAllFilters: boolean;
}

export interface ChatUser {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
}

export interface AIAgentSettings {
    isActive: boolean;
    notificationStartHour: number;
    notificationEndHour: number;
    notificationFrequency: NotificationFrequency;
    linkedFilterIds: string[];
}
