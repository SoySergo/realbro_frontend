import type { PropertyChatCard } from '@/entities/property';

// === Типы для AI Agent Chat v2 ===

export type QuickActionType =
    | 'describe'
    | 'note'
    | 'favorite'
    | 'suitable'
    | 'not-suitable'
    | 'nearby'
    | 'contact';

export type PropertyReaction = 'like' | 'dislike' | 'report';

export type ThreadMessageType =
    | 'text'
    | 'agent-text'
    | 'description'
    | 'note'
    | 'nearby-map'
    | 'contact-form'
    | 'action-result';

export interface ThreadMessage {
    id: string;
    threadId: string;
    type: ThreadMessageType;
    content: string;
    senderId: 'user' | 'agent';
    createdAt: string;
    metadata?: {
        actionType?: QuickActionType;
        noteText?: string;
        contactMethod?: 'phone' | 'whatsapp' | 'email';
    };
}

export interface PropertyThread {
    id: string;
    propertyId: string;
    property: PropertyChatCard;
    messages: ThreadMessage[];
    reaction?: PropertyReaction;
    isFavorite: boolean;
    isSuitable: boolean | null;
    hasNote: boolean;
    noteText?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AgentV2Labels {
    title: string;
    findMe: string;
    propertyThread: string;
    backToFeed: string;
    threads: string;
    noThreads: string;
    mediaGallery: string;
    showAll: string;
    photos: string;
    closeGallery: string;
    quickActions: Record<string, string>;
    actions: Record<string, string>;
    noteForm: Record<string, string>;
    contactForm: Record<string, string>;
    agentStatus: Record<string, string>;
    notifications: Record<string, string>;
    filters: Record<string, string>;
    property: Record<string, string>;
}
