'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/shared/config/routing';
import { Star, MapPin, BadgeCheck, Crown, Building2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
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
 */
export function AgencyCard({ agency, locale, className }: AgencyCardProps) {
    const t = useTranslations('agency');
    const tLang = useTranslations('languages');

    return (
        <Link
            href={`/agency/${agency.id}`}
            locale={locale}
            className={cn(
                'group block bg-background border border-border rounded-xl overflow-hidden',
                'hover:border-border-hover hover:shadow-md transition-all duration-200',
                className
            )}
        >
            <div className="p-4">
                {/* Шапка с логотипом и статусами */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Логотип */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-background-secondary shrink-0">
                        {agency.logo ? (
                            <Image
                                src={agency.logo}
                                alt={agency.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
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
                        <div className="flex items-center gap-1 text-sm text-text-secondary mt-0.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{agency.city}</span>
                        </div>
                    </div>

                    {/* Бейджи */}
                    <div className="flex flex-col gap-1 shrink-0">
                        {agency.isPremium && (
                            <Badge variant="default" className="gap-1">
                                <Crown className="w-3 h-3" />
                                {t('premium')}
                            </Badge>
                        )}
                        {agency.isVerified && (
                            <Badge variant="success" className="gap-1">
                                <BadgeCheck className="w-3 h-3" />
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Описание */}
                {agency.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                        {agency.description}
                    </p>
                )}

                {/* Статистика */}
                <div className="flex items-center gap-4 text-sm mb-3">
                    {/* Рейтинг */}
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-text-primary">
                            {agency.rating.toFixed(1)}
                        </span>
                        <span className="text-text-tertiary">
                            ({agency.reviewsCount})
                        </span>
                    </div>

                    {/* Объекты */}
                    <div className="flex items-center gap-1 text-text-secondary">
                        <Building2 className="w-4 h-4" />
                        <span>{agency.objectsCount} {t('objects')}</span>
                    </div>
                </div>

                {/* Языки */}
                <div className="flex flex-wrap gap-1">
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
        </Link>
    );
}
