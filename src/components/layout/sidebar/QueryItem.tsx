'use client';

import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import type { SearchQuery } from '@/types/sidebar';

type QueryItemProps = {
    query: SearchQuery;
    isActive: boolean;
    isHovered?: boolean;
    canDelete: boolean;
    variant: 'compact' | 'full';
    onSelect: () => void;
    onDelete?: () => void;
};

export function QueryItem({
    query,
    isActive,
    isHovered = false,
    canDelete,
    variant,
    onSelect,
    onDelete,
}: QueryItemProps) {
    // Компактный вид для свёрнутого сайдбара
    if (variant === 'compact') {
        return (
            <div className="relative">
                <button
                    onClick={onSelect}
                    className={cn(
                        'w-full h-12 flex items-center justify-center rounded-lg',
                        'transition-colors duration-150 border-2',
                        isActive
                            ? 'bg-brand-primary-light border-brand-primary text-brand-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                    )}
                >
                    <MapPin className="w-5 h-5" />
                </button>

                {/* Tooltip с фильтрами при ховере */}
                {isHovered && (
                    <div className="absolute left-full ml-2 top-0 z-50 w-64 p-3 bg-background-secondary border border-border rounded-lg shadow-lg">
                        <div className="text-sm font-semibold text-text-primary mb-2">
                            {query.title}
                        </div>
                        <QueryFilters query={query} />
                        <QueryStats query={query} />
                    </div>
                )}
            </div>
        );
    }

    // Полный вид для развёрнутого сайдбара и мобильного
    return (
        <button
            onClick={onSelect}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                'transition-colors duration-150 group border-2',
                isActive
                    ? 'bg-brand-primary-light border-brand-primary text-text-primary'
                    : 'border-transparent hover:bg-background-secondary text-text-secondary'
            )}
        >
            <MapPin
                className={cn(
                    'w-5 h-5 shrink-0',
                    isActive ? 'text-brand-primary' : 'text-text-tertiary'
                )}
            />
            <div className="flex-1 min-w-0 text-left">
                <div className="text-base font-medium truncate">{query.title}</div>
                <QueryStats query={query} className="text-sm mt-0.5" />
                <QueryFilters query={query} className="mt-2" />
            </div>

            {/* Кнопка удаления */}
            {canDelete && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="w-8 h-8 rounded flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors"
                >
                    <X className="w-5 h-5" />
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

// Компонент для отображения фильтров в виде badges
function QueryFilters({ query, className }: { query: SearchQuery; className?: string }) {
    const t = useTranslations('sidebar');

    if (Object.keys(query.filters).length === 0) return null;

    return (
        <div className={cn('flex flex-wrap gap-1', className)}>
            {query.filters.location && (
                <Badge variant="secondary" className="text-xs h-5 px-2">
                    {query.filters.location}
                </Badge>
            )}
            {query.filters.bedrooms && (
                <Badge variant="secondary" className="text-xs h-5 px-2">
                    {query.filters.bedrooms} {t('bedrooms')}
                </Badge>
            )}
            {(query.filters.priceMin || query.filters.priceMax) && (
                <Badge variant="secondary" className="text-xs h-5 px-2 font-mono">
                    {query.filters.priceMin || 0}€ - {query.filters.priceMax || '∞'}€
                </Badge>
            )}
        </div>
    );
}
