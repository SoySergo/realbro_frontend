'use client';

import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchQuery } from '@/types/sidebar';

type DesktopQueryItemProps = {
    query: SearchQuery;
    isActive: boolean;
    isHovered?: boolean;
    canDelete: boolean;
    isExpanded: boolean;
    onSelect: () => void;
    onDelete?: () => void;
};

export function DesktopQueryItem({
    query,
    isActive,
    isHovered = false,
    canDelete,
    isExpanded,
    onSelect,
    onDelete,
}: DesktopQueryItemProps) {
    // Компактный вид для свёрнутого сайдбара
    if (!isExpanded) {
        return (
            <div className="relative">
                <button
                    onClick={onSelect}
                    className={cn(
                        'w-full h-12 flex items-center justify-center rounded-lg cursor-pointer',
                        'transition-colors duration-150 border-2',
                        isActive
                            ? 'bg-brand-primary-light border-brand-primary text-brand-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                    )}
                >
                    <MapPin className="w-5 h-5" />
                </button>

                {/* Tooltip с информацией при ховере */}
                {isHovered && (
                    <div className="absolute left-full ml-2 top-0 z-50 w-64 p-3 bg-background-secondary border border-border rounded-lg shadow-lg">
                        <div className="text-sm font-semibold text-text-primary mb-2">
                            {query.title}
                        </div>
                        <QueryStats query={query} />
                    </div>
                )}
            </div>
        );
    }

    // Полный вид для развёрнутого десктопного сайдбара
    return (
        <button
            onClick={onSelect}
            className={cn(
                'w-full flex items-center rounded-lg cursor-pointer',
                'transition-colors duration-150 group border-2',
                'gap-2 px-2 py-2',
                isActive
                    ? 'bg-brand-primary-light border-brand-primary text-text-primary'
                    : 'border-transparent hover:bg-background-tertiary text-text-secondary'
            )}
        >
            <MapPin
                className={cn(
                    'w-5 h-5 shrink-0',
                    isActive ? 'text-brand-primary' : 'text-text-tertiary'
                )}
            />
            <div className="flex-1 min-w-0 text-left">
                <div className="font-medium truncate text-sm">{query.title}</div>
                <QueryStats query={query} className="mt-0.5 text-xs" />
            </div>

            {/* Кнопка удаления */}
            {canDelete && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="rounded flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors w-6 h-6 cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </button>
    );
}

// Компонент для отображения статистики
function QueryStats({ query, className }: { query: SearchQuery; className?: string }) {
    return (
        <div className={cn('flex items-center gap-1.5 text-text-tertiary', className)}>
            {query.isLoading ? (
                <>
                    <div className="h-3 w-16 bg-text-tertiary/20 rounded animate-pulse" />
                    <span>•</span>
                    <div className="h-3 w-8 bg-text-tertiary/20 rounded animate-pulse" />
                </>
            ) : (
                <>
                    {query.resultsCount !== undefined && (
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {query.resultsCount.toLocaleString()}
                        </span>
                    )}
                    {query.newResultsCount !== undefined && query.newResultsCount > 0 && (
                        <>
                            <span>•</span>
                            <span className="text-red-600 dark:text-red-400 font-medium">
                                +{query.newResultsCount}
                            </span>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
