'use client';

import { useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useAutosearchStore } from '@/features/autosearch';
import { AutosearchTaskCard } from './autosearch-task-card';
import { cn } from '@/shared/lib/utils';

interface AutosearchTaskListProps {
    onCreateTask?: () => void;
    onEditTask?: (taskId: string) => void;
    onDeleteTask?: (taskId: string) => void;
    className?: string;
    labels: {
        title: string;
        create: string;
        empty: string;
        emptyDescription: string;
        loading: string;
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
 * Список заданий AutoSearch
 * 
 * Отображает все задания пользователя для автоподборки объектов.
 * Позволяет создавать, редактировать, удалять и активировать/деактивировать задания.
 */
export function AutosearchTaskList({
    onCreateTask,
    onEditTask,
    onDeleteTask,
    className,
    labels,
}: AutosearchTaskListProps) {
    const { tasks, isLoadingTasks, fetchTasks, activateTask, deactivateTask, deleteTask } =
        useAutosearchStore();

    // Загрузить задания при монтировании
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleToggleActive = async (taskId: string, isActive: boolean) => {
        try {
            if (isActive) {
                await activateTask(taskId);
            } else {
                await deactivateTask(taskId);
            }
        } catch (error) {
            console.error('[AutoSearchTaskList] Failed to toggle task:', error);
        }
    };

    const handleDelete = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            onDeleteTask?.(taskId);
        } catch (error) {
            console.error('[AutoSearchTaskList] Failed to delete task:', error);
        }
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-4 px-4 pt-4">
                <h2 className="text-lg font-semibold text-text-primary">{labels.title}</h2>
                <Button
                    variant="default"
                    size="sm"
                    onClick={onCreateTask}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {labels.create}
                </Button>
            </div>

            {/* Список заданий */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {isLoadingTasks ? (
                    <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">{labels.loading}</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-text-secondary">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-medium text-text-primary mb-2">
                            {labels.empty}
                        </h3>
                        <p className="text-sm max-w-sm mb-4">{labels.emptyDescription}</p>
                        <Button variant="default" size="sm" onClick={onCreateTask}>
                            <Plus className="w-4 h-4 mr-2" />
                            {labels.create}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <AutosearchTaskCard
                                key={task.id}
                                task={task}
                                onToggleActive={handleToggleActive}
                                onEdit={onEditTask}
                                onDelete={handleDelete}
                                labels={{
                                    active: labels.active,
                                    paused: labels.paused,
                                    channels: labels.channels,
                                    frequency: labels.frequency,
                                    schedule: labels.schedule,
                                    online: labels.online,
                                    instant: labels.instant,
                                    daily: labels.daily,
                                    weekly: labels.weekly,
                                    edit: labels.edit,
                                    delete: labels.delete,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
