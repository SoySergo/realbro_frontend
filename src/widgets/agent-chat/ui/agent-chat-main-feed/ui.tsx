'use client';

import { memo, useRef, useEffect, useCallback } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAgentChatStore } from '@/features/agent-chat';
import { AgentPropertyCard, AgentMessageBubble } from '@/entities/agent-chat';
import type { AgentChatLabels } from '@/entities/agent-chat';

interface AgentChatMainFeedProps {
  labels: AgentChatLabels;
  className?: string;
}

export const AgentChatMainFeed = memo(function AgentChatMainFeed({
  labels,
  className,
}: AgentChatMainFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { mainMessages, threads, openThread, reactToProperty, isLoading } = useAgentChatStore();

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [mainMessages.length]);

  // Найти тред по property id
  const findThread = useCallback((propertyId: string) => {
    return threads.find((t) => t.property.id === propertyId);
  }, [threads]);

  if (isLoading) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <div className="flex flex-col items-center gap-3">
          <Bot className="w-10 h-10 text-brand-primary animate-pulse" />
          <div className="h-2 w-24 bg-background-tertiary rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (mainMessages.length === 0) {
    return (
      <div className={cn('flex-1 flex flex-col items-center justify-center gap-3 px-4', className)}>
        <div className="w-16 h-16 rounded-2xl bg-background-secondary flex items-center justify-center">
          <Bot className="w-8 h-8 text-text-tertiary" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-text-secondary">{labels.empty.title}</p>
          <p className="text-xs text-text-tertiary">{labels.empty.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn('flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-3 scrollbar-hide', className)}
    >
      {mainMessages.map((msg) => {
        // Объект недвижимости
        if (msg.type === 'property' && msg.property) {
          const thread = findThread(msg.property.id);
          return (
            <div key={msg.id} className="max-w-sm animate-message-slide-in">
              <AgentPropertyCard
                property={msg.property}
                reaction={thread?.reaction}
                isFavorite={thread?.isFavorite}
                isNew={msg.isNew}
                filterName={msg.metadata?.filterName}
                onOpenThread={() => {
                  if (thread) openThread(thread.id);
                }}
                onReact={(reaction) => {
                  if (thread) reactToProperty(thread.id, reaction);
                }}
                labels={labels.propertyCard}
                mediaLabels={labels.mediaGallery}
                actionLabels={labels.actions}
              />
            </div>
          );
        }

        // Текстовые и прочие сообщения
        return (
          <AgentMessageBubble
            key={msg.id}
            message={msg}
          />
        );
      })}
    </div>
  );
});
