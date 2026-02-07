'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Phone, MessageCircle, CheckCircle2, Star, Building2 } from 'lucide-react';
import { Link } from '@/shared/config/routing';
import type { PropertyAuthor } from '@/entities/property/model/types';

interface PropertyAgentCardProps {
    agent: PropertyAuthor;
    className?: string;
    onCall?: () => void;
    onMessage?: () => void;
    compact?: boolean;
}

export function PropertyAgentCard({
    agent,
    className,
    onCall,
    onMessage,
    compact
}: PropertyAgentCardProps) {
    const t = useTranslations('propertyDetail');

    const isAgency = agent.type === 'agency' || !!agent.agencyName;

    return (
        <div className={cn(
            'rounded-xl border border-border bg-card p-4 space-y-4',
            compact && 'border-0 bg-transparent p-0 space-y-2',
            className
        )}>
            {/* Agent/Agency info */}
            <div className="flex items-start gap-3">
                {/* Avatar or Logo */}
                <div className="relative flex-shrink-0">
                    {isAgency && agent.agencyLogo ? (
                        <div className={cn(
                            "rounded-lg bg-muted flex items-center justify-center overflow-hidden",
                            compact ? "w-10 h-10" : "w-12 h-12"
                        )}>
                            <Image
                                src={agent.agencyLogo}
                                alt={agent.agencyName || agent.name}
                                width={compact ? 40 : 48}
                                height={compact ? 40 : 48}
                                className="object-contain"
                            />
                        </div>
                    ) : agent.avatar ? (
                        <Image
                            src={agent.avatar}
                            alt={agent.name}
                            width={compact ? 40 : 48}
                            height={compact ? 40 : 48}
                            className={cn("rounded-full object-cover", compact ? "w-10 h-10" : "w-12 h-12")}
                        />
                    ) : (
                        <div className={cn(
                            "rounded-full bg-primary/10 flex items-center justify-center",
                            compact ? "w-10 h-10" : "w-12 h-12"
                        )}>
                            {isAgency ? (
                                <Building2 className={cn("text-primary", compact ? "w-5 h-5" : "w-6 h-6")} />
                            ) : (
                                <span className={cn("font-semibold text-primary", compact ? "text-base" : "text-lg")}>
                                    {agent.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {/* Agency name */}
                    {isAgency && agent.agencyName && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {t('agency') || 'Агентство'}
                        </p>
                    )}
                    
                    {/* Name */}
                    <Link
                        href={`/agency/${agent.id}`}
                        className={cn("font-semibold text-foreground truncate hover:text-brand-primary transition-colors block", compact && "text-sm")}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isAgency ? agent.agencyName || agent.name : agent.name}
                    </Link>

                    {/* Compact stats/badges */}
                    {compact ? (
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            {agent.isVerified && (
                                <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t('verified')}
                                </span>
                            )}
                            {agent.objectsCount && (
                                <span>{agent.objectsCount} объед.</span>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-1">
                                {agent.isSuperAgent && (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                        <Star className="w-3 h-3 fill-current" />
                                        {t('superAgent')}
                                    </span>
                                )}
                                {agent.isVerified && (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {t('verified')}
                                    </span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                {agent.yearsOnPlatform && (
                                    <span>{t('yearsOnPlatform', { years: agent.yearsOnPlatform })}</span>
                                )}
                                {agent.objectsCount && (
                                    <span>{t('objectsCount', { count: agent.objectsCount })}</span>
                                )}
                            </div>

                            {/* Online status */}
                            {agent.showOnline && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                        Online
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Action buttons - Desktop only (hidden if compact, or handled by parent) */}
            {!compact && (
                <div className="hidden md:flex gap-2">
                    <button
                        onClick={onCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90"
                    >
                        <Phone className="w-4 h-4" />
                        {t('call')}
                    </button>
                    <button
                        onClick={onMessage}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-medium transition-colors hover:bg-muted"
                    >
                        <MessageCircle className="w-4 h-4" />
                        {t('message')}
                    </button>
                </div>
            )}
        </div>
    );
}
