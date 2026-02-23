'use client';

import { useTranslations } from 'next-intl';
import { ChatLayout } from '@/widgets/chat';
import { useAuth } from '@/features/auth';
import { AuthRequired } from '@/shared/ui/auth-required';
import { Loader2 } from 'lucide-react';

/**
 * Скелетон списка чатов для неавторизованных пользователей
 */
function ChatListSkeleton() {
    return (
        <div className="flex flex-col h-full">
            {/* Шапка */}
            <div className="p-3 border-b border-border">
                <div className="h-8 bg-background-secondary rounded animate-pulse" />
            </div>
            {/* Табы */}
            <div className="flex gap-2 p-3 border-b border-border">
                <div className="h-7 w-16 bg-background-secondary rounded animate-pulse" />
                <div className="h-7 w-20 bg-background-secondary rounded animate-pulse" />
                <div className="h-7 w-18 bg-background-secondary rounded animate-pulse" />
            </div>
            {/* Список чатов - скелетоны */}
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border-b border-border/50">
                    <div className="w-10 h-10 rounded-full bg-background-secondary animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-background-secondary rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-background-secondary rounded animate-pulse w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ChatPage() {
    const t = useTranslations('chat');
    const { isAuthenticated, isInitialized } = useAuth();

    // Пока инициализируемся - показываем загрузку
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    // Не авторизован - показываем макет чата со скелетонами и призывом к авторизации
    if (!isAuthenticated) {
        return (
            <div className="flex h-[calc(100vh-4rem)] md:h-screen">
                {/* Левая панель - скелетон списка чатов */}
                <div className="hidden md:flex md:w-80 lg:w-96 border-r border-border bg-background flex-col">
                    <ChatListSkeleton />
                </div>
                {/* Правая панель - призыв к авторизации */}
                <div className="flex-1 flex items-center justify-center bg-background">
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
        agentV2: {
            title: t('agentV2.title'),
            findMe: t('agentV2.findMe'),
            propertyThread: t('agentV2.propertyThread'),
            backToFeed: t('agentV2.backToFeed'),
            threads: t('agentV2.threads'),
            noThreads: t('agentV2.noThreads'),
            mediaGallery: t('agentV2.mediaGallery'),
            showAll: t('agentV2.showAll'),
            photos: t('agentV2.photos'),
            closeGallery: t('agentV2.closeGallery'),
            quickActions: {
                describe: t('agentV2.quickActions.describe'),
                note: t('agentV2.quickActions.note'),
                favorite: t('agentV2.quickActions.favorite'),
                suitable: t('agentV2.quickActions.suitable'),
                'not-suitable': t('agentV2.quickActions.notSuitable'),
                nearby: t('agentV2.quickActions.nearby'),
                contact: t('agentV2.quickActions.contact'),
            },
            actions: {
                like: t('agentV2.actions.like'),
                dislike: t('agentV2.actions.dislike'),
                report: t('agentV2.actions.report'),
                reply: t('agentV2.actions.reply'),
            },
            noteForm: {
                title: t('agentV2.noteForm.title'),
                placeholder: t('agentV2.noteForm.placeholder'),
                save: t('agentV2.noteForm.save'),
                cancel: t('agentV2.noteForm.cancel'),
                saved: t('agentV2.noteForm.saved'),
            },
            contactForm: {
                title: t('agentV2.contactForm.title'),
                phone: t('agentV2.contactForm.phone'),
                whatsapp: t('agentV2.contactForm.whatsapp'),
                email: t('agentV2.contactForm.email'),
                send: t('agentV2.contactForm.send'),
                cancel: t('agentV2.contactForm.cancel'),
                sent: t('agentV2.contactForm.sent'),
            },
            agentStatus: {
                online: t('agentV2.agentStatus.online'),
                offline: t('agentV2.agentStatus.offline'),
                searching: t('agentV2.agentStatus.searching'),
                found: t('agentV2.agentStatus.found', { count: '0' }),
            },
            notifications: {
                title: t('agentV2.notifications.title'),
                whenOnline: t('agentV2.notifications.whenOnline'),
                whenOffline: t('agentV2.notifications.whenOffline'),
                selectTime: t('agentV2.notifications.selectTime'),
                destination: t('agentV2.notifications.destination'),
            },
            filters: {
                current: t('agentV2.filters.current'),
                saved: t('agentV2.filters.saved'),
                change: t('agentV2.filters.change'),
                parameters: t('agentV2.filters.parameters'),
            },
            property: {
                addedToFavorites: t('agentV2.property.addedToFavorites'),
                removedFromFavorites: t('agentV2.property.removedFromFavorites'),
                markedSuitable: t('agentV2.property.markedSuitable'),
                markedNotSuitable: t('agentV2.property.markedNotSuitable'),
                descriptionSent: t('agentV2.property.descriptionSent'),
                nearbyPlaces: t('agentV2.property.nearbyPlaces'),
                transport: t('agentV2.property.transport'),
                shops: t('agentV2.property.shops'),
                parks: t('agentV2.property.parks'),
            },
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
