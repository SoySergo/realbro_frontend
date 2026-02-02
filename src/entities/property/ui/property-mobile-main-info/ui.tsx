'use client';

import { useTranslations } from 'next-intl';
import { BarChart3, ChevronRight, TrendingDown, Maximize2, Armchair, Utensils, Layers, CalendarClock, Wallet, Bath, ChevronsUp, Bed } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { Property } from '@/entities/property/model/types';

interface PropertyMobileMainInfoProps {
    property: Property;
    className?: string;
}

export function PropertyMobileMainInfo({
    property,
    className
}: PropertyMobileMainInfoProps) {
    const t = useTranslations('propertyDetail');

    // Price formatting
    const formatPrice = (price?: number) => {
        if (!price) return '';
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    // Helper for rental term
    const getRentalTerm = () => {
        if (!property.rentalConditions?.minRentalMonths) return null;
        const months = property.rentalConditions.minRentalMonths;
        return t('minRentalPeriod', { months });
    };

    // Calculate proposed price (example: 3% lower)
    const examplePrice = property.price ? Math.floor(property.price * 0.97) : 0;
    const formattedExamplePrice = formatPrice(examplePrice);

    // Stats configuration (copied/adapted from PropertyMainInfo)
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
            value: `${property.area} ${t('sqm')}`,
            label: t('area'),
            show: !!property.area
        },
        {
            id: 'livingArea',
            icon: Armchair,
            value: property.livingArea ? `${property.livingArea} ${t('sqm')}` : null,
            label: t('livingArea'),
            show: !!property.livingArea
        },
        {
            id: 'kitchenArea',
            icon: Utensils,
            value: property.kitchenArea ? `${property.kitchenArea} ${t('sqm')}` : null,
            label: t('kitchenArea'),
            show: !!property.kitchenArea
        },
        {
            id: 'floor',
            icon: Layers,
            value: property.floor ? `${property.floor} ${t('of')} ${property.totalFloors || '?'}` : null,
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
        <div className={cn('bg-background pb-6', className)}>
            
            {/* Title - Smaller font requested */}
            <h1 className="text-base font-medium leading-tight mb-2 text-muted-foreground/90">
                {property.title}
            </h1>

            {/* Price section */}
            <div className="flex items-start justify-between mb-6 mt-1">
                <div className="flex items-center gap-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-[28px] font-bold leading-none text-foreground">
                            {formatPrice(property.price)} €
                        </span>
                        <span className="text-xl font-bold text-foreground">/{t('perMonth')}</span>
                    </div>
                    
                    {/* Price History / Stats Icon */}
                    <div className="relative bg-secondary p-1.5 rounded-lg ml-1">
                        <BarChart3 className="w-5 h-5 text-text-secondary" />
                        <div className="absolute -top-1 -right-1 bg-background rounded-full shadow-sm p-0.5">
                            <TrendingDown className="w-3 h-3 text-success" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Offer Price Block */}
            <div className="space-y-3 mb-8">
                <p className="font-medium text-[15px] text-foreground">
                    {t('offerYourPrice') || 'Предложите свою цену'}
                </p>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            placeholder={`${t('example') || 'Например'}, ${formattedExamplePrice} €`}
                            className="h-12 text-base rounded-xl border-border bg-background shadow-sm placeholder:text-text-tertiary"
                        />
                    </div>
                    <Button
                        size="icon"
                        className="h-12 w-12 rounded-xl bg-brand-primary-light hover:bg-brand-primary-light/80 text-brand-primary border-none shrink-0"
                    >
                        <ChevronRight className="w-6 h-6 stroke-[2.5px]" />
                    </Button>
                </div>
            </div>

            {/* Key Stats Grid - Flex Layout */}
            <div className="px-2 flex flex-wrap justify-between gap-y-6 w-full">
                 {displayStats.map((stat) => (
                    <div key={stat.id} className="w-[30%] flex flex-col gap-1 items-start">
                        <div className="flex items-center justify-start text-muted-foreground/70 mb-0.5">
                            <stat.icon size={26} strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-bold text-foreground leading-tight truncate w-full text-left">
                            {stat.value}
                        </span>
                        <span className="text-xs text-muted-foreground leading-tight truncate w-full text-left">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
