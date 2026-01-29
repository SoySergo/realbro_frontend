'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Check, X, User, Users, Briefcase, Moon, Sun, Heart, Coffee } from 'lucide-react';
import type { Property } from '@/entities/property/model/types';

interface PropertyCharacteristicsProps {
    property: Property;
    className?: string;
}

export function PropertyCharacteristics({
    property,
    className
}: PropertyCharacteristicsProps) {
    const t = useTranslations('propertyDetail');
    const tChars = useTranslations('characteristics');

    // About the flat
    const flatCharacteristics = [
        {
            key: 'type',
            label: tChars('propertyType'),
            value: tChars(`types.${property.type}`),
            show: !!property.type
        },
        {
            key: 'area',
            label: tChars('totalArea'),
            value: `${property.area} ${t('sqm')}`,
            show: true
        },
        {
            key: 'livingArea',
            label: tChars('livingArea'),
            value: property.livingArea ? `${property.livingArea} ${t('sqm')}` : null,
            show: !!property.livingArea
        },
        {
            key: 'kitchenArea',
            label: tChars('kitchenArea'),
            value: property.kitchenArea ? `${property.kitchenArea} ${t('sqm')}` : null,
            show: !!property.kitchenArea
        },
        {
            key: 'rooms',
            label: tChars('rooms'),
            value: property.rooms?.toString(),
            show: !!property.rooms
        },
        {
            key: 'floor',
            label: tChars('floor'),
            value: property.floor 
                ? property.totalFloors 
                    ? `${property.floor} ${tChars('of')} ${property.totalFloors}`
                    : property.floor.toString()
                : null,
            show: !!property.floor
        },
        {
            key: 'ceilingHeight',
            label: tChars('ceilingHeight'),
            value: property.ceilingHeight ? `${property.ceilingHeight} м` : null,
            show: !!property.ceilingHeight
        },
        {
            key: 'bathroom',
            label: tChars('bathroom'),
            value: property.bathroomType ? tChars(`bathroomTypes.${property.bathroomType}`) : null,
            show: !!property.bathroomType
        },
        {
            key: 'balcony',
            label: tChars('balcony'),
            value: property.balconyCount 
                ? `${property.balconyCount}` 
                : property.loggia 
                    ? tChars('loggia') 
                    : null,
            show: !!(property.balconyCount || property.loggia)
        },
        {
            key: 'renovation',
            label: tChars('renovation'),
            value: property.renovation ? tChars(`renovationTypes.${property.renovation}`) : null,
            show: !!property.renovation
        },
        {
            key: 'windowView',
            label: tChars('windowView'),
            value: property.windowView ? tChars(`windowViews.${property.windowView}`) : null,
            show: !!property.windowView
        }
    ].filter(c => c.show && c.value);

    // About the building
    const buildingCharacteristics = property.building ? [
        {
            key: 'buildingName',
            label: tChars('residentialComplex'),
            value: property.building.name,
            show: !!property.building.name
        },
        {
            key: 'buildingType',
            label: tChars('buildingType'),
            value: property.building.type ? tChars(`buildingTypes.${property.building.type}`) : null,
            show: !!property.building.type
        },
        {
            key: 'buildingYear',
            label: tChars('buildingYear'),
            value: property.building.year?.toString(),
            show: !!property.building.year
        },
        {
            key: 'floorsTotal',
            label: tChars('floorsTotal'),
            value: property.building.floorsTotal?.toString(),
            show: !!property.building.floorsTotal
        },
        {
            key: 'elevator',
            label: tChars('elevator'),
            value: property.building.elevatorPassenger 
                ? property.building.elevatorFreight 
                    ? `${property.building.elevatorPassenger} пасс., ${property.building.elevatorFreight} груз.`
                    : `${property.building.elevatorPassenger}`
                : null,
            show: !!property.building.elevatorPassenger
        },
        {
            key: 'parking',
            label: tChars('parking'),
            value: property.building.parkingType 
                ? tChars(`parkingTypes.${property.building.parkingType}`)
                : null,
            show: !!property.building.parkingType && property.building.parkingType !== 'none'
        },
        {
            key: 'closedTerritory',
            label: tChars('closedTerritory'),
            value: property.building.closedTerritory ? tChars('yes') : null,
            show: !!property.building.closedTerritory
        },
        {
            key: 'concierge',
            label: tChars('concierge'),
            value: property.building.concierge ? tChars('yes') : null,
            show: !!property.building.concierge
        },
        {
            key: 'garbageChute',
            label: tChars('garbageChute'),
            value: property.building.garbageChute ? tChars('yes') : null,
            show: !!property.building.garbageChute
        }
    ].filter(c => c.show && c.value) : [];


    const CharacteristicsTable = ({ 
        title, 
        items 
    }: { 
        title: string; 
        items: { key: string; label: string; value: string | null | undefined }[] 
    }) => {
        if (!items.length) return null;

        return (
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground text-lg">{title}</h3>
                <div className="space-y-2">
                    {items.map(item => (
                        <div 
                            key={item.key}
                            className="flex justify-between gap-4 text-sm py-2 border-b border-border/40 last:border-0"
                        >
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium text-foreground text-right">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    return (
        <div className={cn('flex flex-col gap-10', className)}>
            {/* Top Section: Flat & Building Characteristics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {flatCharacteristics.length > 0 && (
                    <CharacteristicsTable 
                        title={t('aboutFlat')} 
                        items={flatCharacteristics} 
                    />
                )}
                {buildingCharacteristics.length > 0 && (
                    <CharacteristicsTable 
                        title={t('aboutBuilding')} 
                        items={buildingCharacteristics} 
                    />
                )}
            </div>
        </div>
    );
}
