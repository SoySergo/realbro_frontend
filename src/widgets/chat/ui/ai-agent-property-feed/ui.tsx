'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Bot, Clock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatStore } from '@/features/chat-messages';
import { useChatFilterStore } from '@/features/chat-filters';
import { DayFilter } from '@/features/chat-filters/ui/day-filter';
import { SearchFilterSelector } from '@/features/chat-filters/ui/search-filter-selector';
import { PropertyBatchCard, PropertyBatchCarousel, PropertyOpenCard, type PropertyCardLabels } from '@/entities/chat';
import { PropertyActionButtons } from '@/features/chat-property-actions/ui/property-action-buttons';
import { usePropertyActionsStore } from '@/features/chat-property-actions';
import { PropertyCompareButton } from '@/features/comparison';
import { ScrollToBottomButton } from '@/shared/ui/scroll-to-bottom';
import { AIAgentPropertyFeedSkeleton } from './skeleton';
import type { ChatMessage } from '@/entities/chat';
import type { Property } from '@/entities/property';
import { Loader2 } from 'lucide-react';

interface AIAgentPropertyFeedProps {
    conversationId: string;
    labels: {
        filters: Record<string, string>;
        aiAgent: Record<string, string>;
        noProperties: string;
        allFilters: string;
        selectFilter: string;
        propertyCard?: PropertyCardLabels;
    };
    className?: string;
}

function getDayStart(daysAgo: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Get grouping key based on filter
function getGroupKey(date: Date, dayFilter: string): string {
    if (dayFilter === 'today' || dayFilter === 'yesterday') {
        // Group by hour
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    }
    // Group by day
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Format group label with localization support
function formatGroupLabel(
    date: Date, 
    dayFilter: string, 
    locale = 'ru',
    todayLabel = 'Сегодня',
    yesterdayLabel = 'Вчера'
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
    properties: Property[];
    filterName?: string;
    isViewed: boolean; // Группа просмотренных или нет
}

export function AIAgentPropertyFeed({
    conversationId,
    labels,
    className,
}: AIAgentPropertyFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const isAtBottomRef = useRef(true); // Ref for reliable reading in effects
    const [unseenIds, setUnseenIds] = useState<Set<string>>(new Set());
    const prevMessageCountRef = useRef(0);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const initializedRef = useRef(false);
    
    const { messages, isLoadingMessages, initializeDemoScenario } = useChatStore();
    const { dayFilter, selectedFilterIds, showAllFilters } = useChatFilterStore();
    const { viewedIds } = usePropertyActionsStore();
    // Memoize viewedSet to prevent recreating Set on every render
    const viewedSet = useMemo(() => new Set(viewedIds), [viewedIds]);

    // Локализованные метки
    const todayLabel = labels.propertyCard?.today || labels.filters?.today || 'Сегодня';
    const yesterdayLabel = labels.propertyCard?.yesterday || labels.filters?.yesterday || 'Вчера';
    const objectsLabel = labels.propertyCard?.objects || 'объектов';
    const liveFeedLabel = labels.propertyCard?.live || labels.aiAgent?.liveFeed || 'LIVE';
    const notViewedLabel = labels.propertyCard?.notViewedGroup || 'Не просмотрено';

    // Initialize demo data on mount (only once)
    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            initializeDemoScenario();
        }
    }, [initializeDemoScenario]);

    const conversationMessages = messages[conversationId] || [];

    // Check if user is at bottom of scroll
    const checkScrollPosition = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        
        const { scrollTop, scrollHeight, clientHeight } = el;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        // 50px threshold - forgiving for smooth scroll and sub-pixel rendering
        const atBottom = distanceFromBottom <= 50;
        setIsAtBottom(atBottom);
        isAtBottomRef.current = atBottom;
        
        // Reset new message count when at bottom
        if (atBottom) {
            setUnseenIds(new Set());
        }
    }, []);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        
        el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth',
        });
        setUnseenIds(new Set());
        // We manually set this to true because we know we are going there
        setIsAtBottom(true);
    }, []);

    // Track scroll position
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        
        el.addEventListener('scroll', checkScrollPosition, { passive: true });
        return () => el.removeEventListener('scroll', checkScrollPosition);
    }, [checkScrollPosition]);

    // Extract unique filters from property messages for the selector
    const availableFilters = useMemo(() => {
        const filterMap = new Map<string, { id: string; name: string; count: number }>();
        conversationMessages.forEach((msg) => {
            if (
                (msg.type === 'property' || msg.type === 'property-batch') &&
                msg.metadata?.filterId &&
                msg.metadata?.filterName
            ) {
                const existing = filterMap.get(msg.metadata.filterId);
                const propCount = msg.properties?.length || 1;
                if (existing) {
                    existing.count += propCount;
                } else {
                    filterMap.set(msg.metadata.filterId, {
                        id: msg.metadata.filterId,
                        name: msg.metadata.filterName,
                        count: propCount,
                    });
                }
            }
        });
        return Array.from(filterMap.values());
    }, [conversationMessages]);

    // Filter messages by day and search filter
    const filteredMessages = useMemo(() => {
        return conversationMessages.filter((msg) => {
            // Only property messages
            if (msg.type !== 'property' && msg.type !== 'property-batch') return false;
            
            // Day filter
            if (dayFilter !== 'all') {
                const msgDate = new Date(msg.createdAt);

                switch (dayFilter) {
                    case 'today':
                        if (msgDate < getDayStart(0)) return false;
                        break;
                    case 'yesterday': {
                        const yesterdayStart = getDayStart(1);
                        const todayStart = getDayStart(0);
                        if (msgDate < yesterdayStart || msgDate >= todayStart) return false;
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

            // Search filter
            if (!showAllFilters && selectedFilterIds.length > 0) {
                if (
                    msg.metadata?.filterId &&
                    !selectedFilterIds.includes(msg.metadata.filterId)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [conversationMessages, dayFilter, selectedFilterIds, showAllFilters]);

    // Separate real-time (WebSocket) messages from API-loaded ones
    // Group by date AND by viewed/not-viewed status
    const { realTimeMessages, viewedGroups, notViewedGroups } = useMemo(() => {
        const realTime: ChatMessage[] = [];
        const viewedGroupMap = new Map<string, PropertyGroup>();
        const notViewedGroupMap = new Map<string, PropertyGroup>();

        filteredMessages.forEach((msg) => {
            if (msg.isRealTime) {
                realTime.push(msg);
            } else {
                const date = new Date(msg.createdAt);
                const groupKey = getGroupKey(date, dayFilter);
                const properties = msg.properties || [];
                
                // Разделяем properties на просмотренные и непросмотренные
                properties.forEach(prop => {
                    const isViewed = viewedSet.has(prop.id);
                    const targetMap = isViewed ? viewedGroupMap : notViewedGroupMap;
                    const key = `${groupKey}-${isViewed ? 'viewed' : 'not-viewed'}`;
                    
                    if (targetMap.has(key)) {
                        targetMap.get(key)!.properties.push(prop);
                    } else {
                        targetMap.set(key, {
                            key,
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

        // Сортируем группы по дате (сначала старые для просмотренных, сначала новые для непросмотренных)
        const viewed = Array.from(viewedGroupMap.values())
            .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const notViewed = Array.from(notViewedGroupMap.values())
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // Сначала новые для непросмотренных

        return { 
            realTimeMessages: realTime, 
            viewedGroups: viewed,
            notViewedGroups: notViewed 
        };
    }, [filteredMessages, dayFilter, viewedSet, todayLabel, yesterdayLabel]);

    // Handle new real-time messages - Telegram-like behavior
    useEffect(() => {
        const currentCount = realTimeMessages.length;
        
        if (currentCount > prevMessageCountRef.current) {
            const newMsgs = realTimeMessages.slice(prevMessageCountRef.current);
            
            // Use ref for reliable reading (state may be stale)
            if (isAtBottomRef.current) {
                // If at bottom, auto-scroll to show new messages (Telegram-like)
                requestAnimationFrame(() => {
                    scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: 'smooth',
                    });
                });
            } else {
                // If scrolled up, track unseen messages and show button
                setUnseenIds(prev => {
                    const next = new Set(prev);
                    newMsgs.forEach(m => next.add(m.id));
                    return next;
                });
            }
        }
        
        prevMessageCountRef.current = currentCount;
    }, [realTimeMessages]);

    // Intersection Observer for granular read receipts
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const seenIds = new Set<string>();
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('data-message-id');
                        if (id) seenIds.add(id);
                    }
                });

                if (seenIds.size > 0) {
                    setUnseenIds((prev) => {
                        const next = new Set(prev);
                        let changed = false;
                        seenIds.forEach((id) => {
                            if (next.has(id)) {
                                next.delete(id);
                                changed = true;
                            }
                        });
                        return changed ? next : prev;
                    });
                }
            },
            {
                root: el,
                threshold: 0.1, // Consider seen as soon as 10% is visible
            }
        );

        // Observe all unread messages
        setTimeout(() => {
            const messageElements = el.querySelectorAll('[data-message-id]');
            messageElements.forEach((msgEl) => {
                const id = msgEl.getAttribute('data-message-id');
                if (id && unseenIds.has(id)) {
                    observerRef.current?.observe(msgEl);
                }
            });
        }, 50);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [unseenIds.size, realTimeMessages.length]);

    // Memoize renderPropertyCard to prevent function recreation on every render
    const renderPropertyCard = useCallback((property: Property) => (
        <PropertyBatchCard
            property={property}
            actions={
                <div className="flex items-center gap-1">
                    <PropertyCompareButton property={property} size="sm" />
                    <PropertyActionButtons propertyId={property.id} />
                </div>
            }
        />
    ), []);

    // Рендер группы объектов
    const renderGroup = useCallback((group: PropertyGroup, showViewedBadge = false) => (
        <div key={group.key} className="space-y-2">
            {/* Group header */}
            <div className="flex items-center gap-2 text-xs text-text-tertiary bg-background/90 backdrop-blur-sm py-1 -mx-1 px-1 z-10">
                <Clock className="w-3.5 h-3.5" />
                <span>{group.label}</span>
                <span className="text-text-tertiary/60">
                    ({group.properties.length} {objectsLabel})
                </span>
                {showViewedBadge && (
                    <span className={cn(
                        "ml-auto flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded",
                        group.isViewed 
                            ? "text-success bg-success/10" 
                            : "text-warning bg-warning/10"
                    )}>
                        {group.isViewed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </span>
                )}
            </div>
            
            {/* Carousel or single card */}
            {group.properties.length === 1 ? (
                <PropertyBatchCard
                    property={group.properties[0]}
                    filterName={group.filterName}
                    actions={
                        <div className="flex items-center gap-1">
                            <PropertyCompareButton property={group.properties[0]} size="sm" />
                            <PropertyActionButtons propertyId={group.properties[0].id} />
                        </div>
                    }
                />
            ) : (
                <PropertyBatchCarousel
                    properties={group.properties}
                    batchLabel={`${group.properties.length} ${objectsLabel}`}
                    filterName={group.filterName}
                    viewedIds={viewedSet}
                    renderCard={renderPropertyCard}
                />
            )}
        </div>
    ), [objectsLabel, viewedSet, renderPropertyCard]);

    if (isLoadingMessages) {
        return <AIAgentPropertyFeedSkeleton className={className} />;
    }

    const hasViewedGroups = viewedGroups.length > 0;
    const hasNotViewedGroups = notViewedGroups.length > 0;
    const hasRealTimeMessages = realTimeMessages.length > 0;
    const isEmpty = !hasViewedGroups && !hasNotViewedGroups && !hasRealTimeMessages;

    return (
        <div className={cn('flex flex-col flex-1 min-h-0 relative overflow-x-hidden', className)}>
            {/* Filter bar */}
            <div className="px-3 md:px-4 py-2 space-y-2 border-b border-border bg-background shrink-0">
                <DayFilter labels={labels.filters} />
                {availableFilters.length > 0 && (
                    <SearchFilterSelector
                        filters={availableFilters}
                        allFiltersLabel={labels.allFilters}
                        selectFilterLabel={labels.selectFilter}
                    />
                )}
            </div>

            {/* Messages */}
            {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-tertiary px-4">
                    <Bot className="w-10 h-10 text-text-tertiary/50" />
                    <p className="text-sm text-center">{labels.noProperties}</p>
                </div>
            ) : (
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-4 scrollbar-hide"
                >
                    {/* Просмотренные группы */}
                    {hasViewedGroups && (
                        <div className="space-y-4">
                            {viewedGroups.map((group) => renderGroup(group, hasNotViewedGroups))}
                        </div>
                    )}

                    {/* Разделитель между просмотренными и непросмотренными */}
                    {hasViewedGroups && hasNotViewedGroups && (
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-warning/30" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-warning flex items-center gap-1">
                                    <EyeOff className="w-3 h-3" />
                                    {notViewedLabel}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Непросмотренные группы */}
                    {hasNotViewedGroups && (
                        <div className="space-y-4">
                            {notViewedGroups.map((group) => renderGroup(group, hasViewedGroups))}
                        </div>
                    )}

                    {/* Separator if both exist */}
                    {(hasViewedGroups || hasNotViewedGroups) && hasRealTimeMessages && (
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

                    {/* Real-time messages - OPEN View */}
                    {realTimeMessages.map((msg: ChatMessage, index: number) => (
                        <div 
                            key={msg.id}
                            data-message-id={msg.id}
                            className={cn(
                                'animate-message-slide-in',
                                index === realTimeMessages.length - 1 && 'mb-2'
                            )}
                        >
                            {msg.properties?.map((property: Property) => (
                                <PropertyOpenCard
                                    key={property.id}
                                    property={property}
                                    filterName={msg.metadata?.filterName}
                                    isNew={true}
                                    labels={labels.propertyCard}
                                    actions={
                                        <div className="flex items-center gap-1">
                                            <PropertyCompareButton property={property} size="sm" />
                                            <PropertyActionButtons propertyId={property.id} />
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Scroll to bottom button */}
            <ScrollToBottomButton
                show={!isAtBottom || unseenIds.size > 0}
                newMessageCount={unseenIds.size}
                onClick={scrollToBottom}
            />
        </div>
    );
}
