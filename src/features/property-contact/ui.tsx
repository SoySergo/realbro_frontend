'use client';


import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Phone, MessageCircle, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';

interface PropertyContactBarProps {
    phone?: string;
    onCall?: () => void;
    onMessage?: () => void;
    onLike?: () => void;
    onDislike?: () => void;
    onMore?: () => void;
    className?: string;
    variant?: 'default' | 'sticky';
}

export function PropertyContactBar({
    phone,
    onCall,
    onMessage,
    onLike,
    onDislike,
    onMore,
    className,
    variant = 'default'
}: PropertyContactBarProps) {
    const t = useTranslations('propertyDetail');

    const handleCall = () => {
        if (onCall) {
            onCall();
        } else if (phone) {
            window.location.href = `tel:${phone}`;
        }
    };

    const handleMessage = () => {
        if (onMessage) {
            onMessage();
        }
    };

    if (variant === 'sticky') {
        return (
            <div className={cn(
                'fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border p-3 safe-area-pb md:hidden',
                className
            )}>
                <div className="flex gap-3 max-w-lg mx-auto">
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-semibold transition-all hover:bg-brand-primary-hover active:scale-[0.98] shadow-sm"
                    >
                        {/* <Phone className="w-5 h-5" /> Icon might be optional if text is 'Contact' but usually good. User didn't specify removing icon. */}
                        {t('contact')}
                    </button>
                    
                    <div className="flex items-center gap-2">
                         <button
                            onClick={onLike}
                            className="w-[48px] h-[48px] flex items-center justify-center rounded-xl bg-background border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
                            aria-label={t('like')}
                        >
                            <ThumbsUp className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onDislike}
                            className="w-[48px] h-[48px] flex items-center justify-center rounded-xl bg-background border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
                            aria-label={t('dislike')}
                        >
                            <ThumbsDown className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onMore}
                            className="w-[48px] h-[48px] flex items-center justify-center rounded-xl bg-background border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
                            aria-label={t('showMore')} // Assuming generic translation or just 'More'
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <button
                onClick={handleCall}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-semibold transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
            >
                <Phone className="w-5 h-5" />
                {t('call')}
            </button>
            <button
                onClick={handleMessage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-brand-primary bg-background text-brand-primary font-semibold transition-all hover:bg-brand-primary-light active:scale-[0.98]"
            >
                <MessageCircle className="w-5 h-5" />
                {t('message')}
            </button>
        </div>
    );
}

