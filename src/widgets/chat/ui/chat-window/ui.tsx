'use client';

import { MessageSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatStore } from '@/features/chat-messages';
import { MessageList } from '@/features/chat-messages/ui/message-list';
import { SendMessageForm } from '@/features/chat-messages/ui/send-message-form';
import { ChatHeader } from '../chat-header/ui';
import { AIAgentPropertyFeed } from '../ai-agent-property-feed/ui';
import type { PropertyCardLabels } from '@/entities/chat';

interface ChatWindowProps {
    onSettingsClick?: () => void;
    onBackClick?: () => void;
    showBack?: boolean;
    labels: {
        online: string;
        offline: string;
        aiAgentTitle: string;
        settings: string;
        messagePlaceholder: string;
        selectConversation: string;
        emptyTitle: string;
        emptySubtitle: string;
        filters: Record<string, string>;
        aiAgent: Record<string, string>;
        noProperties: string;
        allFilters: string;
        selectFilter: string;
        propertyCard?: PropertyCardLabels;
    };
    className?: string;
}

export function ChatWindow({
    onSettingsClick,
    onBackClick,
    showBack,
    labels,
    className,
}: ChatWindowProps) {
    const {
        conversations,
        activeConversationId,
        messages,
        isLoadingMessages,
        retryMessage,
    } = useChatStore();

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId
    );

    // Empty state — no conversation selected
    if (!activeConversation || !activeConversationId) {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center h-full bg-background gap-4 px-6',
                    className
                )}
            >
                <div className="w-18 h-18 rounded-[28px] bg-background-secondary flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-8 h-8 text-text-tertiary" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-text-secondary max-w-xs">
                        {labels.selectConversation}
                    </p>
                </div>
            </div>
        );
    }

    const conversationMessages = messages[activeConversationId] || [];
    const isAIAgent = activeConversation.type === 'ai-agent';

    return (
        <div
            className={cn(
                'flex flex-col h-full bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_28%)] bg-background',
                className
            )}
        >
            <ChatHeader
                conversation={activeConversation}
                onSettingsClick={isAIAgent ? onSettingsClick : undefined}
                onBackClick={onBackClick}
                showBack={showBack}
                labels={labels}
            />

            {isAIAgent ? (
                <AIAgentPropertyFeed
                    conversationId={activeConversationId}
                    labels={labels}
                />
            ) : (
                <MessageList
                    messages={conversationMessages}
                    isLoading={isLoadingMessages}
                    onRetryMessage={(messageId) => retryMessage(messageId, activeConversationId)}
                    className="flex-1"
                />
            )}

            <SendMessageForm
                conversationId={activeConversationId}
                placeholder={labels.messagePlaceholder}
            />
        </div>
    );
}
