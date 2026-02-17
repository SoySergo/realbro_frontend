import { cn } from '@/shared/lib/utils';
import type { Property } from '@/entities/property/model/types';
import type { AttributeDTO } from '@/entities/property/model/api-types';
import { DynamicIcon } from '@/shared/ui/dynamic-icon';

// SEO-critical component - NO 'use client' to ensure translations are in HTML

interface CharacteristicsTranslations {
    aboutFlat: string;
    aboutBuilding: string;
    sqm: string;
    propertyType: string;
    totalArea: string;
    livingArea: string;
    kitchenArea: string;
    rooms: string;
    floor: string;
    of: string;
    ceilingHeight: string;
    bathroom: string;
    balcony: string;
    loggia: string;
    renovation: string;
    windowView: string;
    residentialComplex: string;
    buildingType: string;
    buildingYear: string;
    floorsTotal: string;
    elevator: string;
    parking: string;
    closedTerritory: string;
    concierge: string;
    garbageChute: string;
    yes: string;
    no: string;
    meters: string;
    // Type translations
    types: Record<string, string>;
    bathroomTypes: Record<string, string>;
    renovationTypes: Record<string, string>;
    windowViews: Record<string, string>;
    buildingTypes: Record<string, string>;
    parkingTypes: Record<string, string>;
}

// Таблица атрибутов из бекенда (AttributeDTO[])
function AttributesTable({
    title,
    attributes
}: {
    title: string;
    attributes: AttributeDTO[];
}) {
    if (!attributes.length) return null;

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            <div className="space-y-2">
                {attributes.map((attr, index) => (
                    <div
                        key={`${attr.value}-${index}`}
                        className="flex justify-between gap-4 text-sm py-2 border-b border-border/40 last:border-0"
                    >
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <DynamicIcon name={attr.icon_type} size={16} className="shrink-0" />
                            {attr.label}
                        </span>
                        <span className="font-medium text-foreground text-right">
                            {attr.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface PropertyCharacteristicsProps {
    property: Property;
    className?: string;
    translations: CharacteristicsTranslations;
}

export function PropertyCharacteristics({
    property,
    className,
    translations: t
}: PropertyCharacteristicsProps) {
    // About the flat
    const flatCharacteristics = [
        {
            key: 'type',
            label: t.propertyType,
            value: property.type ? t.types[property.type] : null,
            show: !!property.type
        },
        {
            key: 'area',
            label: t.totalArea,
            value: `${property.area} ${t.sqm}`,
            show: true
        },
        {
            key: 'livingArea',
            label: t.livingArea,
            value: property.livingArea ? `${property.livingArea} ${t.sqm}` : null,
            show: !!property.livingArea
        },
        {
            key: 'kitchenArea',
            label: t.kitchenArea,
            value: property.kitchenArea ? `${property.kitchenArea} ${t.sqm}` : null,
            show: !!property.kitchenArea
        },
        {
            key: 'rooms',
            label: t.rooms,
            value: property.rooms?.toString(),
            show: !!property.rooms
        },
        {
            key: 'floor',
            label: t.floor,
            value: property.floor
                ? property.totalFloors
                    ? `${property.floor} ${t.of} ${property.totalFloors}`
                    : property.floor.toString()
                : null,
            show: !!property.floor
        },
        {
            key: 'ceilingHeight',
            label: t.ceilingHeight,
            value: property.ceilingHeight ? `${property.ceilingHeight} ${t.meters}` : null,
            show: !!property.ceilingHeight
        },
        {
            key: 'bathroom',
            label: t.bathroom,
            value: property.bathroomType ? t.bathroomTypes[property.bathroomType] : null,
            show: !!property.bathroomType
        },
        {
            key: 'balcony',
            label: t.balcony,
            value: property.balconyCount
                ? `${property.balconyCount}`
                : property.loggia
                    ? t.loggia
                    : null,
            show: !!(property.balconyCount || property.loggia)
        },
        {
            key: 'renovation',
            label: t.renovation,
            value: property.renovation ? t.renovationTypes[property.renovation] : null,
            show: !!property.renovation
        },
        {
            key: 'windowView',
            label: t.windowView,
            value: property.windowView ? t.windowViews[property.windowView] : null,
            show: !!property.windowView
        }
    ].filter(c => c.show && c.value);

    // About the building
    const buildingCharacteristics = property.building ? [
        {
            key: 'buildingName',
            label: t.residentialComplex,
            value: property.building.name,
            show: !!property.building.name
        },
        {
            key: 'buildingType',
            label: t.buildingType,
            value: property.building.type ? t.buildingTypes[property.building.type] : null,
            show: !!property.building.type
        },
        {
            key: 'buildingYear',
            label: t.buildingYear,
            value: property.building.year?.toString(),
            show: !!property.building.year
        },
        {
            key: 'floorsTotal',
            label: t.floorsTotal,
            value: property.building.floorsTotal?.toString(),
            show: !!property.building.floorsTotal
        },
        {
            key: 'elevator',
            label: t.elevator,
            value: property.building.elevatorPassenger
                ? property.building.elevatorFreight
                    ? `${property.building.elevatorPassenger} + ${property.building.elevatorFreight}`
                    : `${property.building.elevatorPassenger}`
                : null,
            show: !!property.building.elevatorPassenger
        },
        {
            key: 'parking',
            label: t.parking,
            value: property.building.parkingType
                ? t.parkingTypes[property.building.parkingType]
                : null,
            show: !!property.building.parkingType && property.building.parkingType !== 'none'
        },
        {
            key: 'closedTerritory',
            label: t.closedTerritory,
            value: property.building.closedTerritory ? t.yes : null,
            show: !!property.building.closedTerritory
        },
        {
            key: 'concierge',
            label: t.concierge,
            value: property.building.concierge ? t.yes : null,
            show: !!property.building.concierge
        },
        {
            key: 'garbageChute',
            label: t.garbageChute,
            value: property.building.garbageChute ? t.yes : null,
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
        <div className={cn('flex flex-col gap-10 bg-secondary rounded-2xl p-6', className)}>
            {/* Top Section: Flat & Building Characteristics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {flatCharacteristics.length > 0 && (
                    <CharacteristicsTable
                        title={t.aboutFlat}
                        items={flatCharacteristics}
                    />
                )}
                {buildingCharacteristics.length > 0 && (
                    <CharacteristicsTable
                        title={t.aboutBuilding}
                        items={buildingCharacteristics}
                    />
                )}
            </div>

            {/* Атрибуты из бекенда (AttributeDTO[]) */}
            {property.characteristics && property.characteristics.length > 0 && (
                <AttributesTable
                    title={t.aboutFlat}
                    attributes={property.characteristics}
                />
            )}

            {property.estate_info && property.estate_info.length > 0 && (
                <AttributesTable
                    title={t.aboutBuilding}
                    attributes={property.estate_info}
                />
            )}

            {property.energy_efficiency && property.energy_efficiency.length > 0 && (
                <AttributesTable
                    title="Energy Efficiency"
                    attributes={property.energy_efficiency}
                />
            )}
        </div>
    );
}
