'use client';

import { cn } from '@/shared/lib/utils';
import { ChatAvatar } from '../chat-avatar';
import type { Conversation } from '../../model/types';

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    labels?: {
        yesterday?: string;
    };
}

export function ConversationItem({
    conversation,
    isActive,
    onClick,
    labels = {},
}: ConversationItemProps) {
    const { title, lastMessage, unreadCount, type } = conversation;

    const isOnline = type === 'ai-agent' || type === 'support';

    // Форматирование времени
    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const oneDay = 86400000;

        if (diff < oneDay && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (diff < 2 * oneDay) return labels.yesterday || 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer',
                'transition-all duration-200 text-left',
                isActive
                    ? 'bg-brand-primary/10 shadow-sm'
                    : 'hover:bg-background-secondary active:scale-[0.98]'
            )}
        >
            <ChatAvatar
                type={type}
                avatar={conversation.avatar}
                title={title}
                isOnline={isOnline}
                size="lg"
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <h4 className={cn(
                        'text-sm truncate',
                        unreadCount > 0 ? 'font-bold text-text-primary' : 'font-semibold text-text-primary'
                    )}>
                        {title}
                    </h4>
                    <span className="text-[11px] text-text-tertiary shrink-0 font-medium">
                        {formatTime(lastMessage?.createdAt)}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                        'text-xs truncate',
                        unreadCount > 0 ? 'text-text-secondary font-medium' : 'text-text-tertiary'
                    )}>
                        {lastMessage?.content || '...'}
                    </p>
                    {unreadCount > 0 && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
