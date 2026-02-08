'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/shared/config/routing';
import { Star, MapPin, BadgeCheck, Crown, Building2, Users } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { AgencyCardData } from '@/entities/agency';

interface AgencyCardHorizontalProps {
    agency: AgencyCardData;
    locale: string;
    className?: string;
}

/**
 * Горизонтальная карточка агентства для режима списка
 */
export function AgencyCardHorizontal({ agency, locale, className }: AgencyCardHorizontalProps) {
    const t = useTranslations('agency');
    const tLang = useTranslations('languages');

    const isPremium = agency.isPremium;

    return (
        <Link
            href={`/agency/${agency.id}`}
            locale={locale}
            className={cn('group block', className)}
        >
            <div className={cn(
                'flex gap-4 p-4 border-b border-border transition-colors',
                isPremium
                    ? 'bg-gradient-to-r from-slate-900/5 to-transparent dark:from-slate-800/30 dark:to-transparent hover:from-slate-900/10 dark:hover:from-slate-800/50'
                    : 'hover:bg-background-secondary/50'
            )}>
                {/* Логотип */}
                <div className={cn(
                    'relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0',
                    isPremium
                        ? 'ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 bg-white dark:bg-slate-700'
                        : 'bg-background border border-border shadow-sm'
                )}>
                    {agency.logo ? (
                        <Image
                            src={agency.logo}
                            alt={agency.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-background-secondary">
                            <Building2 className={cn(
                                'w-8 h-8',
                                isPremium ? 'text-amber-500' : 'text-text-tertiary'
                            )} />
                        </div>
                    )}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                    {/* Первая строка: название + бейджи */}
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-primary truncate group-hover:text-brand-primary transition-colors">
                            {agency.name}
                        </h3>
                        {isPremium && (
                            <Badge
                                variant="default"
                                className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold border-0 text-xs gap-0.5 shrink-0"
                            >
                                <Crown className="w-3 h-3" />
                                VIP
                            </Badge>
                        )}
                        {agency.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-success shrink-0" />
                        )}
                    </div>

                    {/* Город */}
                    <div className="flex items-center gap-1 text-sm text-text-secondary mb-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{agency.city}</span>
                    </div>

                    {/* Описание */}
                    {agency.description && (
                        <p className="text-sm text-text-secondary line-clamp-1 mb-2 hidden md:block">
                            {agency.description}
                        </p>
                    )}

                    {/* Статистика */}
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                        {/* Рейтинг */}
                        <div className="flex items-center gap-1">
                            <Star className={cn(
                                'w-4 h-4 fill-current',
                                isPremium ? 'text-amber-400' : 'text-amber-500'
                            )} />
                            <span className="font-semibold text-text-primary">
                                {agency.rating.toFixed(1)}
                            </span>
                            <span className="text-text-tertiary">
                                ({agency.reviewsCount})
                            </span>
                        </div>

                        <div className="w-px h-3.5 bg-border" />

                        {/* Объекты */}
                        <div className="flex items-center gap-1 text-text-secondary">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{agency.objectsCount} {t('objects')}</span>
                        </div>

                        {/* Языки (только desktop) */}
                        <div className="hidden md:flex items-center gap-1.5">
                            <div className="w-px h-3.5 bg-border" />
                            {agency.languages.slice(0, 3).map((lang: string) => (
                                <Badge key={lang} variant="secondary" className="text-xs py-0">
                                    {tLang(lang)}
                                </Badge>
                            ))}
                            {agency.languages.length > 3 && (
                                <span className="text-xs text-text-tertiary">
                                    +{agency.languages.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
