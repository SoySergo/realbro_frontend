'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { CheckCircle2, Star, Building2 } from 'lucide-react';
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

    return (
        <div className={cn('relative', className)}>
            {/* Background Decoration (optional blue top) - Reference has blue background for the whole container 
                Wait, reference shows two separate cards. The top one is white. The bottom one (agent) has a light blue header?
                Actually, looking closer at the reference:
                The bottom card has a light blue background for the top ~30% and white for the rest.
            */}
            <Card className="overflow-hidden border-0 shadow-sm">
                {/* Header Background - Modified to vertical fade for distinction */}
                <div className="h-28 bg-linear-to-b from-brand-primary-light/80 to-transparent dark:from-brand-primary/20 dark:to-transparent w-full absolute top-0 left-0 z-0"></div>

                <div className="relative z-10 px-5 pt-8 text-center space-y-3">
                    {/* Agency/Agent Logo/Avatar (Centered and large) */}
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
                            {isAgency ? (t('agency') || 'Агентство недвижимости') : (t('privateAgent') || 'Частное лицо')}
                        </p>
                        <Link href={`/agency/${agent.id}`} className="text-xl font-bold text-foreground hover:text-brand-primary transition-colors">
                            {isAgency ? agent.agencyName : agent.name}
                        </Link>
                    </div>

                    {/* Stats Bar - Simplified */}
                    <div className="bg-muted/30 rounded-lg px-3 flex justify-center items-center">
                        <div className="text-center">
                             <p className="text-xs text-muted-foreground">{t('objectsInWork') || 'Объектов в работе'}</p>
                             <p className="font-bold text-foreground text-lg leading-tight">
                                {agent.objectsCount || 0}
                            </p>
                        </div>
                    </div>

                    {/* Agent Profile (Small row at bottom) */}
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
                             <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('agent') || 'Агент'}</p>
                             <p className="font-medium text-sm text-foreground leading-tight">{agent.name}</p>
                             <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-sm font-bold text-foreground">5.0</span>
                                <Star className="w-3.5 h-3.5 text-brand-primary fill-current" />
                                <span className="text-xs text-muted-foreground">{t('reviews') || 'отзыва'}: 2</span>
                             </div>
                         </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
