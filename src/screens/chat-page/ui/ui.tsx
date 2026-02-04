'use client';

import { useTranslations } from 'next-intl';
import { ChatLayout } from '@/widgets/chat';

export function ChatPage() {
    const t = useTranslations('chat');

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

    return (
        <ChatLayout
            labels={labels}
            className="h-[calc(100vh-4rem)] md:h-screen"
        />
    );
}
