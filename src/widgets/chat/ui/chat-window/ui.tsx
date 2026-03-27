'use client';

import { MessageSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatStore } from '@/features/chat-messages';
import { MessageList } from '@/features/chat-messages/ui/message-list';
import { SendMessageForm } from '@/features/chat-messages/ui/send-message-form';
import { ChatHeader } from '../chat-header/ui';
import { AIAgentPropertyFeed } from '../ai-agent-property-feed/ui';
import { PropertyThreadView } from '../property-thread-view/ui';
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
        retry?: string;
        retrySending?: string;
        today?: string;
        yesterday?: string;
        filters: Record<string, string>;
        aiAgent: Record<string, string>;
        noProperties: string;
        allFilters: string;
        selectFilter: string;
        propertyCard?: PropertyCardLabels;
        thread?: Record<string, string>;
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
        activePropertyThread,
        closePropertyThread,
    } = useChatStore();

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId
    );

    // Ветка обсуждения объекта — полноэкранное представление
    if (activePropertyThread) {
        return (
            <PropertyThreadView
                propertyId={activePropertyThread.propertyId}
                property={activePropertyThread.property}
                onBack={closePropertyThread}
                labels={{
                    messagePlaceholder: labels.thread?.messagePlaceholder || labels.messagePlaceholder,
                    location: labels.thread?.location,
                    contact: labels.thread?.contact,
                    note: labels.thread?.note,
                    noteLabel: labels.thread?.noteLabel,
                    newBadge: labels.propertyCard?.new,
                    loadingNearby: labels.thread?.loadingNearby,
                    perMonth: labels.propertyCard?.perMonth,
                    walkMin: labels.propertyCard?.walkMin,
                    showOnMap: labels.thread?.showOnMap,
                    expandMap: labels.thread?.expandMap,
                    showPhone: labels.thread?.showPhone,
                    writeWhatsapp: labels.thread?.writeWhatsapp,
                    writeEmail: labels.thread?.writeEmail,
                    writeTelegram: labels.thread?.writeTelegram,
                    goToOwner: labels.thread?.goToOwner,
                    noteTitle: labels.thread?.noteTitle,
                    noteContent: labels.thread?.noteContent,
                    noteDate: labels.thread?.noteDate,
                    noteTime: labels.thread?.noteTime,
                    noteSave: labels.thread?.noteSave,
                    noteCancel: labels.thread?.noteCancel,
                    categories: labels.thread ? {
                        transport: labels.thread.categories_transport,
                        shops: labels.thread.categories_shops,
                        restaurants: labels.thread.categories_restaurants,
                        parks: labels.thread.categories_parks,
                        schools: labels.thread.categories_schools,
                        healthcare: labels.thread.categories_healthcare,
                    } : undefined,
                }}
                className={className}
            />
        );
    }

    // Пустое состояние — беседа не выбрана
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
                <div className="text-center space-y-1 px-6">
                    <p className="text-base font-semibold text-text-primary">
                        {labels.emptyTitle}
                    </p>
                    <p className="text-sm text-text-tertiary max-w-[280px]">
                        {labels.emptySubtitle}
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
                    onRetryMessage={(messageId) => retryMessage(messageId, activeConversationId)}
                    labels={{
                        today: labels.today,
                        yesterday: labels.yesterday,
                        retry: labels.retry,
                        retrySending: labels.retrySending,
                    }}
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
