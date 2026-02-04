'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { useChatStore, useChatUIStore } from '@/features/chat-messages';
import { ChatSidebar } from '../chat-sidebar/ui';
import { ChatWindow } from '../chat-window/ui';
import { ChatSettingsPanel } from '../chat-settings-panel/ui';
import type { PropertyCardLabels } from '@/entities/chat';

interface ChatLayoutProps {
    labels: {
        title: string;
        searchPlaceholder: string;
        tabs: Record<string, string>;
        online: string;
        offline: string;
        aiAgentTitle: string;
        settings: string;
        messagePlaceholder: string;
        selectConversation: string;
        emptyTitle: string;
        emptySubtitle: string;
        filters: Record<string, string>;
        aiAgent: Record<string, string>;
        noProperties: string;
        allFilters: string;
        selectFilter: string;
        propertyCard?: PropertyCardLabels;
        settingsPanel: {
            settingsTitle: string;
            searchParams: string;
            activeFilters: string;
            editFilter: string;
            linkFilter: string;
            activeHours: string;
            from: string;
            to: string;
            frequency: string;
            immediately: string;
            every15min: string;
            every30min: string;
            every1hour: string;
            every2hours: string;
            agentStatus: string;
            active: string;
            paused: string;
            runningFor: string;
            totalFound: string;
        };
    };
    className?: string;
}

export function ChatLayout({ labels, className }: ChatLayoutProps) {
    const { activeConversationId } = useChatStore();
    const { setChatOpen } = useChatUIStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);

    // Синхронизируем состояние чата с глобальным стором для скрытия нижнего меню
    useEffect(() => {
        setChatOpen(showMobileChat);
        return () => setChatOpen(false);
    }, [showMobileChat, setChatOpen]);

    // Mobile: show chat only when user explicitly clicks a conversation
    // (removed auto-trigger on activeConversationId change)

    const handleBackToSidebar = () => {
        setShowMobileChat(false);
    };

    return (
        <div className={cn('flex h-full', className)}>
            {/* Sidebar — hidden on mobile when chat is open */}
            <div
                className={cn(
                    'w-full md:w-[320px] lg:w-[340px] shrink-0',
                    showMobileChat ? 'hidden md:flex' : 'flex'
                )}
            >
                <ChatSidebar
                    labels={{
                        title: labels.title,
                        searchPlaceholder: labels.searchPlaceholder,
                        tabs: labels.tabs,
                    }}
                    onSelectConversation={() => setShowMobileChat(true)}
                    className="w-full"
                />
            </div>

            {/* Chat window — hidden on mobile when sidebar is shown */}
            <div
                className={cn(
                    'flex-1 min-w-0',
                    showMobileChat ? 'flex' : 'hidden md:flex'
                )}
            >
                <ChatWindow
                    onSettingsClick={() => setIsSettingsOpen(true)}
                    onBackClick={handleBackToSidebar}
                    showBack={showMobileChat}
                    labels={labels}
                    className="w-full"
                />
            </div>

            {/* Settings panel */}
            <ChatSettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                labels={labels.settingsPanel}
            />
        </div>
    );
}
