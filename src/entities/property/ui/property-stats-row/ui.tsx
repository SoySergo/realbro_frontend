'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { 
    Square, 
    Home, 
    ChefHat, 
    Building2, 
    Bed,
    Bath
} from 'lucide-react';

interface PropertyStatsRowProps {
    area: number;
    livingArea?: number;
    kitchenArea?: number;
    rooms?: number;
    floor?: number;
    totalFloors?: number;
    bathrooms?: number;
    className?: string;
}

export function PropertyStatsRow({
    area,
    livingArea,
    kitchenArea,
    rooms,
    floor,
    totalFloors,
    bathrooms,
    className
}: PropertyStatsRowProps) {
    const t = useTranslations('propertyDetail');

    const stats = [
        {
            icon: Square,
            value: `${area}`,
            unit: t('sqm'),
            label: 'area',
            show: true
        },
        {
            icon: Home,
            value: livingArea ? `${livingArea}` : null,
            unit: t('sqm'),
            sublabel: t('livingArea'),
            show: !!livingArea
        },
        {
            icon: ChefHat,
            value: kitchenArea ? `${kitchenArea}` : null,
            unit: t('sqm'),
            sublabel: t('kitchenArea'),
            show: !!kitchenArea
        },
        {
            icon: Bed,
            value: rooms?.toString(),
            sublabel: t('rooms'),
            show: !!rooms
        },
        {
            icon: Building2,
            value: floor ? `${floor}` : null,
            sublabel: totalFloors ? `из ${totalFloors}` : t('floor'),
            show: !!floor
        },
        {
            icon: Bath,
            value: bathrooms?.toString(),
            sublabel: undefined,
            show: !!bathrooms
        }
    ].filter(stat => stat.show);

    return (
        <div className={cn('flex flex-wrap items-center gap-3 md:gap-4', className)}>
            {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    <stat.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                        {stat.value}
                        {stat.unit && <span className="text-muted-foreground ml-0.5">{stat.unit}</span>}
                    </span>
                    {stat.sublabel && (
                        <span className="text-xs text-muted-foreground">
                            {stat.sublabel}
                        </span>
                    )}
                    {index < stats.length - 1 && (
                        <span className="text-border ml-2 hidden md:inline">•</span>
                    )}
                </div>
            ))}
        </div>
    );
}
