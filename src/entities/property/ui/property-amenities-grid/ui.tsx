'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
    Wifi,
    Tv,
    Wind,
    Refrigerator,
    WashingMachine,
    Microwave,
    Coffee,
    Utensils,
    Bed,
    Sofa,
    Armchair,
    Lamp,
    Bath,
    ShowerHead,
    Lock,
    Fan,
    Heater,
    Smartphone,
    ParkingSquare,
    Warehouse,
    Trees,
    Dumbbell,
    Waves,
    Dog,
    Baby,
    Cigarette,
    Home,
    ChevronDown,
    ArrowsUpFromLineIcon
} from 'lucide-react';

// Map amenity keys to icons
const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    wifi: Wifi,
    internet: Wifi,
    tv: Tv,
    airConditioning: Wind,
    refrigerator: Refrigerator,
    washingMachine: WashingMachine,
    dishwasher: Utensils,
    microwave: Microwave,
    coffeeMachine: Coffee,
    kitchen: Utensils,
    kitchenEquipment: Utensils,
    bed: Bed,
    sofa: Sofa,
    furniture: Sofa,
    furnitureInRooms: Armchair,
    furnitureInKitchen: Lamp,
    bathtub: Bath,
    shower: ShowerHead,
    safe: Lock,
    ventilation: Fan,
    heating: Heater,
    intercom: Smartphone,
    parking: ParkingSquare,
    storage: Warehouse,
    balcony: Trees,
    terrace: Trees,
    garden: Trees,
    gym: Dumbbell,
    pool: Waves,
    petsAllowed: Dog,
    childFriendly: Baby,
    smokingAllowed: Cigarette,
    elevator: ArrowsUpFromLineIcon,
};

interface AmenitiesTranslations {
    title: string;
    showMore: string;
    showLess: string;
    showAllAmenities: string;
    items: Record<string, string>;
}

interface PropertyAmenitiesGridProps {
    amenities: string[];
    maxVisible?: number;
    className?: string;
    translations?: AmenitiesTranslations;
}

export function PropertyAmenitiesGrid({
    amenities,
    maxVisible = 8,
    className,
    translations
}: PropertyAmenitiesGridProps) {
    // Default translations for backwards compatibility
    const t = translations || {
        title: 'Amenities',
        showMore: 'Show more',
        showLess: 'Show less',
        showAllAmenities: 'Show all',
        items: {}
    };

    const [isExpanded, setIsExpanded] = useState(false);

    if (!amenities.length) return null;

    const visibleAmenities = isExpanded ? amenities : amenities.slice(0, maxVisible);
    const hiddenCount = amenities.length - maxVisible;

    return (
        <div className={cn('flex flex-col gap-4 bg-brand-primary/10 rounded-2xl p-6', className)}>
            <h3 className="font-semibold text-foreground text-lg">
                {t.title}
            </h3>

            {/* SEO: Amenities list is rendered immediately for indexing */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {visibleAmenities.map((amenity, index) => {
                    // Try to find icon for amenity
                    const Icon = Object.entries(amenityIcons)
                        .sort((a, b) => b[0].length - a[0].length)
                        .find(([key]) => amenity.toLowerCase().includes(key.toLowerCase()))?.[1] || Home;

                    // Get translated name from props or fallback
                    let displayName: string;
                    if (t.items[amenity]) {
                        displayName = t.items[amenity];
                    } else {
                        // Fallback: capitalize and split camelCase
                        displayName = amenity
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .trim();
                    }

                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                        >
                            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-foreground truncate">
                                {displayName}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Show more button */}
            {hiddenCount > 0 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                    <span>
                        {isExpanded
                            ? t.showLess
                            : `${t.showAllAmenities} (+${hiddenCount})`
                        }
                    </span>
                    <ChevronDown
                        className={cn(
                            'w-4 h-4 transition-transform',
                            isExpanded && 'rotate-180'
                        )}
                    />
                </button>
            )}
        </div>
    );
}
