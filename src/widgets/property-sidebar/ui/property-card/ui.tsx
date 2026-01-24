'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import type { Property } from '@/entities/property';
import { cn } from '@/shared/lib/utils';

type PropertyCardProps = {
    property: Property;
    isSelected?: boolean;
    onClick?: () => void;
    onShowOnMap?: () => void;
};

/**
 * Карточка объекта недвижимости для сайдбара
 */
export function PropertyCard({ property, isSelected, onClick, onShowOnMap }: PropertyCardProps) {
    const t = useTranslations('property');
    const tTypes = useTranslations('propertyTypes');

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU') + ' €';
    };

    return (
        <div
            className={cn(
                'bg-background border border-border rounded-lg overflow-hidden cursor-pointer',
                'transition-all duration-200 hover:shadow-md hover:border-brand-primary/30',
                isSelected && 'ring-2 ring-brand-primary border-brand-primary'
            )}
            onClick={onClick}
        >
            {/* Изображение */}
            <div className="relative h-32 w-full">
                <Image
                    src={property.images[0] || '/placeholder-property.jpg'}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                />
                {/* Тип недвижимости */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-background/90 rounded text-xs font-medium text-text-primary">
                    {tTypes(property.type)}
                </div>
            </div>

            {/* Контент */}
            <div className="p-3 space-y-2">
                {/* Цена */}
                <div className="text-lg font-bold text-brand-primary">
                    {formatPrice(property.price)}
                    <span className="text-xs font-normal text-text-secondary">/мес</span>
                </div>

                {/* Название */}
                <h3 className="text-sm font-medium text-text-primary line-clamp-1">
                    {property.title}
                </h3>

                {/* Адрес */}
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="line-clamp-1">{property.address}, {property.city}</span>
                </div>

                {/* Характеристики */}
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" />
                        <span>{property.area} м²</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
