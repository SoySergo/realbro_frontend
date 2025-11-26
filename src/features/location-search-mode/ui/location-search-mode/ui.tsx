'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { ComboboxInput } from '@/shared/ui/combobox-input';
import { LocationModeWrapper } from '@/features/location-filter/ui/location-mode-wrapper';
import { SelectedLocationsList } from '../selected-locations-list';
import { BoundariesVisualLayer } from '../boundaries-visual-layer';
import { useSearchModeState } from '../../model/hooks/use-search-mode-state';
import { searchLocations, mapPlaceTypeToLocationType, getAdminLevelForPlaceType } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import type { MapboxLocation } from '@/entities/location';
import type { LocationItem } from '@/entities/location';

type LocationSearchModeProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Компонент режима поиска локаций через Mapbox Geocoding API
 * Использует синхронизацию с картой через Wikidata ID
 * Позволяет выбрать множество локаций для фильтра
 * Интегрирован с BoundariesLayer - клики на полигоны карты добавляют локации
 */
export function LocationSearchMode({ map, onClose, className }: LocationSearchModeProps) {
    const t = useTranslations('locationSearch');

    // Состояние поиска
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MapboxLocation[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Локальное состояние выбранных локаций
    const { selectedLocations, addLocation, removeLocation, toggleLocation, clearLocations } = useSearchModeState();

    // Язык пользователя
    const userLang = document.documentElement.lang || 'en';

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
                    limit: 10,
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
            // Проверяем, что у локации есть wikidata
            if (!mapboxLocation.wikidata) {
                console.warn('[LocationSearchMode] Location without wikidata:', mapboxLocation);
                return;
            }

            // Преобразуем в LocationItem
            const locationItem: LocationItem = {
                id: 0, // Deprecated
                name: mapboxLocation.name,
                type: mapPlaceTypeToLocationType(mapboxLocation.placeType),
                adminLevel: getAdminLevelForPlaceType(mapboxLocation.placeType),
                centerLat: mapboxLocation.coordinates[1],
                centerLon: mapboxLocation.coordinates[0],
                wikidata: mapboxLocation.wikidata,
            };

            // Добавляем локацию (хук сам проверит дубликаты)
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

    // Обработчик очистки всех локаций
    const handleClear = useCallback(() => {
        clearLocations();
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
    }, [clearLocations]);

    // Обработчик применения фильтра (сохранение в URL/store)
    const handleApply = useCallback(() => {
        // TODO: Добавить логику пуша в URL search params
        console.log('[LocationSearchMode] Apply location filter:', selectedLocations);
    }, [selectedLocations]);

    // Обработчик закрытия панели
    const handleClose = useCallback(() => {
        onClose?.();
        console.log('[LocationSearchMode] Close location search panel');
    }, [onClose]);

    // Рендер элемента результата поиска
    const renderSearchResult = (location: MapboxLocation, isSelected: boolean) => {
        return (
            <div
                className={cn(
                    'flex items-start gap-3 p-3 transition-colors',
                    isSelected ? 'bg-brand-primary/10' : 'hover:bg-background-secondary'
                )}
            >
                <MapPin className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{location.name}</p>
                    <p className="text-xs text-text-tertiary truncate">{location.context}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Визуализация слоя boundaries и синхронизация с кликами */}
            <BoundariesVisualLayer
                map={map}
                isActive={true}
                selectedLocations={selectedLocations}
                onToggleLocation={toggleLocation}
            />

            <LocationModeWrapper
                title={t('title')}
                hasLocalData={selectedLocations.length > 0}
                onClear={handleClear}
                onApply={handleApply}
                onClose={handleClose}
                className={className}
                fixedContent={
                    /* Поиск локаций - зафиксирован вверху */
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">{t('searchLabel')}</label>
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
                            maxDropdownHeight="300px"
                        />
                    </div>
                }
            >
                {/* Скролируемый контент */}
                <div className="space-y-4">
                    {/* Список выбранных локаций */}
                    {selectedLocations.length > 0 && (
                        <SelectedLocationsList locations={selectedLocations} onRemove={handleRemoveLocation} />
                    )}

                    {/* Пустое состояние */}
                    {selectedLocations.length === 0 && (
                        <div className="text-center py-8 text-text-secondary">
                            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">{t('emptyState')}</p>
                            <p className="text-xs mt-2">{t('emptyStateHint')}</p>
                        </div>
                    )}
                </div>
            </LocationModeWrapper>
        </>
    );
}
