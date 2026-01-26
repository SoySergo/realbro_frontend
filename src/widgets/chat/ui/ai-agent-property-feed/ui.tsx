'use client';

import { useMemo } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatStore } from '@/features/chat-messages';
import { useChatFilterStore } from '@/features/chat-filters';
import { DayFilter } from '@/features/chat-filters/ui/day-filter';
import { SearchFilterSelector } from '@/features/chat-filters/ui/search-filter-selector';
import { MessageList } from '@/features/chat-messages/ui/message-list';
import type { ChatMessage } from '@/entities/chat';

interface AIAgentPropertyFeedProps {
    conversationId: string;
    labels: {
        filters: Record<string, string>;
        aiAgent: Record<string, string>;
        noProperties: string;
        allFilters: string;
        selectFilter: string;
    };
    className?: string;
}

function getDayStart(daysAgo: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function AIAgentPropertyFeed({
    conversationId,
    labels,
    className,
}: AIAgentPropertyFeedProps) {
    const { messages, isLoadingMessages } = useChatStore();
    const { dayFilter, selectedFilterIds, showAllFilters } = useChatFilterStore();

    const conversationMessages = messages[conversationId] || [];

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
            // Day filter
            if (dayFilter !== 'all') {
                const msgDate = new Date(msg.createdAt);
                const now = new Date();

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

            // Search filter — only applies to property messages
            if (!showAllFilters && selectedFilterIds.length > 0) {
                if (msg.type === 'property' || msg.type === 'property-batch') {
                    if (
                        msg.metadata?.filterId &&
                        !selectedFilterIds.includes(msg.metadata.filterId)
                    ) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [conversationMessages, dayFilter, selectedFilterIds, showAllFilters]);

    return (
        <div className={cn('flex flex-col flex-1 min-h-0', className)}>
            {/* Filter bar */}
            <div className="px-4 py-2 space-y-2 border-b border-border bg-background shrink-0">
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
            {filteredMessages.length === 0 && !isLoadingMessages ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-tertiary px-4">
                    <Bot className="w-10 h-10 text-text-tertiary/50" />
                    <p className="text-sm text-center">{labels.noProperties}</p>
                </div>
            ) : (
                <MessageList
                    messages={filteredMessages}
                    isLoading={isLoadingMessages}
                    isTyping={false}
                    className="flex-1"
                />
            )}
        </div>
    );
}
