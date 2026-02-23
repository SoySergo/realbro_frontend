'use client';

import React, { useMemo } from 'react';
import { X, MessageSquare, Heart, ThumbsUp, ThumbsDown, MapPin, StickyNote } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAgentChatV2Store } from '../../model/store';
import { getImageUrl } from '@/entities/property/model/card-types';
import type { AgentV2Labels } from '../../model/types';

interface ThreadSidebarProps {
    isOpen: boolean;
    labels: AgentV2Labels;
    onClose: () => void;
    onSelectThread: (threadId: string) => void;
    className?: string;
}

/**
 * Боковая панель с историей тредов по объектам
 * (как список чатов в мессенджерах — но для объектов)
 */
export function ThreadSidebar({
    isOpen,
    labels,
    onClose,
    onSelectThread,
    className,
}: ThreadSidebarProps) {
    const threadsMap = useAgentChatV2Store((s) => s.threads);
    const activeThreadId = useAgentChatV2Store((s) => s.activeThreadId);

    // Мемоизируем список тредов, чтобы избежать infinite loop
    const threads = useMemo(
        () => Object.values(threadsMap).sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
        [threadsMap]
    );

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                'fixed md:relative inset-0 md:inset-auto z-40 md:z-auto',
                'md:w-[280px] lg:w-[320px] shrink-0',
                'flex flex-col',
                className
            )}
        >
            {/* Оверлей для мобильных */}
            <div
                className="absolute inset-0 bg-black/40 md:hidden"
                onClick={onClose}
            />

            {/* Панель */}
            <div className="relative z-10 w-[85%] md:w-full h-full bg-background border-r border-border flex flex-col animate-card-slide-in">
                {/* Заголовок */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand-primary" />
                        <h3 className="text-sm font-semibold text-text-primary">{labels.threads}</h3>
                        <span className="text-xs text-text-tertiary">({threads.length})</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-background-secondary transition-colors md:hidden"
                    >
                        <X className="w-4 h-4 text-text-tertiary" />
                    </button>
                </div>

                {/* Список тредов */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {threads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
                            <MessageSquare className="w-8 h-8 text-text-tertiary/40" />
                            <p className="text-sm text-text-tertiary">{labels.noThreads}</p>
                        </div>
                    ) : (
                        threads.map((thread) => {
                            const lastMsg = thread.messages[thread.messages.length - 1];
                            const mainImage = thread.property.images?.[0];
                            const isActive = thread.id === activeThreadId;

                            return (
                                <button
                                    key={thread.id}
                                    onClick={() => onSelectThread(thread.id)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                        'border-b border-border/50',
                                        'hover:bg-background-secondary',
                                        isActive && 'bg-brand-primary-light border-l-2 border-l-brand-primary'
                                    )}
                                >
                                    {/* Мини-превью */}
                                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-background-tertiary">
                                        {mainImage ? (
                                            <img
                                                src={getImageUrl(mainImage)}
                                                alt={thread.property.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-text-tertiary" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Информация */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-medium text-text-primary truncate">
                                                {thread.property.title}
                                            </span>
                                            {/* Статус-иконки */}
                                            <div className="flex items-center gap-0.5 shrink-0">
                                                {thread.isFavorite && (
                                                    <Heart className="w-3 h-3 text-error fill-error" />
                                                )}
                                                {thread.isSuitable === true && (
                                                    <ThumbsUp className="w-3 h-3 text-success" />
                                                )}
                                                {thread.isSuitable === false && (
                                                    <ThumbsDown className="w-3 h-3 text-error" />
                                                )}
                                                {thread.hasNote && (
                                                    <StickyNote className="w-3 h-3 text-warning" />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-text-tertiary truncate">
                                            {thread.property.price.toLocaleString()} € • {thread.property.address}
                                        </p>
                                        {lastMsg && (
                                            <p className="text-[11px] text-text-secondary truncate mt-0.5">
                                                {lastMsg.content}
                                            </p>
                                        )}
                                    </div>

                                    {/* Время */}
                                    <span className="text-[10px] text-text-tertiary shrink-0">
                                        {new Date(thread.updatedAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
