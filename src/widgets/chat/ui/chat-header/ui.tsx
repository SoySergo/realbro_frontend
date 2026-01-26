'use client';

import { Settings, ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ChatAvatar } from '@/entities/chat';
import type { Conversation } from '@/entities/chat';

interface ChatHeaderProps {
    conversation: Conversation;
    onSettingsClick?: () => void;
    onBackClick?: () => void;
    showBack?: boolean;
    labels: {
        online: string;
        offline: string;
        aiAgentTitle: string;
        settings: string;
    };
    className?: string;
}

export function ChatHeader({
    conversation,
    onSettingsClick,
    onBackClick,
    showBack,
    labels,
    className,
}: ChatHeaderProps) {
    const isOnline =
        conversation.type === 'ai-agent' || conversation.type === 'support'
            ? true
            : undefined;

    const subtitle =
        conversation.type === 'ai-agent'
            ? labels.aiAgentTitle
            : conversation.type === 'support'
              ? labels.online
              : isOnline !== undefined
                ? isOnline
                    ? labels.online
                    : labels.offline
                : undefined;

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-4 h-16 border-b border-border bg-background shrink-0',
                className
            )}
        >
            {showBack && (
                <button
                    onClick={onBackClick}
                    className="p-1.5 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer md:hidden"
                >
                    <ArrowLeft className="w-5 h-5 text-text-secondary" />
                </button>
            )}

            <ChatAvatar
                type={conversation.type}
                avatar={conversation.avatar}
                title={conversation.title}
                isOnline={isOnline}
                size="md"
            />

            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary truncate">
                    {conversation.title}
                </h3>
                {subtitle && (
                    <p className="text-xs text-text-secondary">{subtitle}</p>
                )}
            </div>

            {conversation.type === 'ai-agent' && onSettingsClick && (
                <button
                    onClick={onSettingsClick}
                    className={cn(
                        'p-2 rounded-lg cursor-pointer',
                        'hover:bg-background-tertiary transition-colors',
                        'text-text-secondary hover:text-text-primary'
                    )}
                    title={labels.settings}
                >
                    <Settings className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
