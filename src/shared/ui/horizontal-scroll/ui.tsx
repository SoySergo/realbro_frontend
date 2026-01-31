'use client';

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
    children: React.ReactNode;
    className?: string;
    itemClassName?: string; // Class for the wrapper of items if needed, or applied to children container
    scrollAmount?: number;
    hideButtons?: boolean;
    buttonClassName?: string;
    leftButtonWrapperClassName?: string;
    rightButtonWrapperClassName?: string;
    showMask?: boolean; // Show fade mask on edges
}

export function HorizontalScroll({ 
    children, 
    className, 
    scrollAmount = 300,
    hideButtons = false,
    buttonClassName,
    leftButtonWrapperClassName,
    rightButtonWrapperClassName,
    showMask = false,
    variant = 'overlay' // 'overlay' | 'static'
}: HorizontalScrollProps & { variant?: 'overlay' | 'static' }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const isOverlay = variant === 'overlay';
    const isStatic = variant === 'static';

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            // Use a small threshold (1px) for float calculation errors
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
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
        <div className={cn("relative group", isStatic && "flex items-center gap-1.5")}>
            {/* Scroll Left Button */}
            {!hideButtons && (
                <div 
                    className={cn(
                        "flex items-center justify-center transition-all duration-200",
                        isOverlay && "absolute left-0 top-0 bottom-0 z-20 py-5",
                        isOverlay && (!canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"),
                        leftButtonWrapperClassName
                    )}
                >
                    <button
                        onClick={handleScrollLeft}
                        disabled={isStatic && !canScrollLeft}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border shadow-sm transition-all text-foreground",
                            !isStatic && "hover:bg-muted",
                            isStatic && (canScrollLeft ? "hover:bg-muted cursor-pointer" : "opacity-30 cursor-not-allowed bg-muted/50 border-transparent"),
                            buttonClassName
                        )}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {isOverlay && showMask && <div className="absolute left-full top-0 bottom-0 w-8 bg-linear-to-r from-background to-transparent pointer-events-none" />}
                </div>
            )}

            <div 
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className={cn(
                    "overflow-x-auto scrollbar-none flex transition-all duration-300 rounded-xl snap-x snap-mandatory",
                    isStatic && "flex-1",
                    className
                )}
                style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none'
                }}
            >
                {children}
            </div>
            
            {/* Scroll Right Button */}
            {!hideButtons && (
                <div 
                    className={cn(
                        "flex items-center justify-center transition-all duration-200",
                        isOverlay && "absolute right-0 top-0 bottom-0 z-20 py-5 pl-2",
                        isOverlay && (!canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100"),
                        rightButtonWrapperClassName
                    )}
                >
                    {isOverlay && showMask && <div className="absolute right-full top-0 bottom-0 w-8 bg-linear-to-l from-background to-transparent pointer-events-none" />}
                    
                    <button
                        onClick={handleScrollRight}
                        disabled={isStatic && !canScrollRight}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border shadow-sm transition-all text-foreground",
                            !isStatic && "hover:bg-muted",
                            isStatic && (canScrollRight ? "hover:bg-muted cursor-pointer" : "opacity-30 cursor-not-allowed bg-muted/50 border-transparent"),
                            buttonClassName
                        )}
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
