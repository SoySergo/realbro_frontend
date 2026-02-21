'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { X, MapPin, Scale, Trash2, Check, Minus, ArrowLeft, Info, Plus } from 'lucide-react';
import { cn, safeImageSrc } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/ui/tooltip';
import { useComparisonStore, COMPARISON_MAX_ITEMS } from '@/features/comparison';
import type { Property } from '@/entities/property';

export interface ComparisonPanelTranslations {
    title: string;
    subtitle: string;
    clearAll: string;
    addMore: string;
    emptySlot: string;
    remove: string;
    backToSearch: string;
    characteristics: string;
    // Характеристики
    price: string;
    pricePerMeter: string;
    area: string;
    rooms: string;
    floor: string;
    bathrooms: string;
    // Условия
    deposit: string;
    commission: string;
    minRentalPeriod: string;
    // Удобства
    elevator: string;
    balcony: string;
    terrace: string;
    airConditioning: string;
    heating: string;
    furnished: string;
    petFriendly: string;
    parking: string;
    pool: string;
    // Метки
    perMonth: string;
    sqm: string;
    months: string;
    yes: string;
    no: string;
    notSpecified: string;
}

interface ComparisonPanelProps {
    translations: ComparisonPanelTranslations;
    locale: string;
    onBack?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPropertyClick?: (property: any) => void;
    onAddMore?: () => void;
    className?: string;
}

// Тип для строки характеристики
interface CharacteristicRow {
    key: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getValue: (property: any) => string | number | boolean | null | undefined;
    format?: 'price' | 'area' | 'floor' | 'boolean' | 'text' | 'months';
    highlight?: 'min' | 'max' | 'boolean';
    suffix?: string;
}

/**
 * ComparisonPanel - Виджет полноэкранного сравнения объектов
 * 
 * Показывает таблицу сравнения с характеристиками, условиями и удобствами.
 * Поддерживает до 4 объектов одновременно.
 */
export function ComparisonPanel({
    translations,
    locale,
    onBack,
    onPropertyClick,
    onAddMore,
    className,
}: ComparisonPanelProps) {
    const t = translations;
    const { getComparisonProperties, removeFromComparison, clearComparison } = useComparisonStore();

    const properties = getComparisonProperties();
    const emptySlots = COMPARISON_MAX_ITEMS - properties.length;

    // Форматирование цены
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : locale).format(price);
    };

    // Определение характеристик для сравнения
    const characteristics: CharacteristicRow[] = useMemo(() => [
        // Основные
        {
            key: 'price',
            label: t.price,
            getValue: (p) => p.price,
            format: 'price',
            highlight: 'min',
            suffix: `€/${t.perMonth}`,
        },
        {
            key: 'pricePerMeter',
            label: t.pricePerMeter,
            getValue: (p) => p.pricePerMeter ?? (p.area > 0 ? Math.round(p.price / p.area) : null),
            format: 'price',
            highlight: 'min',
            suffix: `€/${t.sqm}`,
        },
        {
            key: 'area',
            label: t.area,
            getValue: (p) => p.area,
            format: 'area',
            highlight: 'max',
            suffix: t.sqm,
        },
        {
            key: 'rooms',
            label: t.rooms,
            getValue: (p) => p.rooms,
            format: 'text',
        },
        {
            key: 'floor',
            label: t.floor,
            getValue: (p) => p.floor && p.totalFloors ? `${p.floor}/${p.totalFloors}` : p.floor,
            format: 'text',
        },
        {
            key: 'bathrooms',
            label: t.bathrooms,
            getValue: (p) => p.bathrooms,
            format: 'text',
        },
        // Условия
        {
            key: 'deposit',
            label: t.deposit,
            getValue: (p) => p.rentalConditions?.deposit,
            format: 'price',
            suffix: '€',
        },
        {
            key: 'minRental',
            label: t.minRentalPeriod,
            getValue: (p) => p.rentalConditions?.minRentalMonths,
            format: 'months',
            suffix: t.months,
        },
        // Удобства
        {
            key: 'elevator',
            label: t.elevator,
            getValue: (p) => p.elevator ?? (p.building?.elevatorPassenger != null && p.building.elevatorPassenger > 0),
            format: 'boolean',
            highlight: 'boolean',
        },
        {
            key: 'balcony',
            label: t.balcony,
            getValue: (p) => p.balconyCount != null && p.balconyCount > 0,
            format: 'boolean',
            highlight: 'boolean',
        },
        {
            key: 'airConditioning',
            label: t.airConditioning,
            getValue: (p) => p.features?.includes('airConditioning'),
            format: 'boolean',
            highlight: 'boolean',
        },
        {
            key: 'furnished',
            label: t.furnished,
            getValue: (p) => p.features?.includes('furnished'),
            format: 'boolean',
            highlight: 'boolean',
        },
        {
            key: 'petFriendly',
            label: t.petFriendly,
            getValue: (p) => p.features?.includes('petFriendly') || p.rentalConditions?.petsAllowed,
            format: 'boolean',
            highlight: 'boolean',
        },
        {
            key: 'parking',
            label: t.parking,
            getValue: (p) => {
                // Проверяем наличие парковки через features или building.parkingType
                const hasFeatureParking = p.features?.includes('parking') ?? false;
                const hasBuildingParking = p.building?.parkingType != null && p.building.parkingType !== 'none';
                return hasFeatureParking || hasBuildingParking;
            },
            format: 'boolean',
            highlight: 'boolean',
        },
    ], [t]);

    // Вычисление лучших значений для подсветки
    const getBestValues = useMemo(() => {
        const bestValues: Record<string, number | boolean> = {};

        characteristics.forEach((char) => {
            if (char.highlight === 'min') {
                const values = properties
                    .map((p) => char.getValue(p))
                    .filter((v): v is number => typeof v === 'number');
                if (values.length > 0) {
                    bestValues[char.key] = Math.min(...values);
                }
            } else if (char.highlight === 'max') {
                const values = properties
                    .map((p) => char.getValue(p))
                    .filter((v): v is number => typeof v === 'number');
                if (values.length > 0) {
                    bestValues[char.key] = Math.max(...values);
                }
            } else if (char.highlight === 'boolean') {
                bestValues[char.key] = true;
            }
        });

        return bestValues;
    }, [properties, characteristics]);

    // Форматирование значения
    const formatValue = (char: CharacteristicRow, value: ReturnType<CharacteristicRow['getValue']>) => {
        if (value === null || value === undefined) {
            return <span className="text-text-tertiary">{t.notSpecified}</span>;
        }

        if (char.format === 'boolean') {
            const boolValue = Boolean(value);
            return boolValue ? (
                <Check className="w-5 h-5 text-success" />
            ) : (
                <Minus className="w-5 h-5 text-text-tertiary" />
            );
        }

        if (char.format === 'price') {
            return (
                <span className="font-mono font-medium">
                    {formatPrice(value as number)} {char.suffix}
                </span>
            );
        }

        if (char.format === 'area' || char.format === 'months') {
            return (
                <span>
                    {value} {char.suffix}
                </span>
            );
        }

        return <span>{String(value)}</span>;
    };

    // Проверка, является ли значение лучшим
    const isBestValue = (char: CharacteristicRow, value: ReturnType<CharacteristicRow['getValue']>) => {
        const bestValue = getBestValues[char.key];
        if (bestValue === undefined) return false;

        if (char.highlight === 'boolean') {
            return Boolean(value) === true;
        }

        if (typeof value === 'number' && typeof bestValue === 'number') {
            return value === bestValue;
        }

        return false;
    };

    // Пустой стейт
    if (properties.length === 0) {
        return (
            <div className={cn('flex flex-col items-center justify-center min-h-[60vh] gap-4', className)}>
                <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center">
                    <Scale className="w-10 h-10 text-text-tertiary" />
                </div>
                <p className="text-lg font-medium text-text-primary">{t.title}</p>
                <p className="text-sm text-text-secondary text-center max-w-md">{t.subtitle}</p>
                {onBack && (
                    <Button variant="outline" onClick={onBack} className="gap-2 mt-4">
                        <ArrowLeft className="w-4 h-4" />
                        {t.backToSearch}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background border-b border-border px-4 md:px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2">
                                <Scale className="w-6 h-6 text-brand-primary" />
                                {t.title}
                            </h1>
                            <p className="text-sm text-text-secondary">
                                {properties.length} / {COMPARISON_MAX_ITEMS} {t.subtitle}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearComparison}
                        className="text-error hover:text-error hover:bg-error/10 gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.clearAll}</span>
                    </Button>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="min-w-[800px]">
                    {/* Property Cards Row */}
                    <div className="sticky top-0 z-10 bg-background border-b border-border">
                        <div className="grid gap-4 p-4 md:p-6" style={{ gridTemplateColumns: `200px repeat(${COMPARISON_MAX_ITEMS}, 1fr)` }}>
                            {/* Label column header */}
                            <div className="flex items-end pb-4">
                                <span className="text-sm font-medium text-text-secondary">{t.characteristics}</span>
                            </div>

                            {/* Property cards */}
                            {properties.map((property) => (
                                <PropertyComparisonCard
                                    key={property.id}
                                    property={property}
                                    onRemove={() => removeFromComparison(property.id)}
                                    onClick={() => onPropertyClick?.(property)}
                                    removeLabel={t.remove}
                                    locale={locale}
                                />
                            ))}

                            {/* Empty slots */}
                            {Array.from({ length: emptySlots }).map((_, idx) => (
                                <EmptySlot
                                    key={`empty-${idx}`}
                                    label={t.emptySlot}
                                    addLabel={t.addMore}
                                    onAdd={onAddMore}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Characteristics Table */}
                    <div className="p-4 md:p-6 pt-0">
                        {characteristics.map((char, idx) => (
                            <div
                                key={char.key}
                                className={cn(
                                    'grid gap-4 py-3 border-b border-border',
                                    idx % 2 === 0 && 'bg-background-secondary/30'
                                )}
                                style={{ gridTemplateColumns: `200px repeat(${COMPARISON_MAX_ITEMS}, 1fr)` }}
                            >
                                {/* Label */}
                                <div className="flex items-center gap-2 px-3">
                                    <span className="text-sm text-text-secondary">{char.label}</span>
                                </div>

                                {/* Values */}
                                {properties.map((property) => {
                                    const value = char.getValue(property);
                                    const isBest = isBestValue(char, value);
                                    return (
                                        <div
                                            key={property.id}
                                            className={cn(
                                                'flex items-center justify-center text-sm',
                                                isBest && 'text-success font-medium bg-success/10 rounded-lg py-1'
                                            )}
                                        >
                                            {formatValue(char, value)}
                                        </div>
                                    );
                                })}

                                {/* Empty cells for empty slots */}
                                {Array.from({ length: emptySlots }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="flex items-center justify-center">
                                        <Minus className="w-4 h-4 text-text-tertiary/30" />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

/**
 * Карточка объекта в сравнении
 */
function PropertyComparisonCard({
    property,
    onRemove,
    onClick,
    removeLabel,
    locale,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: any;
    onRemove: () => void;
    onClick?: () => void;
    removeLabel: string;
    locale: string;
}) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : locale).format(price);
    };

    return (
        <div className="relative group">
            {/* Кнопка удаления */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className={cn(
                    'absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full',
                    'bg-error text-white flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'cursor-pointer hover:bg-error/80 shadow-md'
                )}
                title={removeLabel}
            >
                <X className="w-4 h-4" />
            </button>

            <div
                onClick={onClick}
                className={cn(
                    'rounded-xl overflow-hidden border-2 border-border',
                    'hover:border-brand-primary transition-colors cursor-pointer',
                    'bg-card'
                )}
            >
                {/* Изображение */}
                <div className="relative aspect-[4/3]">
                    {property.images[0] ? (
                        <Image
                            src={safeImageSrc(property.images[0])}
                            alt={property.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-background-secondary flex items-center justify-center">
                            <Scale className="w-8 h-8 text-text-tertiary" />
                        </div>
                    )}
                </div>

                {/* Информация */}
                <div className="p-3">
                    <p className="text-lg font-bold text-price mb-1">
                        {formatPrice(property.price)} €
                    </p>
                    <p className="text-sm font-medium text-text-primary line-clamp-1 mb-1">
                        {property.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{property.address}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Пустой слот для добавления объекта
 */
function EmptySlot({
    label,
    addLabel,
    onAdd,
}: {
    label: string;
    addLabel: string;
    onAdd?: () => void;
}) {
    return (
        <div
            onClick={onAdd}
            className={cn(
                'rounded-xl border-2 border-dashed border-border',
                'bg-background-secondary/50',
                'flex flex-col items-center justify-center gap-2 min-h-[200px]',
                onAdd && 'cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-colors'
            )}
        >
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                <Plus className="w-6 h-6 text-text-tertiary" />
            </div>
            <p className="text-sm text-text-tertiary text-center px-4">{label}</p>
            {onAdd && (
                <p className="text-xs text-brand-primary font-medium">{addLabel}</p>
            )}
        </div>
    );
}
