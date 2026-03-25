'use client';

import { useTranslations } from 'next-intl';
import { ChatLayout } from '@/widgets/chat';
import { useAuth } from '@/features/auth';
import { AuthRequired } from '@/shared/ui/auth-required';
import { Loader2, MessageSquare } from 'lucide-react';

/**
 * Скелетон для неавторизованных пользователей
 */
function ChatSkeleton() {
    return (
        <div className="flex flex-col h-full bg-background">
            {/* Шапка */}
            <div className="p-4 border-b border-border shrink-0">
                <div className="h-7 w-32 bg-background-secondary rounded-lg animate-pulse" />
            </div>
            {/* Скелетон чатов */}
            <div className="flex-1 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border-b border-border/30">
                        <div className="w-12 h-12 rounded-2xl bg-background-secondary animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-background-secondary rounded-lg animate-pulse w-3/4" />
                            <div className="h-3 bg-background-secondary rounded-lg animate-pulse w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ChatPage() {
    const t = useTranslations('chat');
    const { isAuthenticated, isInitialized } = useAuth();

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-dvh bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex h-dvh bg-background">
                <div className="hidden md:flex md:w-80 lg:w-96 border-r border-border flex-col">
                    <ChatSkeleton />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <AuthRequired context="chat" />
                </div>
            </div>
        );
    }

    const labels = {
        title: t('title'),
        searchPlaceholder: t('searchPlaceholder'),
        tabs: {
            all: t('tabs.all'),
            aiAgent: t('tabs.aiAgent'),
            support: t('tabs.support'),
            users: t('tabs.users'),
        },
        online: t('online'),
        offline: t('offline'),
        aiAgentTitle: t('aiAgent.title'),
        settings: t('aiAgent.settings'),
        messagePlaceholder: t('message.placeholder'),
        selectConversation: t('selectConversation'),
        emptyTitle: t('empty.title'),
        emptySubtitle: t('empty.subtitle'),
        filters: {
            today: t('filters.today'),
            yesterday: t('filters.yesterday'),
            thisWeek: t('filters.thisWeek'),
            thisMonth: t('filters.thisMonth'),
            allTime: t('filters.allTime'),
            allFilters: t('filters.allFilters'),
            selectFilter: t('filters.selectFilter'),
        },
        aiAgent: {
            title: t('aiAgent.title'),
            searching: t('aiAgent.searching'),
            foundProperties: t('aiAgent.foundProperties', { count: 0 }),
            noProperties: t('aiAgent.noProperties'),
            liveFeed: t('propertyCard.live'),
        },
        noProperties: t('aiAgent.noProperties'),
        allFilters: t('filters.allFilters'),
        selectFilter: t('filters.selectFilter'),
        propertyCard: {
            perMonth: t('propertyCard.perMonth'),
            rooms: t('propertyCard.rooms'),
            bedrooms: t('propertyCard.bedrooms'),
            bathrooms: t('propertyCard.bathrooms'),
            floor: t('propertyCard.floor'),
            walkMin: t('propertyCard.walkMin'),
            contact: t('propertyCard.contact'),
            notViewed: t('propertyCard.notViewed'),
            viewedGroup: t('propertyCard.viewedGroup'),
            notViewedGroup: t('propertyCard.notViewedGroup'),
            today: t('propertyCard.today'),
            yesterday: t('propertyCard.yesterday'),
            live: t('propertyCard.live'),
            objects: t('propertyCard.objects'),
        },
        settingsPanel: {
            settingsTitle: t('settings.title'),
            searchParams: t('settings.searchParams'),
            activeFilters: t('settings.activeFilters'),
            editFilter: t('settings.editFilter'),
            linkFilter: t('settings.linkFilter'),
            activeHours: t('settings.activeHours'),
            from: t('settings.from'),
            to: t('settings.to'),
            frequency: t('settings.frequency'),
            immediately: t('settings.immediately'),
            every15min: t('settings.every15min'),
            every30min: t('settings.every30min'),
            every1hour: t('settings.every1hour'),
            every2hours: t('settings.every2hours'),
            agentStatus: t('settings.agentStatus'),
            active: t('settings.active'),
            paused: t('settings.paused'),
            runningFor: t('settings.runningFor', { days: '14' }),
            totalFound: t('settings.totalFound', { count: '342' }),
        },
    };

    return <ChatLayout labels={labels} className="h-dvh" />;
}
