'use client';

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollWithFadeProps {
    children: React.ReactNode;
    className?: string; // Applied to the scroll container wrapper usually, or top level? Let's apply to top level for layout.
    scrollAmount?: number;
    hideButtons?: boolean;
}

export function HorizontalScrollWithFade({ 
    children, 
    className, 
    scrollAmount = 300,
    hideButtons = false,
}: HorizontalScrollWithFadeProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            // Use Math.ceil/floor to handle fractional pixel values from browser scaling
            setCanScrollLeft(Math.ceil(scrollLeft) > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        
        const observer = new MutationObserver(checkScroll);
        if (scrollContainerRef.current) {
            observer.observe(scrollContainerRef.current, { childList: true, subtree: true });
        }
        
        return () => {
            window.removeEventListener('resize', checkScroll);
            observer.disconnect();
        };
    }, [children]);

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className={cn("flex items-center", className)}>
            
            {/* Left Button (Desktop: Static, Outside) */}
            {!hideButtons && (
                <button
                    onClick={handleScrollLeft}
                    disabled={!canScrollLeft}
                    className="hidden sm:flex shrink-0 w-8 h-8 mr-1 items-center justify-center rounded-full bg-background border border-border transition-all text-foreground hover:bg-muted disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent disabled:cursor-not-allowed"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}

            {/* Scroll Area Wrapper */}
            <div className="relative flex-1 min-w-0">
                {/* Scroll Container */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="overflow-x-auto scrollbar-none flex transition-all duration-300 rounded-xl snap-x snap-mandatory py-4 -my-4 px-0"
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none'
                    }}
                >
                    {children}
                </div>
            </div>
            
            {/* Right Button (Desktop: Static, Outside) */}
            {!hideButtons && (
                <button
                    onClick={handleScrollRight}
                    disabled={!canScrollRight}
                    className="hidden sm:flex shrink-0 w-8 h-8 ml-1 items-center justify-center rounded-full bg-background border border-border transition-all text-foreground hover:bg-muted disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent disabled:cursor-not-allowed"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
