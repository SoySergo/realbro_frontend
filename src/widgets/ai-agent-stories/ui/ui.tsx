'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, SearchCheckIcon } from 'lucide-react';
import type { PropertyGridCard } from '@/entities/property/model/card-types';
import { getImageUrl } from '@/entities/property/model/card-types';
import { safeImageSrc } from '@/shared/lib/utils';

// ===== AI Story Mini Card =====

function AiStoryCard({ property }: { property: PropertyGridCard }) {
    const formatPrice = (price: number): string => {
        if (price >= 1000) {
            return Math.round(price / 1000) + 'k \u20ac';
        }
        return price.toLocaleString('ru-RU') + ' \u20ac';
    };

    return (
        <div className="flex-shrink-0 w-[160px] cursor-pointer group/story">
            <div className="relative w-[160px] h-[200px] rounded-xl overflow-hidden transition-all">
                <Image
                    src={
                        property.images[0]
                            ? safeImageSrc(getImageUrl(property.images[0]))
                            : '/placeholder-property.jpg'
                    }
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent" />

                {/* Price badge */}
                <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-bold truncate">
                        {formatPrice(property.price)}
                    </p>
                    <p className="text-white/80 text-[10px] truncate">
                        {property.rooms} komn. · {property.area} m²
                    </p>
                    <p className="text-white/60 text-[10px] truncate">{property.address}</p>
                </div>

                {/* NEW badge */}
                <div className="absolute top-2 left-2">
                    <span className="bg-brand-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        NEW
                    </span>
                </div>
            </div>
        </div>
    );
}

// ===== AI Agent Stories Block =====

interface AiAgentStoriesProps {
    properties: PropertyGridCard[];
}

export function AiAgentStories({ properties }: AiAgentStoriesProps) {
    const tListing = useTranslations('listing');
    const scrollRef = useRef<HTMLDivElement>(null);

    if (properties.length === 0) return null;

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
    };

    return (
        <div className="px-3 md:px-6 py-4 border-b border-border">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
                <SearchCheckIcon className="w-5 h-5 text-brand-primary" />
                <h2 className="text-base font-semibold text-text-primary">
                    {tListing('aiStoriesTitle')}
                </h2>
            </div>
            <p className="text-xs text-text-secondary mb-3">
                {tListing('aiStoriesSubtitle')}
            </p>

            {/* Stories carousel */}
            <div className="relative group">
                {/* Scroll left - only on desktop */}
                <button
                    onClick={scrollLeft}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 border border-border rounded-full items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                    {properties.map((property) => (
                        <AiStoryCard key={property.id} property={property} />
                    ))}
                </div>

                {/* Scroll right - only on desktop */}
                <button
                    onClick={scrollRight}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 border border-border rounded-full items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
