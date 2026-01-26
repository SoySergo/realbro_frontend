'use client';

import { Clock, Bell, Zap, Power } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useChatSettingsStore } from '../../model/store';
import type { NotificationFrequency } from '@/entities/chat';

interface NotificationSettingsProps {
    labels: {
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

const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${String(i).padStart(2, '0')}:00`,
}));

const frequencyOptions: { value: NotificationFrequency; labelKey: keyof NotificationSettingsProps['labels'] }[] = [
    { value: 'immediately', labelKey: 'immediately' },
    { value: '15min', labelKey: 'every15min' },
    { value: '30min', labelKey: 'every30min' },
    { value: '1hour', labelKey: 'every1hour' },
    { value: '2hours', labelKey: 'every2hours' },
];

export function NotificationSettings({ labels, className }: NotificationSettingsProps) {
    const { settings, updateSettings } = useChatSettingsStore();

    return (
        <div className={cn('space-y-6', className)}>
            {/* Agent Status */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Power className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">
                        {labels.agentStatus}
                    </span>
                </div>
                <button
                    onClick={() => updateSettings({ isActive: !settings.isActive })}
                    className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer',
                        'transition-all duration-200',
                        settings.isActive
                            ? 'border-success/30 bg-success/5'
                            : 'border-border bg-background-secondary'
                    )}
                >
                    <span className="text-sm font-medium text-text-primary">
                        {settings.isActive ? labels.active : labels.paused}
                    </span>
                    <div
                        className={cn(
                            'w-10 h-6 rounded-full transition-all duration-300 relative',
                            settings.isActive ? 'bg-success' : 'bg-text-tertiary'
                        )}
                    >
                        <div
                            className={cn(
                                'w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300',
                                settings.isActive ? 'left-5' : 'left-1'
                            )}
                        />
                    </div>
                </button>
                <div className="flex items-center justify-between text-xs text-text-tertiary px-1">
                    <span>{labels.runningFor.replace('{days}', '14')}</span>
                    <span>{labels.totalFound.replace('{count}', '342')}</span>
                </div>
            </div>

            {/* Active Hours */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">
                        {labels.activeHours}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <label className="text-xs text-text-tertiary mb-1 block">
                            {labels.from}
                        </label>
                        <select
                            value={settings.notificationStartHour}
                            onChange={(e) =>
                                updateSettings({ notificationStartHour: Number(e.target.value) })
                            }
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        >
                            {hours.map((h) => (
                                <option key={h.value} value={h.value}>
                                    {h.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <span className="text-text-tertiary mt-5">—</span>
                    <div className="flex-1">
                        <label className="text-xs text-text-tertiary mb-1 block">
                            {labels.to}
                        </label>
                        <select
                            value={settings.notificationEndHour}
                            onChange={(e) =>
                                updateSettings({ notificationEndHour: Number(e.target.value) })
                            }
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        >
                            {hours.map((h) => (
                                <option key={h.value} value={h.value}>
                                    {h.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Frequency */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">
                        {labels.frequency}
                    </span>
                </div>
                <div className="space-y-1.5">
                    {frequencyOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() =>
                                updateSettings({ notificationFrequency: option.value })
                            }
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer',
                                'transition-all duration-200 text-left',
                                settings.notificationFrequency === option.value
                                    ? 'bg-brand-primary-light border border-brand-primary/20'
                                    : 'hover:bg-background-tertiary border border-transparent'
                            )}
                        >
                            {option.value === 'immediately' && (
                                <Zap
                                    className={cn(
                                        'w-4 h-4',
                                        settings.notificationFrequency === option.value
                                            ? 'text-brand-primary'
                                            : 'text-text-tertiary'
                                    )}
                                />
                            )}
                            {option.value !== 'immediately' && (
                                <div
                                    className={cn(
                                        'w-4 h-4 rounded-full border-2',
                                        settings.notificationFrequency === option.value
                                            ? 'border-brand-primary bg-brand-primary'
                                            : 'border-text-tertiary'
                                    )}
                                >
                                    {settings.notificationFrequency === option.value && (
                                        <div className="w-full h-full rounded-full flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <span
                                className={cn(
                                    'text-sm',
                                    settings.notificationFrequency === option.value
                                        ? 'text-text-primary font-medium'
                                        : 'text-text-secondary'
                                )}
                            >
                                {labels[option.labelKey]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
