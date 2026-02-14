'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import type { PropertyChatCard } from '@/entities/property';

interface PropertyBatchCarouselProps {
    properties: PropertyChatCard[];
    batchLabel?: string;
    filterName?: string;
    viewedIds?: Set<string>;
    renderCard: (property: PropertyChatCard, index: number) => React.ReactNode;
    className?: string;
}

export function PropertyBatchCarousel({
    properties,
    batchLabel,
    filterName,
    viewedIds,
    renderCard,
    className,
}: PropertyBatchCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const viewedCount = viewedIds
        ? properties.filter((p) => viewedIds.has(p.id)).length
        : 0;

    const [scrollProgress, setScrollProgress] = useState(0);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

        // Update progress for slider
        const progress = (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));

        // Calculate current index based on scroll position
        const cardWidth = 292; // 280px card + 12px gap
        const index = Math.round(el.scrollLeft / cardWidth);
        setCurrentIndex(Math.min(index, properties.length - 1));
    }, [properties.length]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollState();
    }, [updateScrollState]);

    const scrollTo = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = 292;
        const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    return (
        <div className={cn('space-y-2', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm font-medium text-text-primary">
                        {batchLabel || `${properties.length} properties`}
                    </span>
                    {filterName && (
                        <Badge variant="secondary" className="text-[10px]">
                            {filterName}
                        </Badge>
                    )}
                </div>
                {viewedIds && (
                    <span className="text-xs text-text-tertiary">
                        {viewedCount}/{properties.length}
                    </span>
                )}
            </div>

            {/* Carousel */}
            <div className="relative group">
                {/* Left arrow - always visible on touch devices */}
                {canScrollLeft && (
                    <button
                        onClick={() => scrollTo('left')}
                        className={cn(
                            'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                            'w-8 h-8 rounded-full bg-background/90 border border-border',
                            'flex items-center justify-center shadow-md',
                            'opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity',
                            'hover:bg-background active:bg-background cursor-pointer'
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}

                {/* Scrollable container */}
                <div
                    ref={scrollRef}
                    onScroll={updateScrollState}
                    className={cn(
                        'flex gap-3 overflow-x-auto scrollbar-hide',
                        'scroll-smooth snap-x snap-mandatory',
                        'pb-2 touch-pan-x'
                    )}
                >
                    {properties.map((property, index) => (
                        <div
                            key={property.id}
                            className="snap-start shrink-0 w-[calc(100vw-3rem)] max-w-[280px]"
                        >
                            {renderCard(property, index)}
                        </div>
                    ))}
                </div>

                {/* Right arrow - always visible on touch devices */}
                {canScrollRight && (
                    <button
                        onClick={() => scrollTo('right')}
                        className={cn(
                            'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                            'w-8 h-8 rounded-full bg-background/90 border border-border',
                            'flex items-center justify-center shadow-md',
                            'opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity',
                            'hover:bg-background active:bg-background cursor-pointer'
                        )}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Progress Bar (Slider) */}
            {properties.length > 1 && (
                <div className="mx-1 h-1 bg-border/40 rounded-full mt-2 relative overflow-hidden">
                    <div 
                        className="absolute top-0 bottom-0 bg-brand-primary rounded-full transition-all duration-150"
                        style={{
                            left: `${scrollProgress}%`,
                            width: `${Math.max(10, (1 / properties.length) * 100)}%`,
                            transform: `translateX(-${scrollProgress}%)`
                        }}
                    />
                </div>
            )}
        </div>
    );
}
