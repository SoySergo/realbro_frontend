'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ConversationItem } from '@/entities/chat';
import type { ChatType, Conversation } from '@/entities/chat';
import { useChatStore } from '@/features/chat-messages';

type TabKey = 'all' | 'ai-agent' | 'support' | 'p2p';

const tabs: { key: TabKey; labelKey: string; filterType?: ChatType }[] = [
    { key: 'all', labelKey: 'all' },
    { key: 'ai-agent', labelKey: 'aiAgent', filterType: 'ai-agent' },
    { key: 'support', labelKey: 'support', filterType: 'support' },
    { key: 'p2p', labelKey: 'users', filterType: 'p2p' },
];

interface ChatSidebarProps {
    labels: {
        title: string;
        searchPlaceholder: string;
        tabs: Record<string, string>;
    };
    className?: string;
}

export function ChatSidebar({ labels, className }: ChatSidebarProps) {
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        fetchConversations,
        isLoadingConversations,
    } = useChatStore();

    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const filteredConversations = conversations
        .filter((c) => {
            if (activeTab !== 'all') {
                const tab = tabs.find((t) => t.key === activeTab);
                if (tab?.filterType && c.type !== tab.filterType) return false;
            }
            if (searchQuery.trim()) {
                return c.title.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return true;
        })
        .sort((a, b) => {
            // Pinned first, then by updatedAt
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

    return (
        <div
            className={cn(
                'flex flex-col h-full bg-background border-r border-border',
                className
            )}
        >
            {/* Header */}
            <div className="px-4 pt-4 pb-2 space-y-3 shrink-0">
                <h2 className="text-lg font-semibold text-text-primary">
                    {labels.title}
                </h2>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={labels.searchPlaceholder}
                        className={cn(
                            'w-full h-9 pl-9 pr-3 rounded-lg text-sm',
                            'bg-background-secondary border border-border',
                            'text-text-primary placeholder:text-text-tertiary',
                            'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
                            'transition-all duration-200'
                        )}
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer',
                                'transition-all duration-200 whitespace-nowrap',
                                activeTab === tab.key
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
                            )}
                        >
                            {labels.tabs[tab.labelKey] || tab.labelKey}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-hide">
                {isLoadingConversations ? (
                    <div className="space-y-2 px-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                                <div className="w-10 h-10 rounded-full bg-background-tertiary" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-background-tertiary rounded w-3/4" />
                                    <div className="h-2.5 bg-background-tertiary rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-sm text-text-tertiary">
                        No conversations found
                    </div>
                ) : (
                    filteredConversations.map((conversation) => (
                        <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={activeConversationId === conversation.id}
                            onClick={() => setActiveConversation(conversation.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
