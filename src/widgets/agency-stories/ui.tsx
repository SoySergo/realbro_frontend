'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/shared/config/routing';
import { ChevronLeft, ChevronRight, Building2, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AgencyCardData } from '@/entities/agency';

/**
 * Мини-карточка агентства в формате "истории"
 */
function AgencyStoryCard({ agency, locale }: { agency: AgencyCardData; locale: string }) {
    const t = useTranslations('agency');
    return (
        <Link
            href={`/agency/${agency.slug}`}
            locale={locale}
            className="flex-shrink-0 w-[120px] cursor-pointer group/story"
        >
            <div className="relative w-[120px] h-[160px] rounded-xl overflow-hidden transition-all">
                {/* Фон */}
                {agency.logo ? (
                    <Image
                        src={agency.logo}
                        alt={agency.name}
                        fill
                        className="object-cover"
                        sizes="120px"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-primary-light to-brand-primary/20 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-brand-primary/50" />
                    </div>
                )}

                {/* Градиент */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Рейтинг */}
                <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-white text-[10px] font-medium">
                        {agency.rating.toFixed(1)}
                    </span>
                </div>

                {/* Контент внизу */}
                <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-semibold truncate">
                        {agency.name}
                    </p>
                    <p className="text-white/70 text-[10px] truncate">
                        {agency.objectsCount} {t('objects')} · {agency.city}
                    </p>
                </div>

                {/* Premium бордер */}
                {agency.isPremium && (
                    <div className="absolute inset-0 rounded-xl ring-2 ring-amber-400/60 pointer-events-none" />
                )}
            </div>
        </Link>
    );
}

interface AgencyStoriesProps {
    agencies: AgencyCardData[];
    locale: string;
}

/**
 * Блок рекомендованных агентств в формате "историй"
 */
export function AgencyStories({ agencies, locale }: AgencyStoriesProps) {
    const t = useTranslations('agency');
    const scrollRef = useRef<HTMLDivElement>(null);

    if (agencies.length === 0) return null;

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    };

    return (
        <div className="px-3 md:px-6 py-4 border-b border-border">
            {/* Заголовок */}
            <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-medium text-text-primary">
                    {t('recommendedAgencies')}
                </span>
            </div>

            {/* Карусель */}
            <div className="relative group/carousel">
                {/* Кнопка прокрутки влево */}
                <button
                    onClick={scrollLeft}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-background hidden md:flex"
                >
                    <ChevronLeft className="w-4 h-4 text-text-primary" />
                </button>

                {/* Скроллируемый контейнер */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
                >
                    {agencies.map((agency) => (
                        <AgencyStoryCard
                            key={agency.id}
                            agency={agency}
                            locale={locale}
                        />
                    ))}
                </div>

                {/* Кнопка прокрутки вправо */}
                <button
                    onClick={scrollRight}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-background hidden md:flex"
                >
                    <ChevronRight className="w-4 h-4 text-text-primary" />
                </button>
            </div>
        </div>
    );
}
