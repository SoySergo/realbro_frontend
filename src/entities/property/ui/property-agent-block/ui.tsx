'use client';

import { cn } from '@/shared/lib/utils';
import { PropertyAuthor } from '../../model/types';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Link } from '@/shared/config/routing';
import { Button } from '@/shared/ui/button';

export interface PropertyAgentBlockTranslations {
    agency: string;
    realtor: string;
    reviews: string;
    showPhone: string;
    sendMessage: string;
}

interface PropertyAgentBlockProps {
    agent: PropertyAuthor;
    translations: PropertyAgentBlockTranslations;
    className?: string;
    onCall?: () => void;
    onMessage?: () => void;
}

export function PropertyAgentBlock({
    agent,
    translations,
    className,
    onCall,
    onMessage
}: PropertyAgentBlockProps) {
    const t = translations;

    // Determine the role text
    const roleText = agent.type === 'agency' ? t.agency : t.realtor;

    const agencyText = agent.agencyName ? ` · ${agent.agencyName}` : '';
    const headerText = `${roleText}${agencyText}`;

    return (
        <div className={cn("w-full rounded-2xl border border-border bg-card overflow-hidden text-center", className)}>
            {/* Header with gradient */}
            <div className="h-24 w-full bg-linear-to-b from-brand-primary-light/80 to-transparent dark:from-brand-primary/20 dark:to-transparent relative">
                {/* Optional: Add some subtle pattern or texture if needed */}
            </div>

            {/* Avatar Section - Pull up overlapping the header */}
            <div className="relative -mt-12 mb-4 flex justify-center">
                <div className="relative">
                    {/* Main Avatar */}
                    <div className="h-24 w-24 rounded-full border-4 border-card bg-card overflow-hidden relative shadow-xs">
                        {agent.avatar ? (
                            <Image
                                src={agent.avatar}
                                alt={agent.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                {agent.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Agency Logo Badge (if exists) */}
                    {(agent.agencyLogo || agent.type === 'agency') && (
                        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-0 shadow-sm">
                            <div className="h-9 w-9 rounded-lg border-2 border-card bg-card flex items-center justify-center overflow-hidden">
                                {agent.agencyLogo ? (
                                    <Image
                                        src={agent.agencyLogo}
                                        alt={agent.agencyName || 'Agency'}
                                        width={32}
                                        height={32}
                                        className="object-contain p-0.5"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-primary">A</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 space-y-5">

                {/* Name & Role */}
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                        {headerText}
                    </p>
                    <Link href={`/agency/${agent.slug || agent.id}`} className="text-xl font-bold text-foreground hover:text-brand-primary transition-colors">
                        {agent.name}
                    </Link>
                </div>

                {/* Rating & Verification */}
                <div className="flex items-center justify-center gap-4 text-sm">
                    {/* Rating placeholder (mock if not in data) */}
                    <div className="flex items-center gap-1.5 font-medium">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span>5,0</span>
                        <span className="text-muted-foreground mx-1">·</span>
                        <span className="text-muted-foreground">2 {t.reviews}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center max-w-md mx-auto pt-2">
                    <Button
                        onClick={onCall}
                        className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white h-11 px-6 rounded-xl font-medium shadow-sm shadow-brand-primary/10"
                    >
                        {t.showPhone}
                    </Button>
                    <Button
                        onClick={onMessage}
                        variant="secondary"
                        className="flex-1 bg-brand-primary-light text-brand-primary hover:bg-brand-primary-light/80 dark:bg-brand-primary/20 dark:text-brand-primary dark:hover:bg-brand-primary/30 h-11 px-6 rounded-xl font-medium border-0"
                    >
                        {t.sendMessage}
                    </Button>
                </div>

            </div>
        </div>
    );
}
