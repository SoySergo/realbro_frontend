'use client';

import { Edit2, Plus, Layers } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
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

const mockFilters = [
    { id: 'filter_1', name: 'Barcelona Center' },
    { id: 'filter_2', name: 'Gracia Budget' },
    { id: 'filter_3', name: 'Eixample Premium' },
];

export function SearchParamsLink({ labels, filters, className }: SearchParamsLinkProps) {
    const { settings, updateSettings } = useChatSettingsStore();

    const allFilters = filters || mockFilters;
    const linkedFilters = allFilters.filter((f) =>
        settings.linkedFilterIds.includes(f.id)
    );
    const unlinkedFilters = allFilters.filter(
        (f) => !settings.linkedFilterIds.includes(f.id)
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
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">
                    {labels.searchParams}
                </span>
            </div>

            <div className="space-y-2">
                <span className="text-xs text-text-tertiary">{labels.activeFilters}</span>
                {linkedFilters.map((filter) => (
                    <div
                        key={filter.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-background-secondary"
                    >
                        <div className="flex items-center gap-2">
                            <Badge variant="primary" className="text-[10px]">
                                {filter.name}
                            </Badge>
                        </div>
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
                ))}

                {/* Link another filter */}
                {unlinkedFilters.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                        {unlinkedFilters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => handleLink(filter.id)}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                                    'border border-dashed border-border hover:border-brand-primary/30',
                                    'text-text-secondary hover:text-brand-primary',
                                    'transition-all duration-200 cursor-pointer'
                                )}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="text-xs">{filter.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
