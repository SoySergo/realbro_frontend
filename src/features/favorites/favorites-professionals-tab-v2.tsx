'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Phone, MessageSquare, Star, Trash2, Eye, MessageCircle, ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import type { FavoriteProfessional, FavoritesProfessionalsFilters } from '@/entities/favorites/model/types';
import { safeImageSrc } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { ru, enUS, es, fr, de, it, pt, ca, uk, type Locale } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface FavoritesProfessionalsTabProps {
    professionals: FavoriteProfessional[];
    isEmpty: boolean;
    onRemove?: (id: string) => void;
    onContact?: (id: string) => void;
}

const dateLocales: Record<string, Locale> = {
    ru,
    en: enUS,
    es,
    fr,
    de,
    it,
    pt,
    ca,
    uk,
};

/**
 * Улучшенный таб избранных профессионалов с отслеживанием взаимодействий
 */
export function FavoritesProfessionalsTabV2({
    professionals,
    isEmpty,
    onRemove,
    onContact
}: FavoritesProfessionalsTabProps) {
    const t = useTranslations('favorites');
    const locale = useLocale();
    const dateLocale = dateLocales[locale] || enUS;

    // Состояние фильтров
    const [filters, setFilters] = useState<FavoritesProfessionalsFilters>({
        interactionType: 'all',
        sortBy: 'addedAt',
        sortOrder: 'desc',
    });

    // Применение фильтров
    const filteredProfessionals = useMemo(() => {
        let result = [...professionals];

        // Фильтр по типу взаимодействия
        if (filters.interactionType && filters.interactionType !== 'all') {
            result = result.filter((item) => {
                switch (filters.interactionType) {
                    case 'contacted':
                        return item.contact_requested_at !== undefined;
                    case 'messaged':
                        return item.messages_count > 0;
                    default:
                        return true;
                }
            });
        }

        // Сортировка
        result.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'addedAt':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
                case 'lastInteraction':
                    const aLastInteraction = a.contact_requested_at
                        ? new Date(a.contact_requested_at).getTime() : 0;
                    const bLastInteraction = b.contact_requested_at
                        ? new Date(b.contact_requested_at).getTime() : 0;
                    comparison = aLastInteraction - bLastInteraction;
                    break;
                case 'messagesCount':
                    comparison = (a.messages_count || 0) - (b.messages_count || 0);
                    break;
                default:
                    comparison = 0;
            }

            return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [professionals, filters]);

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-text-secondary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    {t('empty.professionals.title')}
                </h2>
                <p className="text-text-secondary max-w-sm">
                    {t('empty.professionals.description')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Панель фильтров */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Фильтр по типу взаимодействия */}
                <ToggleGroup
                    type="single"
                    value={filters.interactionType || 'all'}
                    onValueChange={(value) =>
                        value && setFilters({ ...filters, interactionType: value as FavoritesProfessionalsFilters['interactionType'] })
                    }
                    className="border border-border rounded-lg p-1"
                >
                    <ToggleGroupItem value="all" className="text-xs">
                        {t('professionals.filters.all')}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="viewed" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {t('professionals.filters.viewed')}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="contacted" className="text-xs">
                        <Phone className="w-3 h-3 mr-1" />
                        {t('professionals.filters.contacted')}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="messaged" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {t('professionals.filters.messaged')}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="reviewed" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {t('professionals.filters.reviewed')}
                    </ToggleGroupItem>
                </ToggleGroup>

                {/* Сортировка */}
                <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                        const [sortBy, sortOrder] = value.split('-');
                        setFilters({
                            ...filters,
                            sortBy: sortBy as FavoritesProfessionalsFilters['sortBy'],
                            sortOrder: sortOrder as FavoritesProfessionalsFilters['sortOrder']
                        });
                    }}
                >
                    <SelectTrigger className="w-[200px] h-9 text-xs">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="addedAt-desc">{t('sort.newestFirst')}</SelectItem>
                        <SelectItem value="addedAt-asc">{t('sort.oldestFirst')}</SelectItem>
                        <SelectItem value="lastInteraction-desc">{t('professionals.sort.recentInteraction')}</SelectItem>
                        <SelectItem value="messagesCount-desc">{t('professionals.sort.mostMessages')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Счетчик результатов */}
            <div className="text-sm text-text-secondary">
                {t('filters.showing', { count: filteredProfessionals.length, total: professionals.length })}
            </div>

            {/* Список профессионалов */}
            {filteredProfessionals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="w-12 h-12 text-text-tertiary mb-3" />
                    <p className="text-text-secondary">{t('filters.noResults')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProfessionals.map((favProfessional) => {
                        return (
                            <div
                                key={favProfessional.id}
                                className="bg-card rounded-xl border border-border p-4 hover:border-primary transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Аватар */}
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={safeImageSrc(favProfessional.avatar_url || '')} />
                                        <AvatarFallback className="text-lg">
                                            {favProfessional.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Информация */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-text-primary truncate">
                                                {favProfessional.name}
                                            </h3>
                                        </div>

                                        <p className="text-sm text-text-secondary">
                                            {favProfessional.professional_type === 'agent' && t('professionals.agent')}
                                            {favProfessional.professional_type === 'agency' && t('professionals.agency')}
                                            {favProfessional.company_name && favProfessional.professional_type !== 'agency' && ` • ${favProfessional.company_name}`}
                                        </p>

                                        <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                                            {favProfessional.properties_count > 0 && (
                                                <span>
                                                    {t('professionals.activeListings', { count: favProfessional.properties_count })}
                                                </span>
                                            )}
                                        </div>

                                        {/* История взаимодействий */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {favProfessional.contact_requested_at && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {t('professionals.contactRequested')} {format(new Date(favProfessional.contact_requested_at), 'd MMM', { locale: dateLocale })}
                                                </Badge>
                                            )}
                                            {favProfessional.messages_count > 0 && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {t('professionals.messages', { count: favProfessional.messages_count })}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Действия */}
                                <div className="flex items-center gap-2 mt-4">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => onContact?.(favProfessional.id)}
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        {t('professionals.contact')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onRemove?.(favProfessional.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
