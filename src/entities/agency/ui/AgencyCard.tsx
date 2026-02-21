'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/shared/config/routing';
import { Star, MapPin, BadgeCheck, Crown, Building2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import type { AgencyCardData } from '@/entities/agency';

interface AgencyCardProps {
    agency: AgencyCardData;
    locale: string;
    className?: string;
}

/**
 * Карточка агентства для списка
 * Показывает основную информацию: логотип, название, рейтинг, количество объектов
 * Для Premium агентств - особый дизайн с инверсией цветов
 */
export function AgencyCard({ agency, locale, className }: AgencyCardProps) {
    const t = useTranslations('agency');
    const tLang = useTranslations('languages');

    // VIP/Premium карточка имеет особый дизайн
    if (agency.isPremium) {
        return (
            <Link
                href={`/agency/${agency.slug}`}
                locale={locale}
                className={cn('group block', className)}
            >
                <Card className={cn(
                    'relative overflow-hidden border-0 p-0',
                    'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
                    'dark:from-slate-800 dark:via-slate-700 dark:to-slate-800',
                    'hover:shadow-xl hover:shadow-brand-primary/20 transition-all duration-300',
                    'hover:scale-[1.02]'
                )}>
                    {/* Декоративный градиент сверху */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-amber-500/10 pointer-events-none" />

                    {/* Анимированный блеск для VIP */}
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out] pointer-events-none" />

                    <div className="relative p-5">
                        {/* VIP бейдж в углу */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <Badge
                                variant="default"
                                className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold border-0 shadow-lg shadow-amber-500/30 gap-1"
                            >
                                <Crown className="w-3 h-3" />
                                {t('premium')}
                            </Badge>
                            {agency.isVerified && (
                                <Badge variant="success" className="gap-1 shadow-lg shadow-green-500/20">
                                    <BadgeCheck className="w-3 h-3" />
                                </Badge>
                            )}
                        </div>

                        {/* Шапка с логотипом */}
                        <div className="flex items-start gap-4 mb-4">
                            {/* Логотип с золотой рамкой */}
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20">
                                <div className="absolute inset-0 bg-white dark:bg-slate-700" />
                                {agency.logo ? (
                                    <Image
                                        src={agency.logo}
                                        alt={agency.name}
                                        fill
                                        className="object-cover relative z-10"
                                        sizes="64px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center relative z-10">
                                        <Building2 className="w-8 h-8 text-amber-500" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 pt-1">
                                {/* Название */}
                                <h3 className="font-bold text-lg text-white truncate group-hover:text-amber-400 transition-colors">
                                    {agency.name}
                                </h3>

                                {/* Город */}
                                <div className="flex items-center gap-1.5 text-sm text-slate-300 mt-1">
                                    <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400/70" />
                                    <span className="truncate">{agency.city}</span>
                                </div>
                            </div>
                        </div>

                        {/* Описание */}
                        {agency.description && (
                            <p className="text-sm text-slate-300 line-clamp-2 mb-4">
                                {agency.description}
                            </p>
                        )}

                        {/* Статистика с улучшенным дизайном */}
                        <div className="flex items-center justify-between bg-white/5 dark:bg-white/10 rounded-lg px-4 py-3 mb-4 backdrop-blur-sm">
                            {/* Рейтинг */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                'w-4 h-4',
                                                star <= Math.round(agency.rating)
                                                    ? 'text-amber-400 fill-amber-400'
                                                    : 'text-slate-500'
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="font-bold text-white">
                                    {agency.rating.toFixed(1)}
                                </span>
                                <span className="text-slate-400 text-sm">
                                    ({agency.reviewsCount})
                                </span>
                            </div>

                            {/* Объекты */}
                            <div className="flex items-center gap-1.5 text-slate-300">
                                <Building2 className="w-4 h-4 text-amber-400/70" />
                                <span className="font-medium">{agency.objectsCount}</span>
                                <span className="text-sm">{t('objects')}</span>
                            </div>
                        </div>

                        {/* Языки */}
                        <div className="flex flex-wrap gap-1.5">
                            {agency.languages.slice(0, 4).map((lang: string) => (
                                <Badge
                                    key={lang}
                                    variant="secondary"
                                    className="text-xs bg-white/10 text-slate-200 border-white/20 hover:bg-white/20"
                                >
                                    {tLang(lang)}
                                </Badge>
                            ))}
                            {agency.languages.length > 4 && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs bg-white/10 text-slate-200 border-white/20"
                                >
                                    +{agency.languages.length - 4}
                                </Badge>
                            )}
                        </div>
                    </div>
                </Card>
            </Link>
        );
    }

    // Стандартная карточка агентства
    return (
        <Link
            href={`/agency/${agency.slug}`}
            locale={locale}
            className={cn('group block', className)}
        >
            <Card className={cn(
                'relative overflow-hidden p-0 border-border',
                'hover:border-border-hover hover:shadow-lg transition-all duration-200',
                'hover:shadow-brand-primary/5'
            )}>
                {/* Декоративный градиент сверху */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-brand-primary-light/50 to-transparent dark:from-brand-primary/10 dark:to-transparent pointer-events-none" />

                <div className="relative p-5">
                    {/* Шапка с логотипом и статусами */}
                    <div className="flex items-start gap-4 mb-4">
                        {/* Логотип */}
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-background border border-border shrink-0 shadow-sm">
                            {agency.logo ? (
                                <Image
                                    src={agency.logo}
                                    alt={agency.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-background-secondary">
                                    <Building2 className="w-6 h-6 text-text-tertiary" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Название */}
                            <h3 className="font-semibold text-text-primary truncate group-hover:text-brand-primary transition-colors">
                                {agency.name}
                            </h3>

                            {/* Город */}
                            <div className="flex items-center gap-1.5 text-sm text-text-secondary mt-1">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{agency.city}</span>
                            </div>
                        </div>

                        {/* Бейдж верификации */}
                        {agency.isVerified && (
                            <Badge variant="success" className="gap-1 shrink-0">
                                <BadgeCheck className="w-3 h-3" />
                                {t('verified')}
                            </Badge>
                        )}
                    </div>

                    {/* Описание */}
                    {agency.description && (
                        <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                            {agency.description}
                        </p>
                    )}

                    {/* Статистика */}
                    <div className="flex items-center gap-4 text-sm mb-4 bg-background-secondary/50 dark:bg-background-tertiary/50 rounded-lg px-3 py-2.5">
                        {/* Рейтинг */}
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-semibold text-text-primary">
                                {agency.rating.toFixed(1)}
                            </span>
                            <span className="text-text-tertiary">
                                ({agency.reviewsCount})
                            </span>
                        </div>

                        <div className="w-px h-4 bg-border" />

                        {/* Объекты */}
                        <div className="flex items-center gap-1.5 text-text-secondary">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{agency.objectsCount}</span>
                            <span>{t('objects')}</span>
                        </div>
                    </div>

                    {/* Языки */}
                    <div className="flex flex-wrap gap-1.5">
                        {agency.languages.slice(0, 4).map((lang: string) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                                {tLang(lang)}
                            </Badge>
                        ))}
                        {agency.languages.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                                +{agency.languages.length - 4}
                            </Badge>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
