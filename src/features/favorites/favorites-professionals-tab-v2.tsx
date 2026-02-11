'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Phone, MessageSquare, Star, Trash2, CheckCircle, Eye, Mail, MessageCircle, ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import type { FavoriteProfessional, FavoritesProfessionalsFilters } from '@/entities/favorites/model/types';
import { cn, safeImageSrc } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
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
                    case 'viewed':
                        return item.viewedAt !== undefined;
                    case 'contacted':
                        return item.contactRequestedAt !== undefined;
                    case 'messaged':
                        return item.messagesSent && item.messagesSent > 0;
                    case 'reviewed':
                        return item.reviewWritten === true;
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
                    comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
                    break;
                case 'lastInteraction':
                    const aLastInteraction = Math.max(
                        a.viewedAt?.getTime() || 0,
                        a.contactRequestedAt?.getTime() || 0
                    );
                    const bLastInteraction = Math.max(
                        b.viewedAt?.getTime() || 0,
                        b.contactRequestedAt?.getTime() || 0
                    );
                    comparison = aLastInteraction - bLastInteraction;
                    break;
                case 'messagesCount':
                    comparison = (a.messagesSent || 0) - (b.messagesSent || 0);
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
                        value && setFilters({ ...filters, interactionType: value as any })
                    }
                    className="border border-border rounded-lg p-1"
                >
                    <ToggleGroupItem value="all" size="sm" className="text-xs">
                        {t('professionals.filters.all')}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="viewed" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {t('professionals.filters.viewed')}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="contacted" size="sm" className="text-xs">
                        <Phone className="w-3 h-3 mr-1" />
                        {t('professionals.filters.contacted')}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="messaged" size="sm" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {t('professionals.filters.messaged')}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="reviewed" size="sm" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {t('professionals.filters.reviewed')}
                    </ToggleGroupItem>
                </ToggleGroup>

                {/* Сортировка */}
                <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                        const [sortBy, sortOrder] = value.split('-');
                        setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
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
                        const prof = favProfessional.professional;
                        return (
                            <div 
                                key={favProfessional.id}
                                className="bg-card rounded-xl border border-border p-4 hover:border-primary transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Аватар */}
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={safeImageSrc(prof.avatar)} />
                                        <AvatarFallback className="text-lg">
                                            {prof.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Информация */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-text-primary truncate">
                                                {prof.name}
                                            </h3>
                                            {prof.isVerified && (
                                                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                                            )}
                                            {prof.isSuperAgent && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    {t('professionals.superAgent')}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-text-secondary">
                                            {prof.type === 'agent' && t('professionals.agent')}
                                            {prof.type === 'agency' && t('professionals.agency')}
                                            {prof.type === 'owner' && t('professionals.owner')}
                                            {prof.agencyName && prof.type !== 'agency' && ` • ${prof.agencyName}`}
                                        </p>

                                        <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                                            {prof.objectsCount && (
                                                <span>
                                                    {t('professionals.activeListings', { count: prof.objectsCount })}
                                                </span>
                                            )}
                                            {prof.yearsOnPlatform && (
                                                <span>
                                                    {t('professionals.yearsOnPlatform', { count: prof.yearsOnPlatform })}
                                                </span>
                                            )}
                                        </div>

                                        {/* История взаимодействий */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {favProfessional.viewedAt && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {t('professionals.viewed')} {format(favProfessional.viewedAt, 'd MMM', { locale: dateLocale })}
                                                </Badge>
                                            )}
                                            {favProfessional.contactRequestedAt && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {t('professionals.contactRequested')} {format(favProfessional.contactRequestedAt, 'd MMM', { locale: dateLocale })}
                                                </Badge>
                                            )}
                                            {favProfessional.messagesSent && favProfessional.messagesSent > 0 && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {t('professionals.messages', { count: favProfessional.messagesSent })}
                                                </Badge>
                                            )}
                                            {favProfessional.reviewWritten && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <Star className="w-3 h-3" />
                                                    {t('professionals.reviewWritten')}
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
