'use client';

import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatStore } from '../../model/store';

interface SendMessageFormProps {
    conversationId: string;
    placeholder?: string;
    className?: string;
}

export function SendMessageForm({
    conversationId,
    placeholder = 'Type a message...',
    className,
}: SendMessageFormProps) {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { sendMessage, isSending } = useChatStore();

    // Мемоизация обработчика отправки
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || isSending) return;

        setMessage('');
        await sendMessage(conversationId, trimmed);
        inputRef.current?.focus();
    }, [message, isSending, conversationId, sendMessage]);

    // Мемоизация обработчика клавиш
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    // Автоматическое изменение высоты textarea
    const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
    }, []);

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'flex items-end gap-2 p-3 md:p-4 border-t border-border/70',
                'bg-linear-to-t from-background via-background to-background/95 backdrop-blur-xl',
                className
            )}
        >
            <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                className={cn(
                    'flex-1 resize-none rounded-[22px] border border-border bg-background-secondary/90 shadow-sm',
                    'px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary',
                    'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
                    'transition-all duration-200 max-h-32',
                    'scrollbar-hide'
                )}
                style={{ minHeight: '48px' }}
                onInput={handleInput}
            />
            <button
                type="submit"
                disabled={!message.trim() || isSending}
                className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center shadow-sm',
                    'transition-all duration-200 shrink-0 cursor-pointer',
                    message.trim()
                        ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                        : 'bg-background-tertiary text-text-tertiary cursor-not-allowed'
                )}
            >
                <Send className="w-4.5 h-4.5" />
            </button>
        </form>
    );
}
