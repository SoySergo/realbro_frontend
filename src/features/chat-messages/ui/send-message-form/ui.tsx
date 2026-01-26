'use client';

import { useState, useRef } from 'react';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || isSending) return;

        setMessage('');
        await sendMessage(conversationId, trimmed);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'flex items-end gap-2 p-3 border-t border-border bg-background',
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
                    'flex-1 resize-none rounded-xl border border-border bg-background-secondary',
                    'px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary',
                    'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
                    'transition-all duration-200 max-h-32',
                    'scrollbar-hide'
                )}
                style={{ minHeight: '40px' }}
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
            />
            <button
                type="submit"
                disabled={!message.trim() || isSending}
                className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    'transition-all duration-200 shrink-0 cursor-pointer',
                    message.trim()
                        ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                        : 'bg-background-tertiary text-text-tertiary cursor-not-allowed'
                )}
            >
                <Send className="w-4 h-4" />
            </button>
        </form>
    );
}
