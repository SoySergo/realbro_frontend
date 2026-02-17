'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import type { AttributeDTO } from '@/entities/property/model/api-types';
import { DynamicIcon } from '@/shared/ui/dynamic-icon';
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
    amenitiesDto?: AttributeDTO[];  // Атрибуты из бекенда
    maxVisible?: number;
    className?: string;
    translations?: AmenitiesTranslations;
}

export function PropertyAmenitiesGrid({
    amenities,
    amenitiesDto,
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

    if (!amenities.length && (!amenitiesDto || !amenitiesDto.length)) return null;

    const useDto = amenitiesDto && amenitiesDto.length > 0;
    const totalItems = useDto ? amenitiesDto.length : amenities.length;
    const visibleAmenities = isExpanded ? amenities : amenities.slice(0, maxVisible);
    const actualHiddenCount = totalItems - maxVisible;

    return (
        <div className={cn('flex flex-col gap-4 bg-secondary rounded-2xl p-6', className)}>
            <h3 className="font-semibold text-foreground text-lg">
                {t.title}
            </h3>

            {/* SEO: Amenities list is rendered immediately for indexing */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {useDto ? (
                    // Рендер из бекенд AttributeDTO[] через DynamicIcon
                    (isExpanded ? amenitiesDto : amenitiesDto.slice(0, maxVisible)).map((attr, index) => (
                        <div key={`${attr.value}-${index}`} className="flex items-center gap-2 text-sm">
                            <DynamicIcon name={attr.icon_type} size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-foreground truncate">{attr.label}</span>
                        </div>
                    ))
                ) : (
                    // Legacy рендер из string[] с поиском иконки по ключу
                    visibleAmenities.map((amenity, index) => {
                        const Icon = Object.entries(amenityIcons)
                            .sort((a, b) => b[0].length - a[0].length)
                            .find(([key]) => amenity.toLowerCase().includes(key.toLowerCase()))?.[1] || Home;

                        let displayName: string;
                        if (t.items[amenity]) {
                            displayName = t.items[amenity];
                        } else {
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
                    })
                )}
            </div>

            {/* Show more button */}
            {actualHiddenCount > 0 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                    <span>
                        {isExpanded
                            ? t.showLess
                            : `${t.showAllAmenities} (+${actualHiddenCount})`
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
