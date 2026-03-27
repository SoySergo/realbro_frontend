'use client';

import { useState, useRef, useCallback } from 'react';
import { Send, Mic } from 'lucide-react';
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

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || isSending) return;

        setMessage('');
        await sendMessage(conversationId, trimmed);
        inputRef.current?.focus();
    }, [message, isSending, conversationId, sendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
    }, []);

    const hasContent = message.trim().length > 0;

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'flex items-end gap-2 p-3 border-t border-border/50',
                'bg-background/80 backdrop-blur-sm shrink-0',
                className
            )}
        >
            <div className="flex-1 bg-background-secondary rounded-2xl relative min-h-[44px] flex items-center">
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={1}
                    className={cn(
                        'w-full bg-transparent border-none px-4 py-3 text-sm',
                        'text-text-primary placeholder:text-text-tertiary',
                        'focus:outline-none resize-none max-h-32 min-h-[44px]',
                        'scrollbar-hide'
                    )}
                    onInput={handleInput}
                />
            </div>

            {hasContent ? (
                <button
                    type="submit"
                    disabled={isSending}
                    className={cn(
                        'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
                        'bg-brand-primary text-white shadow-sm',
                        'hover:bg-brand-primary-hover transition-all duration-200',
                        'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                    )}
                >
                    <Send className="w-5 h-5" />
                </button>
            ) : (
                <button
                    type="button"
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                    <Mic className="w-5 h-5" />
                </button>
            )}
        </form>
    );
}
