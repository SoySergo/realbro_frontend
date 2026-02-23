'use client';

import { memo } from 'react';
import { Bot, User, Search, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AgentMessage } from '@/entities/agent-chat';

interface AgentMessageBubbleProps {
  message: AgentMessage;
  locale?: string;
  className?: string;
}

export const AgentMessageBubble = memo(function AgentMessageBubble({
  message,
  locale = 'ru',
  className,
}: AgentMessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.type === 'system';
  const isStatus = message.type === 'status';

  // Системные сообщения
  if (isSystem) {
    return (
      <div className={cn('flex justify-center py-1', className)}>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background-tertiary text-text-tertiary text-xs">
          <Info className="w-3 h-3" />
          {message.content}
        </div>
      </div>
    );
  }

  // Статус поиска
  if (isStatus) {
    return (
      <div className={cn('flex justify-center py-1', className)}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs">
          <Search className="w-3 h-3 animate-pulse" />
          {message.content}
        </div>
      </div>
    );
  }

  // Ответ на сообщение
  const hasReply = !!message.replyTo;

  const time = new Date(message.createdAt).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn(
      'flex gap-2 max-w-[85%]',
      isUser ? 'ml-auto flex-row-reverse' : '',
      className
    )}>
      {/* Аватар */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-brand-primary" />
        </div>
      )}

      <div className="space-y-0.5">
        {/* Ответ на сообщение */}
        {hasReply && (
          <div className={cn(
            'text-[11px] px-2.5 py-1 rounded-t-lg border-l-2',
            isUser
              ? 'bg-brand-primary/5 border-brand-primary/50 text-text-secondary'
              : 'bg-background-tertiary border-brand-primary/50 text-text-secondary'
          )}>
            {message.replyTo?.propertyTitle && (
              <span className="font-medium">{message.replyTo.propertyTitle}: </span>
            )}
            <span className="line-clamp-1">{message.replyTo?.preview}</span>
          </div>
        )}

        {/* Пузырь сообщения */}
        <div className={cn(
          'px-3 py-2 text-sm',
          isUser
            ? 'bg-brand-primary text-white rounded-2xl rounded-tr-md'
            : 'bg-background-secondary text-text-primary rounded-2xl rounded-tl-md',
          hasReply && 'rounded-t-md'
        )}>
          {message.content}
        </div>

        {/* Время */}
        <span className={cn(
          'text-[10px] text-text-tertiary px-1',
          isUser ? 'text-right block' : ''
        )}>
          {time}
        </span>
      </div>
    </div>
  );
});
