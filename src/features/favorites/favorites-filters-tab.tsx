'use client';

import { useTranslations } from 'next-intl';
import { Filter, Play, Trash2, Edit, Clock, MapPin, Home, Euro } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { SavedFilter } from '@/entities/favorites/model/types';
import { cn } from '@/shared/lib/utils';
import { format, type Locale } from 'date-fns';
import { ru, enUS, fr } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface FavoritesFiltersTabProps {
    filters: SavedFilter[];
    isEmpty: boolean;
    onApply?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
}

const dateLocales: Record<string, Locale> = {
    ru,
    en: enUS,
    fr,
};

/**
 * Таб сохраненных фильтров
 */
export function FavoritesFiltersTab({ 
    filters, 
    isEmpty,
    onApply,
    onDelete,
    onEdit 
}: FavoritesFiltersTabProps) {
    const t = useTranslations('favorites');
    const locale = useLocale();

    const formatDate = (date: Date) => {
        return format(new Date(date), 'd MMM yyyy', { 
            locale: dateLocales[locale] || enUS 
        });
    };

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                    <Filter className="w-8 h-8 text-text-secondary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    {t('empty.filters.title')}
                </h2>
                <p className="text-text-secondary max-w-sm">
                    {t('empty.filters.description')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {filters.map((filter) => (
                <div 
                    key={filter.id}
                    className="bg-card rounded-xl border border-border p-4 hover:border-primary transition-colors"
                >
                    <div className="flex items-start justify-between gap-4">
                        {/* Информация о фильтре */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-primary mb-2">
                                {filter.name}
                            </h3>

                            {/* Теги фильтров */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {filter.filters.priceMax && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Euro className="w-3 h-3 mr-1" />
                                        {`≤ ${filter.filters.priceMax}€`}
                                    </Badge>
                                )}
                                {filter.filters.priceMin && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Euro className="w-3 h-3 mr-1" />
                                        {`≥ ${filter.filters.priceMin}€`}
                                    </Badge>
                                )}
                                {filter.filters.roomsMin && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Home className="w-3 h-3 mr-1" />
                                        {`${filter.filters.roomsMin}+ комн.`}
                                    </Badge>
                                )}
                                {filter.filters.areaMin && (
                                    <Badge variant="secondary" className="text-xs">
                                        {`≥ ${filter.filters.areaMin} м²`}
                                    </Badge>
                                )}
                                {filter.location && (
                                    <Badge variant="outline" className="text-xs">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {filter.location.type === 'search' && filter.location.places?.[0]?.name}
                                        {filter.location.type === 'isochrone' && `${filter.location.isochrone?.minutes} мин`}
                                        {filter.location.type === 'radius' && `${filter.location.radius?.radiusKm} км`}
                                    </Badge>
                                )}
                            </div>

                            {/* Статистика */}
                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                                {filter.propertiesCount !== undefined && (
                                    <span>
                                        {t('filters.propertiesCount', { count: filter.propertiesCount })}
                                    </span>
                                )}
                                {filter.lastUsedAt && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {t('filters.lastUsed', { date: formatDate(filter.lastUsedAt) })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Действия */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => onApply?.(filter.id)}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                {t('filters.applyFilter')}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit?.(filter.id)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onDelete?.(filter.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
