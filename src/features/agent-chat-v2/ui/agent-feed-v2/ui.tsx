'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Bot, Clock, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatStore } from '@/features/chat-messages';
import { useChatFilterStore } from '@/features/chat-filters';
import { DayFilter } from '@/features/chat-filters/ui/day-filter';
import { SearchFilterSelector } from '@/features/chat-filters/ui/search-filter-selector';
import { ScrollToBottomButton } from '@/shared/ui/scroll-to-bottom';
import { useAgentChatV2Store } from '../../model/store';
import { PropertyCardV2 } from '../property-card-v2';
import { PropertyThread } from '../property-thread';
import { ThreadSidebar } from '../thread-sidebar';
import type { ChatMessage } from '@/entities/chat';
import type { PropertyChatCard } from '@/entities/property';
import type { AgentV2Labels } from '../../model/types';
import type { PropertyCardLabels } from '@/entities/chat';

interface AgentFeedV2Props {
    conversationId: string;
    labels: {
        filters: Record<string, string>;
        aiAgent: Record<string, string>;
        noProperties: string;
        allFilters: string;
        selectFilter: string;
        propertyCard?: PropertyCardLabels;
        agentV2: AgentV2Labels;
    };
    className?: string;
}

function getDayStart(daysAgo: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getGroupKey(date: Date, dayFilter: string): string {
    if (dayFilter === 'today' || dayFilter === 'yesterday') {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    }
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatGroupLabel(
    date: Date,
    dayFilter: string,
    locale = 'ru',
    todayLabel = 'Today',
    yesterdayLabel = 'Yesterday'
): string {
    if (dayFilter === 'today' || dayFilter === 'yesterday') {
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(now.getTime() - 86400000).toDateString();
    if (isToday) return todayLabel;
    if (isYesterday) return yesterdayLabel;
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
}

interface PropertyGroup {
    key: string;
    label: string;
    date: Date;
    properties: PropertyChatCard[];
    filterName?: string;
    isViewed: boolean;
}

/**
 * AI Agent Feed V2 — основной фид с карточками-коллажами,
 * тредами по объектам и панелью историй
 */
export function AgentFeedV2({ conversationId, labels, className }: AgentFeedV2Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const isAtBottomRef = useRef(true);
    const [unseenIds, setUnseenIds] = useState<Set<string>>(new Set());
    const prevMessageCountRef = useRef(0);

    const { messages } = useChatStore();
    const { dayFilter, selectedFilterIds, showAllFilters } = useChatFilterStore();

    const activeThreadId = useAgentChatV2Store((s) => s.activeThreadId);
    const isThreadSidebarOpen = useAgentChatV2Store((s) => s.isThreadSidebarOpen);
    const openPropertyThread = useAgentChatV2Store((s) => s.openPropertyThread);
    const closeThread = useAgentChatV2Store((s) => s.closeThread);
    const setActiveThread = useAgentChatV2Store((s) => s.setActiveThread);
    const setReaction = useAgentChatV2Store((s) => s.setReaction);
    const toggleThreadSidebar = useAgentChatV2Store((s) => s.toggleThreadSidebar);
    const setThreadSidebarOpen = useAgentChatV2Store((s) => s.setThreadSidebarOpen);
    const threads = useAgentChatV2Store((s) => s.threads);

    const v2Labels = labels.agentV2;
    const todayLabel = labels.propertyCard?.today || labels.filters?.today || 'Today';
    const yesterdayLabel = labels.propertyCard?.yesterday || labels.filters?.yesterday || 'Yesterday';
    const objectsLabel = labels.propertyCard?.objects || 'properties';
    const liveFeedLabel = labels.propertyCard?.live || labels.aiAgent?.liveFeed || 'LIVE';

    const conversationMessages = useMemo(
        () => messages[conversationId] || [],
        [messages, conversationId]
    );

    // Проверка позиции скролла
    const checkScrollPosition = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        const atBottom = scrollHeight - scrollTop - clientHeight <= 50;
        setIsAtBottom(atBottom);
        isAtBottomRef.current = atBottom;
        if (atBottom) setUnseenIds(new Set());
    }, []);

    const scrollToBottom = useCallback(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        setUnseenIds(new Set());
        setIsAtBottom(true);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', checkScrollPosition, { passive: true });
        return () => el.removeEventListener('scroll', checkScrollPosition);
    }, [checkScrollPosition]);

    // Извлечение доступных фильтров
    const availableFilters = useMemo(() => {
        const filterMap = new Map<string, { id: string; name: string; count: number }>();
        conversationMessages.forEach((msg) => {
            if (msg.type === 'property' && msg.metadata?.filterId && msg.metadata?.filterName) {
                const existing = filterMap.get(msg.metadata.filterId);
                const propCount = msg.properties?.length || 1;
                if (existing) existing.count += propCount;
                else filterMap.set(msg.metadata.filterId, { id: msg.metadata.filterId, name: msg.metadata.filterName, count: propCount });
            }
        });
        return Array.from(filterMap.values());
    }, [conversationMessages]);

    // Фильтрация сообщений
    const filteredMessages = useMemo(() => {
        return conversationMessages.filter((msg) => {
            if (msg.type !== 'property') return false;
            if (dayFilter !== 'all') {
                const msgDate = new Date(msg.createdAt);
                switch (dayFilter) {
                    case 'today':
                        if (msgDate < getDayStart(0)) return false;
                        break;
                    case 'yesterday': {
                        const ys = getDayStart(1);
                        const ts = getDayStart(0);
                        if (msgDate < ys || msgDate >= ts) return false;
                        break;
                    }
                    case 'this-week':
                        if (msgDate < getDayStart(7)) return false;
                        break;
                    case 'this-month':
                        if (msgDate < getDayStart(30)) return false;
                        break;
                }
            }
            if (!showAllFilters && selectedFilterIds.length > 0) {
                if (msg.metadata?.filterId && !selectedFilterIds.includes(msg.metadata.filterId)) return false;
            }
            return true;
        });
    }, [conversationMessages, dayFilter, selectedFilterIds, showAllFilters]);

    // Группировка сообщений
    const { realTimeMessages, groups } = useMemo(() => {
        const realTime: ChatMessage[] = [];
        const groupMap = new Map<string, PropertyGroup>();

        filteredMessages.forEach((msg) => {
            if (msg.isRealTime) {
                realTime.push(msg);
            } else {
                const date = new Date(msg.createdAt);
                const key = getGroupKey(date, dayFilter);
                const properties = msg.properties || [];

                properties.forEach((prop) => {
                    // Проверяем есть ли тред с реакцией для определения "просмотренности"
                    const thread = Object.values(threads).find((t) => t.propertyId === prop.id);
                    const isViewed = !!thread;
                    const mapKey = `${key}-${isViewed ? 'v' : 'nv'}`;

                    if (groupMap.has(mapKey)) {
                        groupMap.get(mapKey)!.properties.push(prop);
                    } else {
                        groupMap.set(mapKey, {
                            key: mapKey,
                            label: formatGroupLabel(date, dayFilter, 'ru', todayLabel, yesterdayLabel),
                            date,
                            properties: [prop],
                            filterName: msg.metadata?.filterName,
                            isViewed,
                        });
                    }
                });
            }
        });

        const sorted = Array.from(groupMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
        return { realTimeMessages: realTime, groups: sorted };
    }, [filteredMessages, dayFilter, threads, todayLabel, yesterdayLabel]);

    // Автоскролл при новых real-time сообщениях
    useEffect(() => {
        const currentCount = realTimeMessages.length;
        if (currentCount > prevMessageCountRef.current) {
            const newMsgs = realTimeMessages.slice(prevMessageCountRef.current);
            if (isAtBottomRef.current) {
                requestAnimationFrame(() => {
                    scrollRef.current?.scrollTo({ top: scrollRef.current!.scrollHeight, behavior: 'smooth' });
                });
            } else {
                setUnseenIds((prev) => {
                    const next = new Set(prev);
                    newMsgs.forEach((m) => next.add(m.id));
                    return next;
                });
            }
        }
        prevMessageCountRef.current = currentCount;
    }, [realTimeMessages]);

    // Обработчики
    const handlePropertyClick = useCallback((property: PropertyChatCard) => {
        openPropertyThread(property);
    }, [openPropertyThread]);

    const handleSwipeReply = useCallback((property: PropertyChatCard) => {
        openPropertyThread(property);
    }, [openPropertyThread]);

    const handleReaction = useCallback((propertyId: string, reaction: 'like' | 'dislike' | 'report') => {
        const thread = Object.values(threads).find((t) => t.propertyId === propertyId);
        if (thread) {
            setReaction(thread.id, thread.reaction === reaction ? undefined : reaction);
        }
    }, [threads, setReaction]);

    const handleSelectThread = useCallback((threadId: string) => {
        setActiveThread(threadId);
        setThreadSidebarOpen(false);
    }, [setActiveThread, setThreadSidebarOpen]);

    // Если открыт тред — показываем PropertyThread
    if (activeThreadId) {
        return (
            <div className={cn('flex h-full', className)}>
                {/* Боковая панель тредов (PC) */}
                <ThreadSidebar
                    isOpen={isThreadSidebarOpen}
                    labels={v2Labels}
                    onClose={() => setThreadSidebarOpen(false)}
                    onSelectThread={handleSelectThread}
                />
                <PropertyThread
                    threadId={activeThreadId}
                    labels={v2Labels}
                    onBack={closeThread}
                    className="flex-1"
                />
            </div>
        );
    }

    const isEmpty = groups.length === 0 && realTimeMessages.length === 0;

    return (
        <div className={cn('flex flex-col flex-1 min-h-0 relative overflow-x-hidden', className)}>
            {/* Панель фильтров */}
            <div className="px-3 md:px-4 py-2 space-y-2 border-b border-border bg-background shrink-0">
                <div className="flex items-center justify-between">
                    <DayFilter labels={labels.filters} />
                    {/* Кнопка открытия панели тредов */}
                    {Object.keys(threads).length > 0 && (
                        <button
                            onClick={toggleThreadSidebar}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs',
                                'bg-background-secondary hover:bg-background-tertiary',
                                'border border-border text-text-secondary transition-all'
                            )}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{v2Labels.threads}</span>
                            <span className="text-text-tertiary">({Object.keys(threads).length})</span>
                        </button>
                    )}
                </div>
                {availableFilters.length > 0 && (
                    <SearchFilterSelector
                        filters={availableFilters}
                        allFiltersLabel={labels.allFilters}
                        selectFilterLabel={labels.selectFilter}
                    />
                )}
            </div>

            {/* Боковая панель тредов (overlay на мобильных) */}
            <ThreadSidebar
                isOpen={isThreadSidebarOpen}
                labels={v2Labels}
                onClose={() => setThreadSidebarOpen(false)}
                onSelectThread={handleSelectThread}
            />

            {/* Контент */}
            {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-tertiary px-4">
                    <Bot className="w-10 h-10 text-text-tertiary/50" />
                    <p className="text-sm text-center">{labels.noProperties}</p>
                </div>
            ) : (
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-4 scrollbar-hide">
                    {groups.map((group) => (
                        <div key={group.key} className="space-y-3">
                            {/* Заголовок группы */}
                            <div className="flex items-center gap-2 text-xs text-text-tertiary py-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{group.label}</span>
                                <span className="text-text-tertiary/60">
                                    ({group.properties.length} {objectsLabel})
                                </span>
                                <span className={cn(
                                    'ml-auto flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded',
                                    group.isViewed
                                        ? 'text-success bg-success/10'
                                        : 'text-warning bg-warning/10'
                                )}>
                                    {group.isViewed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </span>
                            </div>

                            {/* Карточки */}
                            {group.properties.map((property) => {
                                const thread = Object.values(threads).find((t) => t.propertyId === property.id);
                                return (
                                    <PropertyCardV2
                                        key={property.id}
                                        property={property}
                                        filterName={group.filterName}
                                        reaction={thread?.reaction}
                                        labels={{
                                            actions: v2Labels.actions,
                                            showAll: v2Labels.showAll,
                                            photos: v2Labels.photos,
                                            closeGallery: v2Labels.closeGallery,
                                        }}
                                        onReaction={(r) => {
                                            // Создаём тред если его нет
                                            if (!thread) openPropertyThread(property);
                                            handleReaction(property.id, r);
                                        }}
                                        onSwipeReply={() => handleSwipeReply(property)}
                                        onClick={() => handlePropertyClick(property)}
                                    />
                                );
                            })}
                        </div>
                    ))}

                    {/* Real-time сообщения */}
                    {realTimeMessages.length > 0 && groups.length > 0 && (
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-brand-primary font-medium">
                                    {liveFeedLabel}
                                </span>
                            </div>
                        </div>
                    )}

                    {realTimeMessages.map((msg: ChatMessage, index: number) => (
                        <div
                            key={msg.id}
                            data-message-id={msg.id}
                            className={cn(
                                'animate-message-slide-in',
                                index === realTimeMessages.length - 1 && 'mb-2'
                            )}
                        >
                            {msg.properties?.map((property: PropertyChatCard) => {
                                const thread = Object.values(threads).find((t) => t.propertyId === property.id);
                                return (
                                    <PropertyCardV2
                                        key={property.id}
                                        property={property}
                                        filterName={msg.metadata?.filterName}
                                        reaction={thread?.reaction}
                                        labels={{
                                            actions: v2Labels.actions,
                                            showAll: v2Labels.showAll,
                                            photos: v2Labels.photos,
                                            closeGallery: v2Labels.closeGallery,
                                        }}
                                        onReaction={(r) => {
                                            if (!thread) openPropertyThread(property);
                                            handleReaction(property.id, r);
                                        }}
                                        onSwipeReply={() => handleSwipeReply(property)}
                                        onClick={() => handlePropertyClick(property)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {/* Кнопка скролла вниз */}
            <ScrollToBottomButton
                show={!isAtBottom || unseenIds.size > 0}
                newMessageCount={unseenIds.size}
                onClick={scrollToBottom}
            />
        </div>
    );
}
