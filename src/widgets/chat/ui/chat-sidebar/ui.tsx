'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ConversationItem } from '@/entities/chat';
import { useChatStore } from '@/features/chat-messages';

type TabKey = 'all' | 'ai-agent' | 'support' | 'p2p';

const tabs: { key: TabKey; labelKey: string }[] = [
    { key: 'all', labelKey: 'all' },
    { key: 'ai-agent', labelKey: 'aiAgent' },
    { key: 'support', labelKey: 'support' },
    { key: 'p2p', labelKey: 'users' },
];

interface ChatSidebarProps {
    labels: {
        title: string;
        searchPlaceholder: string;
        tabs: Record<string, string>;
        aiAgentSearching: string;
    };
    onSelectConversation?: () => void;
    className?: string;
}

export function ChatSidebar({ labels, onSelectConversation, className }: ChatSidebarProps) {
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

    const sortedConversations = [...conversations].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const aiConversation = sortedConversations.find(
        (conversation) => conversation.type === 'ai-agent'
    );

    const visibleConversations = sortedConversations.filter((conversation) => {
        if (conversation.type === 'ai-agent') {
            return false;
        }

        if (activeTab !== 'all' && conversation.type !== activeTab) {
            return false;
        }

        if (searchQuery.trim()) {
            return conversation.title.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return true;
    });

    const shouldShowAiCard =
        !!aiConversation &&
        (activeTab === 'all' || activeTab === 'ai-agent') &&
        (!searchQuery.trim() ||
            aiConversation.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleConversationSelect = (conversationId: string) => {
        setActiveConversation(conversationId);
        onSelectConversation?.();
    };

    const desktopSummary = shouldShowAiCard ? visibleConversations.length + 1 : visibleConversations.length;

    return (
        <aside
            className={cn(
                'flex flex-col h-full bg-background/95 backdrop-blur-xl',
                'md:border-r md:border-border/70',
                className
            )}
        >
            <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-4 space-y-3 shrink-0 border-b border-border/70 bg-background/90 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                            {labels.title}
                        </h2>
                        <p className="text-xs text-text-tertiary">
                            {desktopSummary > 0 ? `${desktopSummary}` : '0'}
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                        {labels.tabs.aiAgent}
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={labels.searchPlaceholder}
                        className={cn(
                            'w-full h-11 pl-10 pr-3 rounded-2xl text-sm',
                            'bg-background-secondary border border-border/70',
                            'text-text-primary placeholder:text-text-tertiary',
                            'focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary',
                            'transition-all duration-200'
                        )}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer',
                                'transition-all duration-200 border',
                                activeTab === tab.key
                                    ? 'bg-text-primary text-background border-text-primary shadow-sm'
                                    : 'bg-background border-border text-text-secondary hover:text-text-primary hover:border-border/90'
                            )}
                        >
                            {labels.tabs[tab.labelKey] || tab.labelKey}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 md:px-4 md:py-4 space-y-3 scrollbar-hide bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_40%)]">
                {isLoadingConversations ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-[24px] border border-border/70 bg-background/90 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-background-secondary" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 rounded bg-background-secondary w-2/3" />
                                        <div className="h-3 rounded bg-background-secondary w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {shouldShowAiCard && aiConversation && (
                            <button
                                onClick={() => handleConversationSelect(aiConversation.id)}
                                className={cn(
                                    'w-full text-left rounded-[28px] p-4 md:p-5 border shadow-sm',
                                    'transition-all duration-200',
                                    'bg-linear-to-br from-brand-primary to-brand-primary-hover text-white',
                                    'hover:shadow-lg hover:-translate-y-0.5',
                                    activeConversationId === aiConversation.id &&
                                        'ring-2 ring-brand-primary/30 shadow-lg'
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/16 backdrop-blur-sm">
                                        <Sparkles className="w-7 h-7" />
                                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-base font-semibold">
                                                    {aiConversation.title}
                                                </p>
                                                <p className="mt-0.5 text-xs text-white/80">
                                                    {labels.tabs.aiAgent}
                                                </p>
                                            </div>
                                            {aiConversation.unreadCount > 0 && (
                                                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-brand-primary shadow-sm">
                                                    {aiConversation.unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-3 line-clamp-2 text-sm text-white/90">
                                            {labels.aiAgentSearching}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )}

                        {visibleConversations.length > 0 ? (
                            <div className="space-y-2">
                                {visibleConversations.map((conversation) => (
                                    <ConversationItem
                                        key={conversation.id}
                                        conversation={conversation}
                                        isActive={activeConversationId === conversation.id}
                                        onClick={() => handleConversationSelect(conversation.id)}
                                    />
                                ))}
                            </div>
                        ) : !shouldShowAiCard ? (
                            <div className="flex min-h-40 flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-background/80 px-6 py-10 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary">
                                    <Search className="w-5 h-5 text-text-tertiary" />
                                </div>
                                <p className="text-sm font-medium text-text-primary">
                                    {labels.searchPlaceholder}
                                </p>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </aside>
    );
}
