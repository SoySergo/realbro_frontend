
'use client';

import { useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { Property } from '../../model/types';
import { PropertyCardGrid } from '../property-card-grid'; // Use the grid card variant
import { HorizontalScroll } from '@/shared/ui/horizontal-scroll/ui'; // Adjust path if needed
import { Button } from '@/shared/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyListSectionProps {
    title: string;
    subtitle?: string;
    properties: Property[];
    className?: string;
    onViewAll?: () => void;
    viewAllText?: string;
    action?: React.ReactNode;
}

export function PropertyListSection({
    title,
    subtitle,
    properties,
    className,
    onViewAll,
    viewAllText = "Смотреть все",
    action
}: PropertyListSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!properties.length) return null;

    return (
        <section className={cn("py-12", className)}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                    
                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {action}
                        {onViewAll && (
                            <Button variant="ghost" className="gap-2" onClick={onViewAll}>
                                {viewAllText}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                        {/* Custom Navigation Buttons for Horizontal Scroll if we want them outside */}
                    </div>
                </div>

                <HorizontalScroll
                    className="gap-4 py-2"
                    itemClassName="min-w-[300px] max-w-[300px]" // Fixed width for cards in list
                >
                    {properties.map((property, index) => (
                        <div key={`${property.id}-${index}`} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] snap-start">
                           <PropertyCardGrid 
                               property={property}
                               onClick={() => console.log('Click property', property.id)}
                           />
                        </div>
                    ))}
                </HorizontalScroll>

                 {/* Mobile View All */}
                 {onViewAll && (
                    <div className="mt-4 md:hidden">
                        <Button variant="outline" className="w-full" onClick={onViewAll}>
                            {viewAllText}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
