'use client';

import { Switch } from '@/shared/ui/switch';
import { Button } from '@/shared/ui/button';
import { Trash2, Edit, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AutosearchTask } from '@/entities/autosearch';

interface AutosearchTaskCardProps {
    task: AutosearchTask;
    onToggleActive?: (id: string, isActive: boolean) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    className?: string;
    labels: {
        active: string;
        paused: string;
        channels: string;
        frequency: string;
        schedule: string;
        online: string;
        instant: string;
        daily: string;
        weekly: string;
        edit: string;
        delete: string;
    };
}

/**
 * Карточка задания AutoSearch
 * 
 * Отображает информацию о задании автоподборки:
 * - Название и статус (активно/пауза)
 * - Каналы уведомлений
 * - Частота и расписание
 * - Действия (редактировать/удалить)
 */
export function AutosearchTaskCard({
    task,
    onToggleActive,
    onEdit,
    onDelete,
    className,
    labels,
}: AutosearchTaskCardProps) {
    const frequencyLabel = {
        online: labels.online,
        instant: labels.instant,
        daily: labels.daily,
        weekly: labels.weekly,
    }[task.send_frequency] || task.send_frequency;

    const channelIcons: Record<string, string> = {
        online: '🟢',
        telegram: '💬',
        push: '🔔',
        email: '✉️',
    };

    return (
        <div
            className={cn(
                'bg-surface-elevated border border-border rounded-lg p-4 hover:shadow-md transition-shadow',
                !task.is_active && 'opacity-60',
                className
            )}
        >
            {/* Заголовок с переключателем */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 mr-3">
                    <h3 className="text-base font-medium text-text-primary mb-1">
                        {task.name}
                    </h3>
                    <p className="text-xs text-text-secondary">
                        {task.is_active ? (
                            <span className="inline-flex items-center gap-1 text-success">
                                <TrendingUp className="w-3 h-3" />
                                {labels.active}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {labels.paused}
                            </span>
                        )}
                    </p>
                </div>
                <Switch
                    checked={task.is_active}
                    onCheckedChange={(checked) => onToggleActive?.(task.id, checked)}
                    aria-label={task.is_active ? labels.paused : labels.active}
                />
            </div>

            {/* Каналы уведомлений */}
            <div className="mb-3">
                <p className="text-xs text-text-secondary mb-1">{labels.channels}:</p>
                <div className="flex items-center gap-2 flex-wrap">
                    {task.notification_channels.map((channel) => (
                        <span
                            key={channel}
                            className="inline-flex items-center gap-1 text-xs bg-surface hover:bg-surface-hover px-2 py-1 rounded border border-border"
                        >
                            <span>{channelIcons[channel] || '📱'}</span>
                            <span className="capitalize">{channel}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Частота и расписание */}
            <div className="mb-3 space-y-1">
                <p className="text-xs text-text-secondary">
                    <span className="font-medium">{labels.frequency}:</span>{' '}
                    {frequencyLabel}
                </p>
                <p className="text-xs text-text-secondary">
                    <span className="font-medium">{labels.schedule}:</span>{' '}
                    {task.notify_start_hour}:00 - {task.notify_end_hour}:00{' '}
                    <span className="text-text-tertiary">({task.timezone})</span>
                </p>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(task.id)}
                    className="flex-1 text-xs"
                >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    {labels.edit}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(task.id)}
                    className="flex-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    {labels.delete}
                </Button>
            </div>
        </div>
    );
}
