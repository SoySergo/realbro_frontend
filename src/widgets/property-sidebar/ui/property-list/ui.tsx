'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Map, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PropertyCard } from '../property-card';
import { usePropertySidebarStore } from '../../model';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { getPropertiesList, type PropertiesListResponse } from '@/shared/api';
import type { Property } from '@/entities/property';

type PropertyListProps = {
    onPropertyClick?: (property: Property) => void;
    onShowOnMap?: () => void;
};

/**
 * Список объектов недвижимости
 * Показывается в режиме "list" сайдбара
 */
export function PropertyList({ onPropertyClick, onShowOnMap }: PropertyListProps) {
    const t = useTranslations('property');
    const tCommon = useTranslations('common');
    const tMap = useTranslations('map');

    const { sortBy, sortOrder, page, setPage } = usePropertySidebarStore();
    const { currentFilters } = useFilterStore();

    const [properties, setProperties] = useState<Property[]>([]);
    const [pagination, setPagination] = useState<PropertiesListResponse['pagination'] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

    // Загрузка списка объектов
    const fetchProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getPropertiesList({
                filters: currentFilters,
                page,
                limit: 20,
                sortBy,
                sortOrder,
            });
            setProperties(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentFilters, page, sortBy, sortOrder]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const handlePropertyClick = (property: Property) => {
        setSelectedPropertyId(property.id);
        onPropertyClick?.(property);
    };

    const handleShowOnMap = () => {
        onShowOnMap?.();
    };

    if (isLoading && properties.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Кнопка "Смотреть на карте" */}
            <div className="p-3 border-b border-border bg-background-secondary">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowOnMap}
                    className="w-full"
                >
                    <Map className="w-4 h-4 mr-2" />
                    {tMap('showMap')}
                </Button>
            </div>

            {/* Список карточек */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {properties.map((property) => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                        isSelected={selectedPropertyId === property.id}
                        onClick={() => handlePropertyClick(property)}
                    />
                ))}

                {properties.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-text-secondary">
                        <p className="text-sm">{tCommon('notFound')}</p>
                    </div>
                )}
            </div>

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-3 border-t border-border bg-background-secondary flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1 || isLoading}
                    >
                        Назад
                    </Button>
                    <span className="text-sm text-text-secondary">
                        {page} / {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages || isLoading}
                    >
                        Далее
                    </Button>
                </div>
            )}
        </div>
    );
}
