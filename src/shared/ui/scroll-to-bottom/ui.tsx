'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ScrollToBottomButtonProps {
    show: boolean;
    newMessageCount?: number;
    onClick: () => void;
    className?: string;
}

/**
 * Telegram-style floating button to scroll to bottom of chat
 * Features: gradient background, animated chevron, badge with count
 */
export function ScrollToBottomButton({
    show,
    newMessageCount = 0,
    onClick,
    className,
}: ScrollToBottomButtonProps) {
    if (!show) return null;

    return (
        <button
            onClick={onClick}
            className={cn(
                'absolute bottom-4 right-4 z-10',
                'w-11 h-11 rounded-full',
                // Telegram-style gradient
                'bg-linear-to-br from-brand-primary to-brand-primary/80',
                'shadow-lg shadow-brand-primary/25',
                'flex items-center justify-center',
                'transition-all duration-300 ease-out',
                'hover:scale-110 hover:shadow-xl hover:shadow-brand-primary/30',
                'active:scale-95',
                'animate-fade-in',
                className
            )}
            aria-label="Scroll to bottom"
        >
            {/* Double chevron with subtle bounce animation */}
            <div className="relative flex flex-col items-center justify-center -space-y-2.5 animate-[bounce_2s_ease-in-out_infinite]">
                <ChevronDown className="w-4 h-4 text-white/60" />
                <ChevronDown className="w-5 h-5 text-white" />
            </div>
            
            {/* Badge with count */}
            {newMessageCount > 0 && (
                <div className={cn(
                    'absolute -top-1.5 -right-1.5',
                    'min-w-[20px] h-5 px-1.5',
                    'flex items-center justify-center',
                    'bg-[#FF3B30] text-white',
                    'text-[11px] font-bold',
                    'rounded-full',
                    'shadow-md',
                    'animate-[pulse_2s_ease-in-out_infinite]'
                )}>
                    {newMessageCount > 99 ? '99+' : newMessageCount}
                </div>
            )}
        </button>
    );
}
