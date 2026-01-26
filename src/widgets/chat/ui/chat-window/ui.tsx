'use client';

import { MessageSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatStore } from '@/features/chat-messages';
import { MessageList } from '@/features/chat-messages/ui/message-list';
import { SendMessageForm } from '@/features/chat-messages/ui/send-message-form';
import { ChatHeader } from '../chat-header/ui';
import { AIAgentPropertyFeed } from '../ai-agent-property-feed/ui';

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
    } = useChatStore();

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId
    );

    // Empty state — no conversation selected
    if (!activeConversation || !activeConversationId) {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center h-full bg-background gap-4',
                    className
                )}
            >
                <div className="w-16 h-16 rounded-2xl bg-background-secondary flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-text-tertiary" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-text-secondary">
                        {labels.selectConversation}
                    </p>
                </div>
            </div>
        );
    }

    const conversationMessages = messages[activeConversationId] || [];
    const isAIAgent = activeConversation.type === 'ai-agent';

    return (
        <div className={cn('flex flex-col h-full bg-background', className)}>
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
