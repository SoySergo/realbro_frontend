'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ComboboxInput } from '@/components/ui/combobox-input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import type { LocationItem } from '@/types/filter';
import type { MapboxLocation } from '@/types/map';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalLocationState } from '@/hooks/useLocalLocationState';
import { searchLocations, mapPlaceTypeToLocationType, getAdminLevelForPlaceType } from '@/services/mapbox-geocoding';
import { LocationModeActions } from './LocationModeActions';

/**
 * Режим поиска локаций через Mapbox Geocoding API
 * Содержит инпут с автокомплитом и выбранные теги локаций
 * 
 * ДВУХСЛОЙНАЯ СИСТЕМА:
 * - Локальный слой (localStorage): временные изменения до применения
 * - Глобальный слой (store): применённые фильтры
 */

export function LocationSearchMode() {
    const t = useTranslations('filters');
    const locale = useLocale();
    const {
        activeLocationMode,
        locationFilter,
        setLocationFilter,
        setLocationMode,
        addSelectedBoundary,
        clearSelectedBoundaries,
    } = useFilterStore();

    // Локальное состояние для этого режима
    const {
        currentLocalState,
        updateSearchState,
        clearLocalState,
        getModesWithData,
        loadFromGlobalFilter,
        forceCleanLocalStorage,
    } = useLocalLocationState(activeLocationMode);

    // Локальное состояние для UI поиска
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MapboxLocation[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const isSelectingRef = useRef(false); // Флаг для предотвращения мигания при выборе

    // Debounce для поискового запроса
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Лимит видимых тегов
    const VISIBLE_TAGS_LIMIT = 3;

    // Локальные выбранные локации (до применения)
    const localSearchState = currentLocalState as { selectedLocations: LocationItem[] } | null;
    const selectedLocations = useMemo(
        () => localSearchState?.selectedLocations || [],
        [localSearchState]
    );

    // Инициализация: при открытии режима ВСЕГДА загружаем из глобального фильтра
    useEffect(() => {
        if (locationFilter?.mode === 'search') {
            loadFromGlobalFilter('search', locationFilter);
            console.log('[LOCAL] Loaded from global filter on mode open');
        } else if (selectedLocations.length === 0) {
            // Если глобального фильтра нет - проверяем localStorage
            // Данные уже загружены из localStorage хуком useLocalLocationState
            console.log('[LOCAL] No global filter, using local state from localStorage');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeLocationMode]); // Зависимость от activeLocationMode - при каждом открытии режима

    // Логирование изменений локального состояния
    useEffect(() => {
        console.log('LocationSearchMode local state:', selectedLocations.length, 'locations');
    }, [selectedLocations.length]);

    // Поиск локаций при изменении debounced запроса
    useEffect(() => {
        const performSearch = async () => {
            // Пропускаем поиск если идёт выбор элемента
            if (isSelectingRef.current) {
                isSelectingRef.current = false;
                return;
            }

            if (!debouncedSearchQuery.trim()) {
                setSearchResults([]);
                setShowDropdown(false);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);

            // Поиск через Mapbox Geocoding API
            const mapboxResults = await searchLocations({
                query: debouncedSearchQuery,
                language: locale,
                limit: 10,
            });

            // Фильтруем уже выбранные локации (сравниваем по wikidata)
            const filteredResults = mapboxResults.filter((result) => {
                // Если есть wikidata, сравниваем по нему, иначе пропускаем результат
                if (!result.wikidata) return true;
                return !selectedLocations.find((loc: LocationItem) => loc.wikidata === result.wikidata);
            });

            setSearchResults(filteredResults);

            // Показываем dropdown если есть результаты
            if (filteredResults.length > 0) {
                setShowDropdown(true);
            } else {
                setShowDropdown(false);
            }

            setIsSearching(false);
        };

        performSearch();
    }, [debouncedSearchQuery, selectedLocations, locale]);

    // Получить лейбл типа локации (с локализацией)
    const getLocationTypeLabel = (placeType: MapboxLocation['placeType']): string => {
        const typeMap: Record<MapboxLocation['placeType'], string> = {
            country: t('locationTypeCountry'),
            region: t('locationTypeRegion'),
            place: t('locationTypeCity'),
            district: t('locationTypeDistrict'),
            neighborhood: t('locationTypeNeighborhood'),
            locality: t('locationTypeCity'),
            postcode: t('locationTypePlace'),
            address: t('locationTypePlace'),
            poi: t('locationTypePlace'),
        };
        return typeMap[placeType] || t('locationTypePlace');
    };

    // Преобразовать Mapbox локацию в LocationItem
    const mapboxToLocationItem = (mapboxLoc: MapboxLocation): LocationItem => {
        // Извлекаем числовой ID из строки вида "place.123" или используем хеш от строки
        const numericId = Number(mapboxLoc.id.split('.')[1]) ||
            mapboxLoc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        return {
            id: numericId,
            name: mapboxLoc.name,
            type: mapPlaceTypeToLocationType(mapboxLoc.placeType),
            adminLevel: getAdminLevelForPlaceType(mapboxLoc.placeType),
            centerLat: mapboxLoc.coordinates[1],
            centerLon: mapboxLoc.coordinates[0],
            wikidata: mapboxLoc.wikidata, // Основной идентификатор для синхронизации с картой
        };
    };

    // Удаление выбранной локации (только из локального слоя)
    const handleRemoveLocation = (location: LocationItem) => {
        const newLocations = selectedLocations.filter((loc: LocationItem) => loc.id !== location.id);
        updateSearchState({ selectedLocations: newLocations });
        console.log('Removed location from local state:', location.name);
    };

    // Добавление локации (только в локальный слой)
    const handleAddLocation = (mapboxLocation: MapboxLocation) => {
        // Устанавливаем флаг выбора для предотвращения повторного поиска
        isSelectingRef.current = true;

        const locationItem = mapboxToLocationItem(mapboxLocation);

        // Проверяем, не выбрана ли уже эта локация (по wikidata или по id)
        const alreadySelected = locationItem.wikidata
            ? selectedLocations.find((loc: LocationItem) => loc.wikidata === locationItem.wikidata)
            : selectedLocations.find((loc: LocationItem) => loc.id === locationItem.id);

        if (!alreadySelected) {
            const newLocations = [...selectedLocations, locationItem];
            updateSearchState({ selectedLocations: newLocations });
            console.log('Added location to local state:', locationItem.name);
        }

        // Скрываем dropdown и очищаем поиск
        setShowDropdown(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Обработчик очистки инпута поиска
    const handleClearInput = () => {
        setSearchResults([]);
        setShowDropdown(false);
    };

    // Очистка локального состояния (кнопка "Очистить")
    const handleClear = () => {
        // Очищаем только локальное состояние
        clearLocalState('search');
        console.log('Cleared local search state');
    };

    // Выход из режима (кнопка X)
    const handleExit = () => {
        // Полностью очищаем ВСЕ локальные состояния
        forceCleanLocalStorage();
        // Закрываем панель деталей
        setLocationMode(null);
        console.log('[LOCAL] Exited and cleaned all local states');
    };

    // Рендер элемента результата поиска
    const renderSearchResult = (location: MapboxLocation, isSelected: boolean) => (
        <div
            className={cn(
                'w-full flex items-center justify-between px-3 py-2.5',
                'text-sm transition-colors duration-150',
                'border-b border-border last:border-b-0',
                isSelected
                    ? 'bg-brand-primary-light text-brand-primary dark:bg-brand-primary dark:text-white'
                    : 'text-text-primary hover:bg-brand-primary-light hover:text-brand-primary dark:text-text-secondary dark:hover:bg-brand-primary dark:hover:text-white'
            )}
        >
            <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">{location.name}</span>
                {location.context && (
                    <span className="text-xs text-text-tertiary">{location.context}</span>
                )}
            </div>
            <span className="text-xs text-text-tertiary shrink-0 ml-2">
                {getLocationTypeLabel(location.placeType)}
            </span>
        </div>
    );

    // Сохранение фильтра в глобальный store
    const handleSave = () => {
        // Очищаем ранее выбранные границы
        clearSelectedBoundaries();

        // Применяем локальные изменения в глобальный store
        setLocationFilter({
            mode: 'search',
            selectedLocations: selectedLocations,
        });

        // Синхронизируем границы на карте
        selectedLocations.forEach((location: LocationItem) => {
            if (location.wikidata) {
                addSelectedBoundary(location.wikidata);
            }
        });

        // Полностью очищаем localStorage после сохранения
        forceCleanLocalStorage();

        // Закрываем панель деталей
        setLocationMode(null);

        console.log('[GLOBAL] Location filter saved:', selectedLocations.length, 'locations');
        console.log('[LOCAL] Cleaned localStorage after save');
    };

    return (
        <>
            <div className="flex items-center gap-2 flex-wrap flex-1">
                <Label className="text-sm text-text-primary">
                    {t('locationSearch')}:
                </Label>

                {/* Инпут поиска с dropdown */}
                <ComboboxInput<MapboxLocation>
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={handleClearInput}
                    results={searchResults}
                    isLoading={isSearching}
                    showDropdown={showDropdown}
                    onShowDropdownChange={setShowDropdown}
                    onSelect={handleAddLocation}
                    renderItem={renderSearchResult}
                    getItemKey={(location) => location.id}
                    placeholder={t('searchPlaceholder')}
                    containerClassName="flex-1 min-w-[200px] max-w-[400px]"
                />

                {/* Выбранные локации (теги) */}
                {selectedLocations.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {selectedLocations.slice(0, VISIBLE_TAGS_LIMIT).map((location) => (
                            <div
                                key={location.wikidata || location.id}
                                className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md",
                                    "bg-brand-primary-light text-brand-primary",
                                    "dark:bg-brand-primary/20 dark:text-brand-primary",
                                    "text-sm transition-colors"
                                )}
                            >
                                <span className="font-medium">{location.name}</span>
                                <button
                                    onClick={() => handleRemoveLocation(location)}
                                    className={cn(
                                        "hover:bg-brand-primary/20 rounded-sm p-0.5 transition-colors",
                                        "dark:hover:bg-brand-primary/30"
                                    )}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {/* Popover с остальными тегами */}
                        {selectedLocations.length > VISIBLE_TAGS_LIMIT && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-md",
                                            "bg-background border border-border dark:border-transparent",
                                            "text-text-secondary hover:text-text-primary",
                                            "hover:bg-background-secondary dark:hover:bg-background-tertiary",
                                            "text-sm transition-colors duration-150 cursor-pointer"
                                        )}
                                    >
                                        <span className="font-medium">
                                            +{selectedLocations.length - VISIBLE_TAGS_LIMIT}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto max-w-md p-3 bg-background border-border"
                                    align="start"
                                >
                                    <div className="flex flex-col gap-2">
                                        {selectedLocations.slice(VISIBLE_TAGS_LIMIT).map((location) => (
                                            <div
                                                key={location.wikidata || location.id}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md w-fit",
                                                    "bg-brand-primary-light text-brand-primary",
                                                    "dark:bg-brand-primary/20 dark:text-brand-primary",
                                                    "text-sm transition-colors max-w-[200px]"
                                                )}
                                            >
                                                <span className="font-medium truncate">{location.name}</span>
                                                <button
                                                    onClick={() => handleRemoveLocation(location)}
                                                    className={cn(
                                                        "hover:bg-brand-primary/20 rounded-sm p-0.5 transition-colors shrink-0",
                                                        "dark:hover:bg-brand-primary/30"
                                                    )}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                )}
            </div>

            {/* Кнопки управления */}
            <LocationModeActions
                currentMode="search"
                hasCurrentData={selectedLocations.length > 0}
                otherModesWithData={getModesWithData('search')}
                onClear={handleClear}
                onApply={handleSave}
                onExit={handleExit}
            />
        </>
    );
}
