'use client';

import { useTranslations } from 'next-intl';
import { 
    Maximize2, 
    Armchair, 
    Utensils, 
    Layers, 
    CalendarClock, 
    Wallet, 
    Bath, 
    ChevronsUp,
    Bed
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Property } from '@/entities/property/model/types';

interface PropertyMainInfoProps {
    property: Property;
    className?: string;
}

export function PropertyMainInfo({
    property,
    className
}: PropertyMainInfoProps) {
    const t = useTranslations('propertyDetail');

    // Helper to format currency
    const formatPrice = (price?: number) => {
        if (!price) return '';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Helper for rental term
    const getRentalTerm = () => {
        if (!property.rentalConditions?.minRentalMonths) return null;
        const months = property.rentalConditions.minRentalMonths;
        return t('minRentalPeriod', { months });
    };

    const stats = [

        {
            id: 'rooms',
            icon: Bed,
            value: property.rooms,
            label: t('rooms'),
            show: !!property.rooms  
        },
        {
            id: 'area',
            icon: Maximize2,
            value: `${property.area} м²`,
            label: t('area'),
            show: !!property.area
        },
        {
            id: 'livingArea',
            icon: Armchair,
            value: property.livingArea ? `${property.livingArea} м²` : null,
            label: t('livingArea'),
            show: !!property.livingArea
        },
        {
            id: 'kitchenArea',
            icon: Utensils,
            value: property.kitchenArea ? `${property.kitchenArea} м²` : null,
            label: t('kitchenArea'),
            show: !!property.kitchenArea
        },
        {
            id: 'floor',
            icon: Layers,
            value: property.floor ? `${property.floor} из ${property.totalFloors || '?'}` : null,
            label: t('floor'),
            show: !!property.floor
        },
        {
            id: 'term',
            icon: CalendarClock,
            value: getRentalTerm(),
            label: t('term'),
            show: !!property.rentalConditions?.minRentalMonths
        },
        {
            id: 'deposit',
            icon: Wallet,
            value: property.rentalConditions?.deposit ? formatPrice(property.rentalConditions.deposit) : null,
            label: t('deposit'),
            show: !!property.rentalConditions?.deposit
        },
        {
            id: 'bathrooms',
            icon: Bath,
            value: property.bathrooms,
            label: t('bathrooms'),
            show: !!property.bathrooms
        },
        {
            id: 'elevator',
            icon: ChevronsUp,
            value: t(property.elevator ? 'yes' : 'no'),
            label: t('elevator'),
            show: !!property.elevator
        }
    ];

    // Select top 6 available items
    const displayStats = stats.filter(s => s.show && s.value).slice(0, 6);

    return (
        <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 py-6', className)}>
            {displayStats.map((stat) => (
                <div key={stat.id} className="flex items-center gap-4">
                    <div className="shrink-0 text-muted-foreground/70">
                        <stat.icon size={28} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                         <span className="text-sm text-muted-foreground leading-tight">
                            {stat.label}
                        </span>
                        <span className="text-lg font-bold text-foreground leading-tight">
                            {stat.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
