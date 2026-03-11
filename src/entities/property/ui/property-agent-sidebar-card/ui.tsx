'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Star } from 'lucide-react';
import { Link } from '@/shared/config/routing';
import type { PropertyAuthor } from '../../model/types';
import { Card } from '@/shared/ui/card';

interface PropertyAgentSidebarCardProps {
    agent: PropertyAuthor;
    className?: string;
}

export function PropertyAgentSidebarCard({
    agent,
    className
}: PropertyAgentSidebarCardProps) {
    const t = useTranslations('propertyDetail');
    const isAgency = agent.type === 'agency' || !!agent.agencyName;

    // Определяем текст роли по author_type
    const roleLabel = agent.type === 'agency'
        ? t('agency')
        : agent.type === 'owner'
            ? t('owner')
            : t('privateAgent');

    // "Объектов в работе" — минимум 1 (текущий объект)
    const objectsCount = Math.max(agent.objectsCount || 0, 1);

    return (
        <div className={cn('relative', className)}>
            <Card className="overflow-hidden border-0 shadow-sm">
                {/* Header Background */}
                <div className="h-28 bg-linear-to-b from-brand-primary-light/80 to-transparent dark:from-brand-primary/20 dark:to-transparent w-full absolute top-0 left-0 z-0"></div>

                <div className="relative z-10 px-5 pt-8 text-center space-y-3">
                    {/* Agency/Agent Logo/Avatar */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {isAgency && agent.agencyLogo ? (
                                <div className="w-24 h-24 bg-background dark:bg-card rounded-2xl shadow-sm border border-border p-2 flex items-center justify-center overflow-hidden">
                                    <Image
                                        src={agent.agencyLogo}
                                        alt={agent.agencyName || agent.name}
                                        width={84}
                                        height={84}
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-background dark:bg-card rounded-2xl shadow-sm border border-border flex items-center justify-center overflow-hidden p-1">
                                    {agent.avatar ? (
                                        <Image
                                            src={agent.avatar}
                                            alt={agent.name}
                                            width={88}
                                            height={88}
                                            className="rounded-xl object-cover w-full h-full"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-primary">
                                            {agent.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Agency Name & Type */}
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                            {roleLabel}
                        </p>
                        <Link href={`/agency/${agent.slug || agent.id}`} className="text-xl font-bold text-foreground hover:text-brand-primary transition-colors">
                            {isAgency ? agent.agencyName : agent.name}
                        </Link>
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-muted/30 rounded-lg px-3 flex justify-center items-center">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">{t('objectsInWork')}</p>
                            <p className="font-bold text-foreground text-lg leading-tight">
                                {objectsCount}
                            </p>
                        </div>
                    </div>

                    {/* Agent Profile */}
                    <div className="pt-3 flex items-center gap-3 text-left border-t border-border/50 mt-4">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 relative">
                            {agent.avatar ? (
                                <Image
                                    src={agent.avatar}
                                    alt={agent.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                    <span className="text-lg font-bold text-primary">{agent.name.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('agent')}</p>
                            <p className="font-medium text-sm text-foreground leading-tight">{agent.name}</p>
                            {/* Рейтинг и отзывы — только если есть данные */}
                            {(agent.rating != null && agent.rating > 0 || agent.reviewCount != null && agent.reviewCount > 0) && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-sm font-bold text-foreground">{agent.rating?.toFixed(1) ?? '—'}</span>
                                    <Star className="w-3.5 h-3.5 text-brand-primary fill-current" />
                                    <span className="text-xs text-muted-foreground">{t('reviews')}: {agent.reviewCount ?? 0}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
