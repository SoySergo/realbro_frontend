'use client';

import { useTranslations } from 'next-intl';
import { Home, Heart } from 'lucide-react';
import { PropertyCardGrid } from '@/entities/property/ui';
import type { FavoriteProperty } from '@/entities/favorites/model/types';
import { Link } from '@/shared/config/routing';
import { useLocale } from 'next-intl';

interface FavoritesPropertiesTabProps {
    properties: FavoriteProperty[];
    isEmpty: boolean;
}

/**
 * Таб избранных объектов недвижимости
 */
export function FavoritesPropertiesTab({ properties, isEmpty }: FavoritesPropertiesTabProps) {
    const t = useTranslations('favorites');
    const locale = useLocale();

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-text-secondary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    {t('empty.title')}
                </h2>
                <p className="text-text-secondary max-w-sm">
                    {t('empty.description')}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((favProperty) => (
                <Link
                    key={favProperty.id}
                    href={`/property/${favProperty.property.id}`}
                >
                    <PropertyCardGrid
                        property={favProperty.property}
                    />
                </Link>
            ))}
        </div>
    );
}
