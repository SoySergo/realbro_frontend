'use client';

import { cn } from '@/shared/lib/utils';
import { ChatAvatar } from '../chat-avatar';
import type { Conversation } from '../../model/types';

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    className?: string;
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
        const mins = Math.floor(diffMs / (1000 * 60));
        return mins < 1 ? 'now' : `${mins}m`;
    }
    if (diffHours < 24) {
        return `${Math.floor(diffHours)}h`;
    }
    if (diffDays < 7) {
        return `${Math.floor(diffDays)}d`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getLastMessagePreview(conversation: Conversation): string {
    const msg = conversation.lastMessage;
    if (!msg) return '';

    if (msg.type === 'property' || msg.type === 'property-batch') {
        const count = msg.properties?.length ?? 1;
        return count > 1
            ? `${count} new properties`
            : 'New property found';
    }

    return msg.content;
}

export function ConversationItem({
    conversation,
    isActive,
    onClick,
    className,
}: ConversationItemProps) {
    const preview = getLastMessagePreview(conversation);
    const time = conversation.lastMessage
        ? formatTime(conversation.lastMessage.createdAt)
        : '';

    const isOnline =
        conversation.type === 'ai-agent'
            ? true
            : conversation.type === 'support'
              ? true
              : undefined;

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer',
                'transition-colors duration-150 text-left',
                isActive
                    ? 'bg-brand-primary-light border border-brand-primary/20'
                    : 'hover:bg-background-tertiary',
                className
            )}
        >
            <ChatAvatar
                type={conversation.type}
                avatar={conversation.avatar}
                title={conversation.title}
                isOnline={isOnline}
                size="md"
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                        {conversation.title}
                    </span>
                    <span className="text-[10px] text-text-tertiary shrink-0">
                        {time}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-text-secondary truncate">
                        {preview}
                    </p>
                    {conversation.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conversation.unreadCount > 9
                                ? '9+'
                                : conversation.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
