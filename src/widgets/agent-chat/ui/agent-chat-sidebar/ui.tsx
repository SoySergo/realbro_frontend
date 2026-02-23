'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { Bot, Heart, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAgentChatStore } from '@/features/agent-chat';
import type { PropertyThread } from '@/entities/agent-chat';
import { getImageUrl } from '@/entities/property';

interface AgentChatSidebarProps {
  labels: {
    propertyThreads: string;
    noThreads: string;
    mainChat: string;
    objects: string;
  };
  className?: string;
}

// Элемент треда объекта в сайдбаре
const ThreadItem = memo(function ThreadItem({
  thread,
  isActive,
  onClick,
}: {
  thread: PropertyThread;
  isActive: boolean;
  onClick: () => void;
}) {
  const lastMsg = thread.messages[thread.messages.length - 1];
  const thumbnail = thread.property.images[0];
  const thumbnailUrl = thumbnail ? getImageUrl(thumbnail) : '';
  const price = thread.property.price?.toLocaleString('es-ES') ?? '0';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer',
        'transition-all duration-200',
        isActive
          ? 'bg-brand-primary/10 border border-brand-primary/20'
          : 'hover:bg-background-secondary border border-transparent'
      )}
    >
      {/* Превью */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-background-tertiary">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={thread.property.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-text-tertiary" />
          </div>
        )}
        {/* Иконка реакции */}
        {thread.reaction && (
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center',
            thread.reaction === 'like' ? 'bg-success' : 'bg-error'
          )}>
            {thread.reaction === 'like' 
              ? <ThumbsUp className="w-2.5 h-2.5 text-white" />
              : <ThumbsDown className="w-2.5 h-2.5 text-white" />
            }
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-medium text-text-primary truncate">
            {price}€
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {thread.isFavorite && <Heart className="w-3 h-3 text-error fill-error" />}
            {thread.unreadCount > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center">
                {thread.unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-text-secondary truncate">
          {thread.property.address}
        </p>
        {lastMsg && (
          <p className="text-[11px] text-text-tertiary truncate mt-0.5">
            {lastMsg.sender === 'user' ? '→ ' : ''}{lastMsg.content}
          </p>
        )}
      </div>
    </button>
  );
});

export const AgentChatSidebar = memo(function AgentChatSidebar({
  labels,
  className,
}: AgentChatSidebarProps) {
  const { threads, activeThreadId, currentView, openThread, closeThread } = useAgentChatStore();

  // Сортировка: непрочитанные сверху, затем по дате активности
  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });
  }, [threads]);

  return (
    <div className={cn(
      'flex flex-col h-full bg-background border-r border-border',
      className
    )}>
      {/* Заголовок */}
      <div className="px-4 pt-4 pb-3 space-y-3 shrink-0">
        {/* Кнопка основного чата */}
        <button
          onClick={() => closeThread()}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer',
            'transition-all duration-200',
            currentView === 'main'
              ? 'bg-brand-primary/10 border border-brand-primary/20'
              : 'hover:bg-background-secondary border border-transparent'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <span className="text-sm font-medium text-text-primary">{labels.mainChat}</span>
          </div>
        </button>

        {/* Секция тредов */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
            {labels.propertyThreads}
          </span>
          <span className="text-xs text-text-tertiary">
            {threads.length} {labels.objects}
          </span>
        </div>
      </div>

      {/* Список тредов */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 scrollbar-hide">
        {sortedThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-tertiary">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs text-center">{labels.noThreads}</p>
          </div>
        ) : (
          sortedThreads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isActive={activeThreadId === thread.id}
              onClick={() => openThread(thread.id)}
            />
          ))
        )}
      </div>
    </div>
  );
});
