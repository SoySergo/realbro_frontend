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
                    'p-2 rounded-lg cursor-pointer relative overflow-hidden',
                    'transition-all duration-150',
                    isActive
                        ? 'text-brand-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                )}
            >
                {/* Градиентный фон для активного элемента */}
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/15 to-transparent rounded-lg" />
                )}
                <QueryIcon queryType={query.queryType} className="w-[18px] h-[18px] relative" />
                {/* Индикатор AI агента в режиме поиска */}
                {query.hasAiAgent && query.aiAgentStatus === 'searching' && (
                    <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                )}
                {query.isUnsaved && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-warning" />
                )}
                {query.newResultsCount !== undefined && query.newResultsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-primary/70 text-white text-[10px] font-bold px-1">
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
                'relative flex items-center justify-between rounded-lg cursor-pointer',
                'transition-all duration-150 group overflow-hidden',
                'gap-2 px-3 py-2.5 text-sm',
                isActive
                    ? 'text-brand-primary'
                    : 'text-text-primary hover:bg-background-secondary'
            )}
        >
            {/* Градиентный фон для активного элемента */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/15 to-transparent rounded-lg" />
            )}

            {/* Кликабельная область для выбора query */}
            <div
                onClick={onSelect}
                className="absolute inset-0 cursor-pointer"
                aria-label={`Select ${query.title}`}
            />

            <div className="relative flex items-center gap-2 min-w-0 z-10 pointer-events-none">
                <QueryIcon
                    queryType={query.queryType}
                    className={cn(
                        'w-[15px] h-[15px] shrink-0',
                        isActive ? 'text-brand-primary' : 'text-text-tertiary'
                    )}
                />
                {/* Индикатор AI агента в режиме поиска */}
                {query.hasAiAgent && query.aiAgentStatus === 'searching' && (
                    <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                )}
                <span className="truncate">{query.title}</span>
                {query.isUnsaved && (
                    <span
                        className="w-2 h-2 rounded-full bg-warning shrink-0"
                        title="Unsaved"
                    />
                )}
            </div>

            <div className="relative flex items-center gap-1 z-10">
                {/* Статистика результатов */}
                <QueryStats query={query} className="text-xs" />

                {/* Бейдж новых результатов */}
                {query.newResultsCount !== undefined && query.newResultsCount > 0 && (
                    <span className="text-[10px] bg-gradient-to-r from-brand-primary to-brand-primary/70 text-white px-1.5 py-0.5 rounded-full font-medium pointer-events-none">
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
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 rounded hover:bg-error/10 hover:text-error transition-all cursor-pointer relative z-10"
                        aria-label={`Delete ${query.title}`}
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
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
