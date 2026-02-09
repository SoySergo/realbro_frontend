'use client';

import { Search, BedDouble, Building2, Home, Store, Users, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { SearchQuery, SearchQueryType } from '@/widgets/sidebar/model';

// Маппинг типа запроса на иконку
const queryIconMap: Record<SearchQueryType, LucideIcon> = {
    search: Search,
    residential_rooms: BedDouble,
    residential_apartments: Building2,
    residential_houses: Home,
    commercial: Store,
    agent: Users,
};

// Рендер иконки по типу запроса
function QueryIcon({ queryType, className }: { queryType?: SearchQueryType; className?: string }) {
    const IconComponent = queryIconMap[queryType ?? 'search'] ?? Search;
    return <IconComponent className={className} />;
}

type DesktopQueryItemProps = {
    query: SearchQuery;
    isActive: boolean;
    canDelete: boolean;
    isExpanded: boolean;
    onSelect: () => void;
    onDelete?: () => void;
};

export function DesktopQueryItem({
    query,
    isActive,
    canDelete,
    isExpanded,
    onSelect,
    onDelete,
}: DesktopQueryItemProps) {
    // Компактный вид для свёрнутого сайдбара
    if (!isExpanded) {
        return (
            <button
                onClick={onSelect}
                className={cn(
                    'w-full h-12 flex items-center justify-center rounded-lg cursor-pointer relative',
                    'transition-colors duration-150 border-2',
                    isActive
                        ? 'bg-gradient-to-r from-brand-primary/15 to-transparent border-brand-primary text-brand-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                )}
            >
                <QueryIcon queryType={query.queryType} className="w-5 h-5" />
                {/* Индикатор AI агента в режиме поиска */}
                {query.hasAiAgent && query.aiAgentStatus === 'searching' && (
                    <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                )}
                {query.isUnsaved && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-warning" />
                )}
                {query.newResultsCount !== undefined && query.newResultsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-primary/70 text-white text-[10px] font-bold px-1">
                        {query.newResultsCount}
                    </span>
                )}
            </button>
        );
    }

    // Полный вид для развёрнутого десктопного сайдбара
    return (
        <div
            className={cn(
                'w-full flex items-center rounded-lg cursor-pointer relative',
                'transition-colors duration-150 group border-2',
                'gap-2 px-2 py-2',
                isActive
                    ? 'bg-gradient-to-r from-brand-primary/15 to-transparent border-brand-primary text-text-primary'
                    : 'border-transparent hover:bg-background-tertiary text-text-secondary'
            )}
        >
            {/* Кликабельная область для выбора query */}
            <div
                onClick={onSelect}
                className="absolute inset-0 cursor-pointer"
                aria-label={`Select ${query.title}`}
            />

            <div className="relative shrink-0 z-10 pointer-events-none">
                <QueryIcon
                    queryType={query.queryType}
                    className={cn(
                        'w-5 h-5',
                        isActive ? 'text-brand-primary' : 'text-text-tertiary'
                    )}
                />
                {/* Индикатор AI агента в режиме поиска */}
                {query.hasAiAgent && query.aiAgentStatus === 'searching' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                )}
            </div>
            <div className="flex-1 min-w-0 text-left relative z-10 pointer-events-none">
                <div className="flex items-center gap-1.5">
                    <span className="font-medium truncate text-sm">{query.title}</span>
                    {query.isUnsaved && (
                        <span
                            className="w-2 h-2 rounded-full bg-warning shrink-0"
                            title="Unsaved"
                        />
                    )}
                </div>
                <QueryStats query={query} className="mt-0.5 text-xs" />
            </div>

            {/* Бейдж новых результатов */}
            {query.newResultsCount !== undefined && query.newResultsCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-primary/70 text-white text-[11px] font-bold px-1.5 relative z-10 pointer-events-none">
                    +{query.newResultsCount}
                </span>
            )}

            {/* Кнопка удаления */}
            {canDelete && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 rounded flex items-center justify-center hover:bg-error/10 hover:text-error transition-all w-6 h-6 cursor-pointer relative z-10"
                    aria-label={`Delete ${query.title}`}
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
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
