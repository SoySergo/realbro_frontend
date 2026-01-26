'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { ComboboxInput } from '@/shared/ui/combobox-input';
import { SelectedLocationsList } from '../selected-locations-list';
import { BoundariesVisualLayer } from '../boundaries-visual-layer';
import { useSearchModeState } from '../../model/hooks/use-search-mode-state';
import { searchLocations, mapPlaceTypeToLocationType, getAdminLevelForPlaceType } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import type mapboxgl from 'mapbox-gl';
import type { MapboxLocation, LocationItem } from '@/entities/location';

type MobileSearchPanelProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
};

/**
 * Мобильная панель режима поиска локаций
 * Компактная версия для отображения под табами на карте
 *
 * Функциональность:
 * - Поиск локаций через Mapbox Geocoding API
 * - Выбор множества локаций для фильтра
 * - Синхронизация с BoundariesLayer для подсветки на карте
 */
export const MobileSearchPanel = memo(function MobileSearchPanel({ map }: MobileSearchPanelProps) {
    const t = useTranslations('locationSearch');

    // Состояние поиска
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MapboxLocation[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Локальное состояние выбранных локаций
    const { selectedLocations, addLocation, removeLocation, toggleLocation } = useSearchModeState();

    // Язык пользователя
    const userLang = typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en';

    // Поиск локаций с debounce
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchLocations({
                    query: searchQuery,
                    language: userLang,
                    limit: 8, // Меньше результатов для мобильной версии
                });
                setSearchResults(results);
                setShowDropdown(results.length > 0);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, userLang]);

    // Обработчик выбора локации из поиска
    const handleSelectLocation = useCallback(
        (mapboxLocation: MapboxLocation) => {
            if (!mapboxLocation.wikidata) {
                console.warn('[MobileSearchPanel] Location without wikidata:', mapboxLocation);
                return;
            }

            const locationItem: LocationItem = {
                id: 0,
                name: mapboxLocation.name,
                type: mapPlaceTypeToLocationType(mapboxLocation.placeType),
                adminLevel: getAdminLevelForPlaceType(mapboxLocation.placeType),
                centerLat: mapboxLocation.coordinates[1],
                centerLon: mapboxLocation.coordinates[0],
                wikidata: mapboxLocation.wikidata,
            };

            addLocation(locationItem);
            setSearchQuery('');
            setSearchResults([]);
            setShowDropdown(false);

            // Центрируем карту на выбранной локации
            map.flyTo({
                center: mapboxLocation.coordinates,
                zoom: 10,
            });
        },
        [map, addLocation]
    );

    // Обработчик удаления локации
    const handleRemoveLocation = useCallback(
        (wikidata: string) => {
            removeLocation(wikidata);
        },
        [removeLocation]
    );

    // Рендер элемента результата поиска (компактная версия)
    const renderSearchResult = useCallback(
        (location: MapboxLocation, isSelected: boolean) => (
            <div
                className={cn(
                    'flex items-start gap-2 p-2.5 transition-colors',
                    isSelected ? 'bg-brand-primary/10' : 'active:bg-background-secondary'
                )}
            >
                <MapPin className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{location.name}</p>
                    <p className="text-xs text-text-tertiary truncate">{location.context}</p>
                </div>
            </div>
        ),
        []
    );

    return (
        <>
            {/* Визуализация слоя boundaries */}
            <BoundariesVisualLayer
                map={map}
                isActive={true}
                selectedLocations={selectedLocations}
                onToggleLocation={toggleLocation}
            />

            <div className="px-4 py-3 space-y-3">
                {/* Поиск локаций */}
                <ComboboxInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setShowDropdown(false);
                    }}
                    results={searchResults}
                    isLoading={isSearching}
                    showDropdown={showDropdown}
                    onShowDropdownChange={setShowDropdown}
                    onSelect={handleSelectLocation}
                    renderItem={renderSearchResult}
                    getItemKey={(location) => location.id}
                    placeholder={t('searchPlaceholder')}
                    maxDropdownHeight="200px"
                />

                {/* Список выбранных локаций */}
                {selectedLocations.length > 0 && (
                    <SelectedLocationsList
                        locations={selectedLocations}
                        onRemove={handleRemoveLocation}
                    />
                )}

                {/* Пустое состояние */}
                {selectedLocations.length === 0 && !showDropdown && (
                    <div className="text-center py-4 text-text-secondary">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">{t('emptyStateHint')}</p>
                    </div>
                )}
            </div>
        </>
    );
});
