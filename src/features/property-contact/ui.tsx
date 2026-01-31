'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Phone, MessageCircle } from 'lucide-react';

interface PropertyContactBarProps {
    phone?: string;
    onCall?: () => void;
    onMessage?: () => void;
    className?: string;
    variant?: 'default' | 'sticky';
}

export function PropertyContactBar({
    phone,
    onCall,
    onMessage,
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
                'fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-3 safe-area-pb md:hidden',
                className
            )}>
                <div className="flex gap-2 max-w-lg mx-auto">
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold transition-all hover:bg-blue-700 active:scale-[0.98]"
                    >
                        <Phone className="w-5 h-5" />
                        {t('call')}
                    </button>
                    <button
                        onClick={handleMessage}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-600 bg-background text-blue-600 font-semibold transition-all hover:bg-blue-50 active:scale-[0.98]"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {t('message')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <button
                onClick={handleCall}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
                <Phone className="w-5 h-5" />
                {t('call')}
            </button>
            <button
                onClick={handleMessage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-600 bg-background text-blue-600 font-semibold transition-all hover:bg-blue-50 active:scale-[0.98]"
            >
                <MessageCircle className="w-5 h-5" />
                {t('message')}
            </button>
        </div>
    );
}
