'use client';

import { useTranslations } from 'next-intl';
import { AgentChatLayout } from '@/widgets/agent-chat';
import { useAuth } from '@/features/auth';
import { AuthRequired } from '@/shared/ui/auth-required';
import { Loader2 } from 'lucide-react';
import type { AgentChatLabels } from '@/entities/agent-chat';

/**
 * Скелетон для неавторизованных пользователей
 */
function AgentChatSkeleton() {
    return (
        <div className="flex h-full">
            {/* Левая панель */}
            <div className="hidden md:flex md:w-72 border-r border-border bg-background flex-col">
                <div className="p-3 space-y-3">
                    <div className="h-12 bg-background-secondary rounded-xl animate-pulse" />
                    <div className="h-4 bg-background-secondary rounded w-20 animate-pulse" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-12 h-12 rounded-lg bg-background-secondary animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3.5 bg-background-secondary rounded w-16 animate-pulse" />
                            <div className="h-3 bg-background-secondary rounded w-24 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
            {/* Правая панель */}
            <div className="flex-1 flex items-center justify-center bg-background">
                <AuthRequired context="chat" />
            </div>
        </div>
    );
}

export function AgentChatPage() {
    const t = useTranslations('agentChat');
    const { isAuthenticated, isInitialized } = useAuth();

    // Загрузка
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    // Не авторизован
    if (!isAuthenticated) {
        return (
            <div className="h-[calc(100vh-4rem)] md:h-screen">
                <AgentChatSkeleton />
            </div>
        );
    }

    const labels: AgentChatLabels = {
        title: t('title'),
        subtitle: t('subtitle'),
        backToMain: t('backToMain'),
        propertyThreads: t('propertyThreads'),
        noThreads: t('noThreads'),
        mainChat: t('mainChat'),
        threadTitle: t('threadTitle'),
        filters: {
            today: t('filters.today'),
            yesterday: t('filters.yesterday'),
            thisWeek: t('filters.thisWeek'),
            thisMonth: t('filters.thisMonth'),
            allTime: t('filters.allTime'),
            allFilters: t('filters.allFilters'),
            selectFilter: t('filters.selectFilter'),
        },
        settings: {
            title: t('settings.title'),
            searchParams: t('settings.searchParams'),
            notifications: t('settings.notifications'),
            activeHours: t('settings.activeHours'),
            from: t('settings.from'),
            to: t('settings.to'),
            frequency: t('settings.frequency'),
            immediately: t('settings.immediately'),
            every15min: t('settings.every15min'),
            every30min: t('settings.every30min'),
            every1hour: t('settings.every1hour'),
            every2hours: t('settings.every2hours'),
            onlineMode: t('settings.onlineMode'),
            offlineMode: t('settings.offlineMode'),
            onlineDesc: t('settings.onlineDesc'),
            offlineDesc: t('settings.offlineDesc'),
        },
        actions: {
            like: t('actions.like'),
            dislike: t('actions.dislike'),
            report: t('actions.report'),
            reply: t('actions.reply'),
        },
        quickActions: {
            description: t('quickActions.description'),
            makeNote: t('quickActions.makeNote'),
            addFavorite: t('quickActions.addFavorite'),
            suitable: t('quickActions.suitable'),
            notSuitable: t('quickActions.notSuitable'),
            whatsNearby: t('quickActions.whatsNearby'),
            contact: t('quickActions.contact'),
        },
        noteForm: {
            title: t('noteForm.title'),
            placeholder: t('noteForm.placeholder'),
            save: t('noteForm.save'),
            cancel: t('noteForm.cancel'),
            saved: t('noteForm.saved'),
        },
        contactForm: {
            title: t('contactForm.title'),
            phone: t('contactForm.phone'),
            whatsapp: t('contactForm.whatsapp'),
            email: t('contactForm.email'),
            call: t('contactForm.call'),
            write: t('contactForm.write'),
            send: t('contactForm.send'),
        },
        mediaGallery: {
            morePhotos: t('mediaGallery.morePhotos', { count: '0' }),
            allPhotos: t('mediaGallery.allPhotos'),
            photo: t('mediaGallery.photo'),
            of: t('mediaGallery.of'),
            close: t('mediaGallery.close'),
        },
        messages: {
            placeholder: t('messages.placeholder'),
            send: t('messages.send'),
            agentTyping: t('messages.agentTyping'),
            descriptionSent: t('messages.descriptionSent'),
            addedToFavorites: t('messages.addedToFavorites'),
            removedFromFavorites: t('messages.removedFromFavorites'),
            markedSuitable: t('messages.markedSuitable'),
            markedNotSuitable: t('messages.markedNotSuitable'),
            nearbyTitle: t('messages.nearbyTitle'),
            noteTitle: t('messages.noteTitle'),
        },
        empty: {
            title: t('empty.title'),
            subtitle: t('empty.subtitle'),
        },
        findMe: t('findMe'),
        objects: t('objects'),
        newObjects: t('newObjects'),
        propertyCard: {
            perMonth: t('propertyCard.perMonth'),
            rooms: t('propertyCard.rooms'),
            area: t('propertyCard.area'),
            floor: t('propertyCard.floor'),
            verified: t('propertyCard.verified'),
            new: t('propertyCard.new'),
        },
    };

    return (
        <AgentChatLayout
            labels={labels}
            className="h-[calc(100vh-4rem)] md:h-screen"
        />
    );
}
