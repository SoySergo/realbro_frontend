'use client';

import { Check, CheckCheck, Clock, AlertCircle, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ChatMessage } from '../../model/types';

interface MessageBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
    className?: string;
}

export function MessageBubble({ message, isOwn, className }: MessageBubbleProps) {
    if (message.type === 'system') {
        return (
            <div className={cn('flex justify-center py-2', className)}>
                <span className="text-xs text-text-tertiary bg-background-tertiary px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    if (message.type === 'ai-status') {
        return (
            <div className={cn('flex items-start gap-2 py-2', className)}>
                <div className="flex items-center gap-2 bg-brand-primary-light border border-brand-primary/20 rounded-lg px-3 py-2 max-w-[80%]">
                    <Search className="w-4 h-4 text-brand-primary shrink-0" />
                    <span className="text-sm text-text-primary">{message.content}</span>
                </div>
            </div>
        );
    }

    const StatusIcon = () => {
        if (!isOwn) return null;
        switch (message.status) {
            case 'sending':
                return <Clock className="w-3 h-3 text-text-tertiary" />;
            case 'sent':
                return <Check className="w-3 h-3 text-text-tertiary" />;
            case 'delivered':
                return <CheckCheck className="w-3 h-3 text-text-tertiary" />;
            case 'read':
                return <CheckCheck className="w-3 h-3 text-brand-primary" />;
            case 'error':
                return <AlertCircle className="w-3 h-3 text-error" />;
            default:
                return null;
        }
    };

    const time = new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            className={cn(
                'flex',
                isOwn ? 'justify-end' : 'justify-start',
                className
            )}
        >
            <div
                className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 relative',
                    isOwn
                        ? 'bg-brand-primary text-white rounded-br-md'
                        : 'bg-background-secondary text-text-primary rounded-bl-md'
                )}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                </p>
                <div
                    className={cn(
                        'flex items-center gap-1 mt-1',
                        isOwn ? 'justify-end' : 'justify-start'
                    )}
                >
                    <span
                        className={cn(
                            'text-[10px]',
                            isOwn ? 'text-white/70' : 'text-text-tertiary'
                        )}
                    >
                        {time}
                    </span>
                    <StatusIcon />
                </div>
            </div>
        </div>
    );
}
