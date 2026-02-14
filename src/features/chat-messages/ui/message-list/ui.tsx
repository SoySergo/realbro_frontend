'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { MessageBubble, PropertyBatchCard, PropertyBatchCarousel, TypingIndicator } from '@/entities/chat';
import { PropertyActionButtons } from '@/features/chat-property-actions/ui/property-action-buttons';
import { usePropertyActionsStore } from '@/features/chat-property-actions';
import { MessageListSkeleton } from './message-list-skeleton';
import type { ChatMessage } from '@/entities/chat';
import type { PropertyChatCard } from '@/entities/property';

interface MessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
    isTyping?: boolean;
    typingLabel?: string;
    onRetryMessage?: (messageId: string) => void;
    className?: string;
}

// Мемоизация DateSeparator для предотвращения ререндеров
const DateSeparator = ({ date }: { date: string }) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday =
        d.toDateString() === new Date(now.getTime() - 86400000).toDateString();

    let label = d.toLocaleDateString([], { month: 'long', day: 'numeric' });
    if (isToday) label = 'Today';
    if (isYesterday) label = 'Yesterday';

    return (
        <div className="flex items-center gap-3 py-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider">
                {label}
            </span>
            <div className="flex-1 h-px bg-border" />
        </div>
    );
}

export function MessageList({
    messages,
    isLoading,
    isTyping,
    typingLabel,
    onRetryMessage,
    className,
}: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { viewedIds } = usePropertyActionsStore();
    
    // Мемоизация viewedSet для предотвращения создания нового Set при каждом рендере
    const viewedSet = useMemo(() => new Set(viewedIds), [viewedIds]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        // Используем requestAnimationFrame для плавного скролла
        requestAnimationFrame(() => {
            el.scrollTo({
                top: el.scrollHeight,
                behavior: 'smooth',
            });
        });
    }, [messages.length]);

    // Мемоизация функции рендеринга для предотвращения пересоздания
    const renderPropertyMessage = useCallback((message: ChatMessage) => {
        if (!message.properties?.length) return null;

        if (message.type === 'property' && message.properties.length === 1) {
            const prop = message.properties[0];
            return (
                <div className="py-1">
                    <PropertyBatchCard
                        property={prop}
                        filterName={message.metadata?.filterName}
                        actions={<PropertyActionButtons propertyId={prop.id} />}
                    />
                </div>
            );
        }

        if (message.type === 'property-batch') {
            return (
                <div className="py-1 max-w-[95%]">
                    <PropertyBatchCarousel
                        properties={message.properties}
                        batchLabel={message.content || `${message.properties.length} properties`}
                        filterName={message.metadata?.filterName}
                        viewedIds={viewedSet}
                        renderCard={(property: PropertyChatCard) => (
                            <PropertyBatchCard
                                property={property}
                                filterName={message.metadata?.filterName}
                                actions={<PropertyActionButtons propertyId={property.id} />}
                            />
                        )}
                    />
                </div>
            );
        }

        return null;
    }, [viewedSet]);

    if (isLoading) {
        return <MessageListSkeleton className={className} />;
    }

    let lastDateStr = '';

    return (
        <div
            ref={scrollRef}
            className={cn(
                'flex-1 overflow-y-auto px-4 py-2 space-y-1',
                'scrollbar-hide',
                className
            )}
        >
            {messages.map((message) => {
                const dateStr = new Date(message.createdAt).toDateString();
                const showDateSeparator = dateStr !== lastDateStr;
                lastDateStr = dateStr;

                const isOwn = message.senderId === 'current_user';

                return (
                    <div key={message.id}>
                        {showDateSeparator && (
                            <DateSeparator date={message.createdAt} />
                        )}
                        {message.type === 'property' || message.type === 'property-batch' ? (
                            renderPropertyMessage(message)
                        ) : (
                            <MessageBubble 
                                message={message} 
                                isOwn={isOwn}
                                onRetry={onRetryMessage}
                            />
                        )}
                    </div>
                );
            })}

            {isTyping && <TypingIndicator label={typingLabel} />}
        </div>
    );
}
