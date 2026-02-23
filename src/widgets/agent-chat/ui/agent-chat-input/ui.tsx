'use client';

import { memo, useState, useRef, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { useAgentChatStore } from '@/features/agent-chat';
import type { AgentChatLabels } from '@/entities/agent-chat';

interface AgentChatInputProps {
  labels: AgentChatLabels;
  className?: string;
}

export const AgentChatInput = memo(function AgentChatInput({
  labels,
  className,
}: AgentChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isSending } = useAgentChatStore();

  const handleSend = useCallback(() => {
    if (!value.trim() || isSending) return;
    sendMessage(value.trim());
    setValue('');
    inputRef.current?.focus();
  }, [value, isSending, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className={cn('px-3 pb-3 pt-2 border-t border-border bg-background shrink-0', className)}>
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={labels.messages.placeholder}
          rows={1}
          className={cn(
            'flex-1 rounded-xl border border-border bg-background-secondary px-3 py-2 text-sm',
            'text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
            'resize-none transition-all duration-200',
            'max-h-24 overflow-y-auto'
          )}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isSending}
          className={cn(
            'p-2.5 rounded-xl transition-colors cursor-pointer shrink-0',
            value.trim() && !isSending
              ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
              : 'bg-background-tertiary text-text-tertiary'
          )}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
});
