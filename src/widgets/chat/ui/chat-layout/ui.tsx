'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { useChatStore, useChatUIStore } from '@/features/chat-messages';
import { ChatSidebar } from '../chat-sidebar/ui';
import { ChatWindow } from '../chat-window/ui';
import { ChatSettingsPanel } from '../chat-settings-panel/ui';
import { AI_AGENT_CONVERSATION_ID } from '@/entities/chat';
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
    const searchParams = useSearchParams();
    const { conversations, activeConversationId, setActiveConversation } = useChatStore();
    const { setChatOpen } = useChatUIStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const requestedConversationId = searchParams.get('conversationId');

    // Синхронизируем состояние чата с глобальным стором для скрытия нижнего меню
    useEffect(() => {
        setChatOpen(showMobileChat);
        return () => setChatOpen(false);
    }, [showMobileChat, setChatOpen]);

    useEffect(() => {
        if (!requestedConversationId) return;

        const targetConversation = conversations.find(
            (conversation) => conversation.id === requestedConversationId
        );

        if (!targetConversation) return;

        if (activeConversationId !== targetConversation.id) {
            setActiveConversation(targetConversation.id);
        }

        if (targetConversation.id === AI_AGENT_CONVERSATION_ID) {
            setShowMobileChat(true);
        }
    }, [requestedConversationId, conversations, activeConversationId, setActiveConversation]);

    const handleBackToSidebar = () => {
        setShowMobileChat(false);
    };

    return (
        <div
            className={cn(
                'flex h-full bg-background-secondary/40 overflow-hidden',
                'md:rounded-[9px] md:border md:border-border',
                'md:shadow-[0_12px_40px_rgba(15,23,42,0.08)]',
                className
            )}
        >
            {/* Sidebar — hidden on mobile when chat is open */}
            <div
                className={cn(
                    'w-full md:w-[360px] lg:w-[400px] shrink-0',
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
                    'flex-1 min-w-0 bg-background',
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
