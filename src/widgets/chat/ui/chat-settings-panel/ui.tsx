'use client';

import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { NotificationSettings } from '@/features/chat-settings/ui/notification-settings';
import { SearchParamsLink } from '@/features/chat-settings/ui/search-params-link';

interface ChatSettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    labels: {
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
    className?: string;
}

export function ChatSettingsPanel({
    isOpen,
    onClose,
    labels,
    className,
}: ChatSettingsPanelProps) {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className={cn(
                    'fixed top-0 right-0 h-full w-[380px] max-w-[94vw] bg-background/96 backdrop-blur-xl',
                    'border-l border-border/70 shadow-2xl z-50',
                    'transition-transform duration-300 ease-in-out',
                    isOpen ? 'translate-x-0' : 'translate-x-full',
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 h-18 border-b border-border/70 shrink-0">
                    <h3 className="text-base font-semibold text-text-primary">
                        {labels.settingsTitle}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-background-secondary hover:bg-background-tertiary transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100%-4.5rem)] px-5 py-5 space-y-8 scrollbar-hide">
                    {/* Search Parameters */}
                    <SearchParamsLink
                        labels={{
                            searchParams: labels.searchParams,
                            activeFilters: labels.activeFilters,
                            editFilter: labels.editFilter,
                            linkFilter: labels.linkFilter,
                        }}
                    />

                    <div className="h-px bg-border" />

                    {/* Notification Settings */}
                    <NotificationSettings
                        labels={{
                            activeHours: labels.activeHours,
                            from: labels.from,
                            to: labels.to,
                            frequency: labels.frequency,
                            immediately: labels.immediately,
                            every15min: labels.every15min,
                            every30min: labels.every30min,
                            every1hour: labels.every1hour,
                            every2hours: labels.every2hours,
                            agentStatus: labels.agentStatus,
                            active: labels.active,
                            paused: labels.paused,
                            runningFor: labels.runningFor,
                            totalFound: labels.totalFound,
                        }}
                    />
                </div>
            </div>
        </>
    );
}
