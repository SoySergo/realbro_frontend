'use client';

import React, { useRef, useState } from 'react';
import { 
    MapPin, Bed, Bath, Maximize, Train, Bus, 
    ChevronLeft, ChevronRight, Wifi, Snowflake, 
    Car, Sofa, Dumbbell, Waves, Trees
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import type { Property, PropertyFeature } from '@/entities/property';

interface PropertyOpenCardProps {
    property: Property;
    filterName?: string;
    actions?: React.ReactNode;
    className?: string;
    isNew?: boolean;
}

const featureIcons: Partial<Record<PropertyFeature, React.ElementType>> = {
    airConditioning: Snowflake,
    parking: Car,
    furnished: Sofa,
    elevator: Dumbbell,
    pool: Waves,
    garden: Trees,
};

const featureLabels: Partial<Record<PropertyFeature, string>> = {
    airConditioning: 'Кондиционер',
    parking: 'Парковка',
    furnished: 'Мебель',
    elevator: 'Лифт',
    pool: 'Бассейн',
    garden: 'Сад',
    balcony: 'Балкон',
    terrace: 'Терраса',
};

/**
 * Open property card with full-bleed photo carousel for AI agent chat
 * Layout: Full width, no borders, scattered aesthetic
 * Memoized to prevent re-renders when sibling messages change
 */
export const PropertyOpenCard = React.memo(function PropertyOpenCard({
    property,
    filterName,
    actions,
    className,
    isNew = false,
}: PropertyOpenCardProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = property.images || [];

    const scrollImages = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        
        const imageWidth = el.clientWidth * 0.85; // 85% width per image
        const scrollAmount = direction === 'left' ? -imageWidth : imageWidth;
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        
        // Update index based on scroll position - approximate
        setTimeout(() => handleScroll(), 300);
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        
        // Simple logic to find center-most image
        const center = el.scrollLeft + (el.clientWidth / 2);
        const children = Array.from(el.children) as HTMLElement[];
        
        let closestIndex = 0;
        let minDist = Infinity;
        
        children.forEach((child, index) => {
            const childCenter = child.offsetLeft + (child.offsetWidth / 2);
            const dist = Math.abs(center - childCenter);
            if (dist < minDist) {
                minDist = dist;
                closestIndex = index;
            }
        });
        
        setCurrentImageIndex(closestIndex);
    };

    const TransportIcon = property.nearbyTransport?.type === 'bus' ? Bus : Train;
    const displayFeatures = property.features?.slice(0, 6) || [];

    return (
        <div
            className={cn(
                'w-full max-w-none relative animate-message-slide-in mb-6',
                className
            )}
        >
            {/* Full-bleed Photo Carousel */}
            <div className="relative -mx-3 md:-mx-4 mb-3 group">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory touch-pan-x px-3 md:px-4 py-2"
                >
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative shrink-0 snap-center rounded-2xl overflow-hidden aspect-4/3 shadow-sm",
                                "w-[85vw] md:w-[320px]" 
                            )}
                        >
                            <img
                                src={image}
                                alt={`${property.title} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            
                            {/* NEW badge on first image */}
                            {index === 0 && (isNew || property.isNew) && (
                                <Badge variant="primary" className="absolute top-3 left-3 shadow-lg">
                                    NEW
                                </Badge>
                            )}
                            
                            {/* Image counter overlay */}
                            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-medium px-2 py-1 rounded-full">
                                {index + 1}/{images.length}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => scrollImages('left')}
                            disabled={currentImageIndex === 0}
                            className={cn(
                                'hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10',
                                'w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50',
                                'items-center justify-center shadow-md',
                                'transition-all hover:bg-background hover:scale-105 opacity-0 group-hover:opacity-100',
                                currentImageIndex === 0 && 'opacity-0 cursor-not-allowed pointer-events-none'
                            )}
                        >
                            <ChevronLeft className="w-5 h-5 text-text-primary" />
                        </button>
                        <button
                            onClick={() => scrollImages('right')}
                            disabled={currentImageIndex === images.length - 1}
                            className={cn(
                                'hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10',
                                'w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/50',
                                'items-center justify-center shadow-md',
                                'transition-all hover:bg-background hover:scale-105 opacity-0 group-hover:opacity-100',
                                currentImageIndex === images.length - 1 && 'opacity-0 cursor-not-allowed pointer-events-none'
                            )}
                        >
                            <ChevronRight className="w-5 h-5 text-text-primary" />
                        </button>
                    </>
                )}
            </div>

            {/* Content - "Scattered" look but constrained on desktop */}
            <div className="px-1 md:px-0 space-y-3 max-w-3xl">
                {/* 1. Title & Address */}
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-start justify-between">
                         <h3 className="text-base md:text-lg font-medium text-text-primary leading-tight">
                             {property.title}
                         </h3>
                         {filterName && (
                             <div className="text-[10px] font-semibold text-brand-primary uppercase tracking-wide bg-brand-secondary/10 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                 {filterName}
                             </div>
                         )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-text-secondary">
                        <MapPin className="w-3.5 h-3.5" />
                        {property.address}
                    </div>
                </div>

                {/* 2. Price Section (Below Title/Address) */}
                <div className="flex items-baseline gap-2">
                     <div className="text-2xl font-bold text-text-primary">
                         {property.price.toLocaleString()} €
                     </div>
                     {property.pricePerMeter && (
                        <div className="text-sm text-text-tertiary">
                            {property.pricePerMeter} €/m²
                        </div>
                     )}
                </div>

                {/* 3. Key Stats Row - Minimalist (No separators) */}
                <div className="flex items-center gap-6 py-1">
                    <div className="flex items-center gap-2">
                        <Maximize className="w-4 h-4 text-text-tertiary" />
                        <span className="text-sm font-medium text-text-secondary">{property.area} m²</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Bed className="w-4 h-4 text-text-tertiary" />
                         <span className="text-sm font-medium text-text-secondary">{property.bedrooms} спальни</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Bath className="w-4 h-4 text-text-tertiary" />
                         <span className="text-sm font-medium text-text-secondary">{property.bathrooms} ванные</span>
                    </div>
                </div>

                {/* 4. Tags / Amenities */}
                <div className="flex flex-wrap gap-1.5">
                    {displayFeatures.map((feature) => {
                        const Icon = featureIcons[feature] || Wifi;
                        const label = featureLabels[feature] || feature.replace(/([A-Z])/g, ' $1').trim();
                        return (
                            <div 
                                key={feature} 
                                className="flex items-center gap-1 text-[10px] md:text-xs text-text-secondary bg-background-secondary/40 px-2.5 py-1.5 rounded-lg"
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0 text-text-tertiary" />
                                <span className="capitalize">{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* 5. Description */}
                {property.description && (
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed text-justify line-clamp-3">
                        {property.description}
                    </p>
                )}

                {/* 6. Actions (Aligned Left & Larger) */}
                {actions && (
                    <div className="flex justify-start pt-2 [&>div]:scale-110 origin-left">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
});
