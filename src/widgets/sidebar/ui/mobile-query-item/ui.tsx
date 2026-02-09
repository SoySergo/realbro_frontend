'use client';

import { forwardRef } from 'react';
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

type MobileQueryItemProps = {
    query: SearchQuery;
    isActive: boolean;
    canDelete: boolean;
    onSelect: () => void;
    onDelete?: () => void;
};

// Используем forwardRef для возможности скролла к элементу
export const MobileQueryItem = forwardRef<HTMLDivElement, MobileQueryItemProps>(
    function MobileQueryItem({ query, isActive, canDelete, onSelect, onDelete }, ref) {
        return (
            <div
                ref={ref}
                className={cn(
                    'w-full flex items-center rounded-lg cursor-pointer relative',
                    'transition-colors duration-150 border-2',
                    'gap-3 px-4 py-3',
                    isActive
                        ? 'bg-gradient-to-r from-brand-primary/15 to-transparent border-brand-primary text-text-primary'
                        : 'border-transparent text-text-secondary active:bg-background-tertiary'
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
                        <span className="font-medium truncate text-base">{query.title}</span>
                        {query.isUnsaved && (
                            <span
                                className="w-2 h-2 rounded-full bg-warning shrink-0"
                                title="Unsaved"
                            />
                        )}
                    </div>
                    <QueryStats query={query} className="mt-0.5 text-sm" />
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
                        className="rounded flex items-center justify-center active:bg-error/10 active:text-error transition-colors w-8 h-8 cursor-pointer relative z-10"
                        aria-label={`Delete ${query.title}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        );
    }
);

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
