'use client';

import { useMemo } from 'react';
import { Edit2, Plus, Layers } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { useSidebarStore } from '@/widgets/sidebar/model/store';
import { useChatSettingsStore } from '../../model/store';

interface SearchParamsLinkProps {
    labels: {
        searchParams: string;
        activeFilters: string;
        editFilter: string;
        linkFilter: string;
    };
    filters?: Array<{ id: string; name: string }>;
    className?: string;
}

export function SearchParamsLink({ labels, filters, className }: SearchParamsLinkProps) {
    const { settings, updateSettings } = useChatSettingsStore();
    const savedQueries = useSidebarStore((state) => state.queries);

    const allFilters = useMemo(() => {
        if (filters?.length) {
            return filters;
        }

        return savedQueries
            .filter((query) => query.title.trim().length > 0)
            .map((query) => ({
                id: query.id,
                name: query.title,
            }));
    }, [filters, savedQueries]);

    const linkedFilters = allFilters.filter((filter) =>
        settings.linkedFilterIds.includes(filter.id)
    );
    const unlinkedFilters = allFilters.filter(
        (filter) => !settings.linkedFilterIds.includes(filter.id)
    );

    const handleUnlink = (filterId: string) => {
        updateSettings({
            linkedFilterIds: settings.linkedFilterIds.filter((id) => id !== filterId),
        });
    };

    const handleLink = (filterId: string) => {
        updateSettings({
            linkedFilterIds: [...settings.linkedFilterIds, filterId],
        });
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">
                    {labels.searchParams}
                </span>
            </div>

            <div className="space-y-2">
                <span className="text-xs text-text-tertiary">{labels.activeFilters}</span>

                {linkedFilters.length > 0 ? (
                    linkedFilters.map((filter) => (
                        <div
                            key={filter.id}
                            className="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl border border-border/70 bg-background-secondary/70"
                        >
                            <Badge variant="primary" className="max-w-full truncate text-[10px]">
                                {filter.name}
                            </Badge>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleUnlink(filter.id)}
                                    className="text-xs text-text-tertiary hover:text-error transition-colors cursor-pointer"
                                >
                                    &times;
                                </button>
                                <button
                                    className="text-xs text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 cursor-pointer ml-2"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    {labels.editFilter}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-4 text-xs text-text-tertiary bg-background-secondary/50">
                        {labels.linkFilter}
                    </div>
                )}

                {unlinkedFilters.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                        {unlinkedFilters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => handleLink(filter.id)}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl',
                                    'border border-dashed border-border hover:border-brand-primary/30',
                                    'text-text-secondary hover:text-brand-primary bg-background',
                                    'transition-all duration-200 cursor-pointer'
                                )}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="text-xs truncate">{filter.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
