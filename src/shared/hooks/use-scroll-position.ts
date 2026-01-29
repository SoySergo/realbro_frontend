'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollPositionOptions {
    threshold?: number; // Distance from bottom to consider "at bottom" (default 100px)
    debounceMs?: number;
}

interface UseScrollPositionReturn {
    isAtBottom: boolean;
    scrollToBottom: (smooth?: boolean) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook to track scroll position and provide scroll-to-bottom functionality
 * Used for chat-like interfaces with "new message" indicators
 */
export function useScrollPosition(options: UseScrollPositionOptions = {}): UseScrollPositionReturn {
    const { threshold = 100, debounceMs = 50 } = options;
    
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const checkScrollPosition = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setIsAtBottom(distanceFromBottom <= threshold);
    }, [threshold]);

    const debouncedCheck = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(checkScrollPosition, debounceMs);
    }, [checkScrollPosition, debounceMs]);

    const scrollToBottom = useCallback((smooth = true) => {
        const container = containerRef.current;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto',
        });
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', debouncedCheck, { passive: true });
        
        // Initial check
        checkScrollPosition();

        return () => {
            container.removeEventListener('scroll', debouncedCheck);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [debouncedCheck, checkScrollPosition]);

    return {
        isAtBottom,
        scrollToBottom,
        containerRef,
    };
}
