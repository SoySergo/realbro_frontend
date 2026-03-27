'use client';

import { Check, CheckCheck, Clock, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ChatMessage } from '../../model/types';

interface MessageBubbleLabels {
    retry?: string;
    retrySending?: string;
}

interface MessageBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
    onRetry?: (messageId: string) => void;
    labels?: MessageBubbleLabels;
    className?: string;
}

export function MessageBubble({ message, isOwn, onRetry, labels = {}, className }: MessageBubbleProps) {
    if (message.type === 'system') {
        return (
            <div className={cn('flex justify-center py-2', className)}>
                <span className="text-[11px] text-text-tertiary bg-background-tertiary/80 px-3 py-1 rounded-full font-medium">
                    {message.content}
                </span>
            </div>
        );
    }

    if (message.type === 'ai-status') {
        return (
            <div className={cn('flex items-start gap-2 py-2', className)}>
                <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl px-4 py-2.5 max-w-[80%]">
                    <Search className="w-4 h-4 text-brand-primary shrink-0 animate-pulse" />
                    <span className="text-sm text-text-primary">{message.content}</span>
                </div>
            </div>
        );
    }

    const renderStatusIcon = () => {
        if (!isOwn) return null;

        if (message.status === 'error') {
            return (
                <button
                    onClick={() => onRetry?.(message.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                    title={labels.retrySending || 'Retry sending'}
                >
                    <AlertCircle className="w-3 h-3" />
                    <RefreshCw className="w-3 h-3" />
                </button>
            );
        }

        switch (message.status) {
            case 'sending':
                return <Clock className="w-3 h-3 text-white/50" />;
            case 'sent':
                return <Check className="w-3 h-3 text-white/60" />;
            case 'delivered':
                return <CheckCheck className="w-3 h-3 text-white/60" />;
            case 'read':
                return <CheckCheck className="w-3 h-3 text-white" />;
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
                'group',
                className
            )}
        >
            <div
                className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 relative shadow-sm',
                    isOwn
                        ? 'bg-brand-primary text-white rounded-br-md'
                        : 'bg-background-secondary text-text-primary rounded-bl-md',
                    message.status === 'error' && 'opacity-70'
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
                    {renderStatusIcon()}
                </div>

                {/* Кнопка повторной отправки при ошибке */}
                {message.status === 'error' && onRetry && (
                    <button
                        onClick={() => onRetry(message.id)}
                        className="absolute -bottom-6 right-0 text-[11px] text-red-500 hover:text-red-400 font-medium transition-colors cursor-pointer"
                    >
                        {labels.retry || 'Retry'}
                    </button>
                )}
            </div>
        </div>
    );
}
