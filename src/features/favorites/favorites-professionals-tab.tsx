'use client';

import { useTranslations } from 'next-intl';
import { Users, MessageSquare, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import type { FavoriteProfessional } from '@/entities/favorites/model/types';
import { cn, safeImageSrc } from '@/shared/lib/utils';

interface FavoritesProfessionalsTabProps {
    professionals: FavoriteProfessional[];
    isEmpty: boolean;
    onRemove?: (id: string) => void;
    onContact?: (id: string) => void;
}

/**
 * Таб избранных профессионалов
 */
export function FavoritesProfessionalsTab({ 
    professionals, 
    isEmpty,
    onRemove,
    onContact 
}: FavoritesProfessionalsTabProps) {
    const t = useTranslations('favorites');

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals.map((favProfessional) => {
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
    );
}
