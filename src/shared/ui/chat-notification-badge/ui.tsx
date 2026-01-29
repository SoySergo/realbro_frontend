'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface ChatNotificationBadgeProps {
    count: number;
    className?: string;
    showPulse?: boolean;
}

/**
 * Animated notification badge for chat icons
 * Shows count with pulse animation on new messages
 */
export function ChatNotificationBadge({
    count,
    className,
    showPulse = true,
}: ChatNotificationBadgeProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const prevCountRef = useRef(count);

    // Trigger animation when count increases
    useEffect(() => {
        if (count > prevCountRef.current) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 600);
            prevCountRef.current = count;
            return () => clearTimeout(timer);
        }
        prevCountRef.current = count;
    }, [count]);

    if (count <= 0) return null;

    const displayCount = count > 99 ? '99+' : count;

    return (
        <span
            className={cn(
                'inline-flex items-center justify-center',
                'min-w-[18px] h-[18px] px-1',
                'text-[10px] font-bold text-white',
                'bg-red-500 rounded-full',
                'transition-transform duration-200',
                isAnimating && showPulse && 'scale-125',
                className
            )}
        >
            {displayCount}
        </span>
    );
}

