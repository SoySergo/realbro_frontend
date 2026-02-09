'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { X, Loader2, SlidersHorizontal, Search, Phone, Trash2 } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { useAgencyFilters } from '@/features/agency-filters';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MarkerTypeFilterMobile } from '@/features/marker-type-filter';
import { CategoryFilterMobile } from '@/features/category-filter';
import { RoomsFilterMobile } from '@/features/rooms-filter';
import { PriceFilterMobile } from '@/features/price-filter';
import { AreaFilterMobile } from '@/features/area-filter';
import { LocationFilterMobile } from '@/features/location-filter';
import type { LocationFilterMode } from '@/features/location-filter/model';
import { FilterSection } from './filter-section';
import { getPropertiesCount, getAgenciesCount } from '@/shared/api';
import { AVAILABLE_LANGUAGES, AGENCY_PROPERTY_TYPES } from '@/entities/agency';
import type { AgencyPropertyType } from '@/entities/agency';
import type { SearchCategory } from '@/features/search-category';
import { cn } from '@/shared/lib/utils';

// Константы
const MAX_PRICE = 20_000;
const MAX_AREA = 500;

interface FiltersDesktopPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentCategory?: SearchCategory;
}

/**
 * Desktop версия панели фильтров с улучшенным UI/UX
 * 
 * Особенности:
 * - Выпадающая панель с анимацией slide down + fade
 * - Sticky header с количеством активных фильтров
 * - Кнопки "Сбросить все" и "Применить"
 * - Разделение фильтров по категориям с возможностью сворачивания
 * - Максимальная высота с прокруткой внутри панели
 * - Поддержка светлой/тёмной темы через CSS variables
 * - Keyboard navigation (Tab, Enter, Escape)
 */
export function FiltersDesktopPanel({ open, onOpenChange, currentCategory = 'properties' }: FiltersDesktopPanelProps) {
    const t = useTranslations('filters');
    const tAgency = useTranslations('agency');
    const tLang = useTranslations('languages');
    const locale = useLocale();
    const { filters, setFilters } = useSearchFilters();
    const agencyFiltersStore = useAgencyFilters();
    const { activeLocationMode, setLocationMode, currentFilters } = useFilterStore();

    const isProperties = currentCategory === 'properties';

    // Локальное состояние для фильтров недвижимости
    const [localMarkerType, setLocalMarkerType] = useState(filters.markerType || 'all');
    const [localCategoryIds, setLocalCategoryIds] = useState<number[]>(filters.categoryIds || []);
    const [localRooms, setLocalRooms] = useState<number[]>(filters.rooms || []);
    const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || 0);
    const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || MAX_PRICE);
    const [localMinArea, setLocalMinArea] = useState(filters.minArea || 0);
    const [localMaxArea, setLocalMaxArea] = useState(filters.maxArea || MAX_AREA);
    const [localLocationMode, setLocalLocationMode] = useState<LocationFilterMode | null>(activeLocationMode);

    // Локальное состояние для фильтров профессионалов
    const [localQuery, setLocalQuery] = useState(agencyFiltersStore.filters.query || '');
    const [localPhone, setLocalPhone] = useState(agencyFiltersStore.filters.phone || '');
    const [localLanguages, setLocalLanguages] = useState<string[]>(agencyFiltersStore.filters.languages || []);
    const [localPropertyTypes, setLocalPropertyTypes] = useState<AgencyPropertyType[]>(agencyFiltersStore.filters.propertyTypes || []);

    // Состояние для подсчёта результатов
    const [resultsCount, setResultsCount] = useState<number | null>(null);
    const [isLoadingCount, setIsLoadingCount] = useState(false);

    // Синхронизация локального состояния при открытии
    useEffect(() => {
        if (open) {
            setLocalMarkerType(filters.markerType || 'all');
            setLocalCategoryIds(filters.categoryIds || []);
            setLocalRooms(filters.rooms || []);
            setLocalMinPrice(filters.minPrice || 0);
            setLocalMaxPrice(filters.maxPrice || MAX_PRICE);
            setLocalMinArea(filters.minArea || 0);
            setLocalMaxArea(filters.maxArea || MAX_AREA);
            setLocalLocationMode(activeLocationMode);
            // Синхронизация фильтров профессионалов
            setLocalQuery(agencyFiltersStore.filters.query || '');
            setLocalPhone(agencyFiltersStore.filters.phone || '');
            setLocalLanguages(agencyFiltersStore.filters.languages || []);
            setLocalPropertyTypes(agencyFiltersStore.filters.propertyTypes || []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Функция для получения количества результатов
    const fetchResultsCount = useCallback(async () => {
        setIsLoadingCount(true);
        try {
            if (isProperties) {
                const mergedFilters = {
                    ...currentFilters,
                    markerType: localMarkerType !== 'all' ? localMarkerType : undefined,
                    categoryIds: localCategoryIds.length > 0 ? localCategoryIds : undefined,
                    rooms: localRooms.length > 0 ? localRooms : undefined,
                    minPrice: localMinPrice !== 0 ? localMinPrice : undefined,
                    maxPrice: localMaxPrice !== MAX_PRICE ? localMaxPrice : undefined,
                    minArea: localMinArea !== 0 ? localMinArea : undefined,
                    maxArea: localMaxArea !== MAX_AREA ? localMaxArea : undefined,
                };
                const count = await getPropertiesCount(mergedFilters);
                setResultsCount(count);
            } else {
                const agencyMergedFilters = {
                    ...agencyFiltersStore.filters,
                    query: localQuery || undefined,
                    phone: localPhone || undefined,
                    languages: localLanguages.length > 0 ? localLanguages : undefined,
                    propertyTypes: localPropertyTypes.length > 0 ? localPropertyTypes : undefined,
                };
                const count = await getAgenciesCount(agencyMergedFilters, locale);
                setResultsCount(count);
            }
        } catch (error) {
            console.error('Failed to fetch results count:', error);
            setResultsCount(null);
        } finally {
            setIsLoadingCount(false);
        }
    }, [isProperties, localMarkerType, localCategoryIds, localRooms, localMinPrice, localMaxPrice, localMinArea, localMaxArea, currentFilters, localQuery, localPhone, localLanguages, localPropertyTypes, agencyFiltersStore.filters, locale]);

    // Обновляем счётчик при изменении фильтров (с debounce)
    useEffect(() => {
        if (open) {
            const timeoutId = setTimeout(() => {
                fetchResultsCount();
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [open, fetchResultsCount]);

    // Проверка наличия изменений в локальном состоянии
    const hasLocalChanges = isProperties
        ? (localMarkerType !== 'all' ||
            localCategoryIds.length > 0 ||
            localRooms.length > 0 ||
            localMinPrice !== 0 ||
            localMaxPrice !== MAX_PRICE ||
            localMinArea !== 0 ||
            localMaxArea !== MAX_AREA ||
            localLocationMode !== null)
        : (localQuery.length > 0 ||
            localPhone.length > 0 ||
            localLanguages.length > 0 ||
            localPropertyTypes.length > 0);

    // Подсчёт активных фильтров
    const activeFiltersCount = isProperties
        ? [
            localMarkerType !== 'all',
            localCategoryIds.length > 0,
            localRooms.length > 0,
            localMinPrice !== 0 || localMaxPrice !== MAX_PRICE,
            localMinArea !== 0 || localMaxArea !== MAX_AREA,
            localLocationMode !== null,
        ].filter(Boolean).length
        : [
            localQuery.length > 0,
            localPhone.length > 0,
            localLanguages.length > 0,
            localPropertyTypes.length > 0,
        ].filter(Boolean).length;

    // Применение фильтров
    const handleApply = () => {
        if (isProperties) {
            setFilters({
                markerType: localMarkerType !== 'all' ? localMarkerType : undefined,
                categoryIds: localCategoryIds.length > 0 ? localCategoryIds : undefined,
                rooms: localRooms.length > 0 ? localRooms : undefined,
                minPrice: localMinPrice !== 0 ? localMinPrice : undefined,
                maxPrice: localMaxPrice !== MAX_PRICE ? localMaxPrice : undefined,
                minArea: localMinArea !== 0 ? localMinArea : undefined,
                maxArea: localMaxArea !== MAX_AREA ? localMaxArea : undefined,
            });
        } else {
            agencyFiltersStore.setFilters({
                query: localQuery || undefined,
                phone: localPhone || undefined,
                languages: localLanguages.length > 0 ? localLanguages : undefined,
                propertyTypes: localPropertyTypes.length > 0 ? localPropertyTypes : undefined,
            });
        }
        onOpenChange(false);
    };

    // Очистка фильтров
    const handleClear = () => {
        if (isProperties) {
            setLocalMarkerType('all');
            setLocalCategoryIds([]);
            setLocalRooms([]);
            setLocalMinPrice(0);
            setLocalMaxPrice(MAX_PRICE);
            setLocalMinArea(0);
            setLocalMaxArea(MAX_AREA);
            setLocalLocationMode(null);
        } else {
            setLocalQuery('');
            setLocalPhone('');
            setLocalLanguages([]);
            setLocalPropertyTypes([]);
        }
    };

    // Форматирование числа с разделителями
    const formatNumber = (num: number): string => {
        return num.toLocaleString('ru-RU');
    };

    // Обработка нажатия Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal по центру - улучшенная компоновка */}
            <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 md:pt-16 lg:pt-20">
                <div
                    className={cn(
                        'bg-background rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col',
                        'animate-in zoom-in-95 fade-in slide-in-from-top-4 duration-200',
                        'max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-10rem)]',
                        'border border-border'
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header - улучшенная визуализация */}
                    <div className="px-6 py-5 border-b border-border shrink-0 sticky top-0 bg-background rounded-t-2xl z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-brand-primary/10">
                                    <SlidersHorizontal className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary">{t('title')}</h2>
                                    {activeFiltersCount > 0 && (
                                        <p className="text-xs text-text-secondary mt-0.5">
                                            {t('activeFilters', { count: activeFiltersCount })}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-2.5 rounded-lg hover:bg-background-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                aria-label={t('cancel')}
                            >
                                <X className="w-5 h-5 text-text-secondary" />
                            </button>
                        </div>
                        
                        {/* Результатов - показываем прямо в хедере */}
                        {resultsCount !== null && (
                            <div className="mt-3 flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1.5 text-text-secondary">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                                    <span>
                                        {t('resultsFound', { count: formatNumber(resultsCount) })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Фильтры со скроллом - улучшенная компоновка */}
                    <div className="flex-1 overflow-y-auto px-6 py-3">
                        <div className="flex flex-col gap-1">
                            {isProperties ? (
                                <>
                                    {/* Группа: Локация - самая важная */}
                                    <div className="mb-2">
                                        <FilterSection id="location" title={t('categories.location')}>
                                            <div className="py-3">
                                                <LocationFilterMobile
                                                    value={localLocationMode}
                                                    onChange={setLocalLocationMode}
                                                    onLaunch={(mode: LocationFilterMode) => {
                                                        setLocationMode(mode);
                                                        onOpenChange(false);
                                                    }}
                                                />
                                            </div>
                                        </FilterSection>
                                    </div>

                                    {/* Группа: Основные параметры */}
                                    <div className="space-y-0">
                                        {/* Категория */}
                                        <FilterSection id="category" title={t('category')}>
                                            <div className="py-3">
                                                <CategoryFilterMobile
                                                    value={localCategoryIds}
                                                    onChange={setLocalCategoryIds}
                                                />
                                            </div>
                                        </FilterSection>

                                        {/* Цена */}
                                        <FilterSection id="price" title={t('categories.price')}>
                                            <div className="py-3">
                                                <PriceFilterMobile
                                                    minPrice={localMinPrice}
                                                    maxPrice={localMaxPrice}
                                                    onMinPriceChange={setLocalMinPrice}
                                                    onMaxPriceChange={setLocalMaxPrice}
                                                />
                                            </div>
                                        </FilterSection>

                                        {/* Комнаты */}
                                        <FilterSection id="rooms" title={t('categories.rooms')}>
                                            <div className="py-3">
                                                <RoomsFilterMobile
                                                    value={localRooms}
                                                    onChange={setLocalRooms}
                                                />
                                            </div>
                                        </FilterSection>

                                        {/* Площадь */}
                                        <FilterSection id="area" title={t('categories.area')}>
                                            <div className="py-3">
                                                <AreaFilterMobile
                                                    minArea={localMinArea}
                                                    maxArea={localMaxArea}
                                                    onMinAreaChange={setLocalMinArea}
                                                    onMaxAreaChange={setLocalMaxArea}
                                                />
                                            </div>
                                        </FilterSection>
                                    </div>

                                    {/* Группа: Дополнительные */}
                                    <div className="mt-2 pt-3 border-t border-border">
                                        <FilterSection id="marker-type" title={t('markerType')}>
                                            <div className="py-3">
                                                <MarkerTypeFilterMobile
                                                    value={localMarkerType}
                                                    onChange={setLocalMarkerType}
                                                />
                                            </div>
                                        </FilterSection>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Поиск по названию */}
                                    <FilterSection id="agency-name" title={tAgency('searchByName')}>
                                        <div className="py-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                                <Input
                                                    type="text"
                                                    placeholder={tAgency('namePlaceholder')}
                                                    value={localQuery}
                                                    onChange={(e) => setLocalQuery(e.target.value)}
                                                    className="h-11 text-sm pl-10"
                                                />
                                            </div>
                                        </div>
                                    </FilterSection>

                                    {/* Поиск по телефону */}
                                    <FilterSection id="agency-phone" title={tAgency('searchByPhone')}>
                                        <div className="py-3">
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                                <Input
                                                    type="tel"
                                                    placeholder={tAgency('phonePlaceholder')}
                                                    value={localPhone}
                                                    onChange={(e) => setLocalPhone(e.target.value)}
                                                    className="h-11 text-sm pl-10"
                                                />
                                            </div>
                                        </div>
                                    </FilterSection>

                                    {/* Языки */}
                                    <FilterSection id="agency-languages" title={tAgency('languages')}>
                                        <div className="py-3 space-y-2">
                                            {AVAILABLE_LANGUAGES.map((lang) => (
                                                <label
                                                    key={lang}
                                                    className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-background-tertiary rounded-md px-2 -mx-2 transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={localLanguages.includes(lang)}
                                                        onCheckedChange={() => {
                                                            setLocalLanguages((prev) =>
                                                                prev.includes(lang)
                                                                    ? prev.filter((l) => l !== lang)
                                                                    : [...prev, lang]
                                                            );
                                                        }}
                                                    />
                                                    <span className="text-sm text-text-primary">
                                                        {tLang(lang)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    {/* Типы недвижимости */}
                                    <FilterSection id="agency-property-types" title={tAgency('propertyTypes')}>
                                        <div className="py-3 space-y-2">
                                            {AGENCY_PROPERTY_TYPES.map((type) => (
                                                <label
                                                    key={type}
                                                    className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-background-tertiary rounded-md px-2 -mx-2 transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={localPropertyTypes.includes(type)}
                                                        onCheckedChange={() => {
                                                            setLocalPropertyTypes((prev) =>
                                                                prev.includes(type)
                                                                    ? prev.filter((t) => t !== type)
                                                                    : [...prev, type]
                                                            );
                                                        }}
                                                    />
                                                    <span className="text-sm text-text-primary">
                                                        {tAgency(`propertyType.${type}`)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    {/* Тип маркера для профессионалов */}
                                    <FilterSection id="marker-type" title={t('markerType')}>
                                        <div className="py-3">
                                            <MarkerTypeFilterMobile
                                                value={localMarkerType}
                                                onChange={setLocalMarkerType}
                                            />
                                        </div>
                                    </FilterSection>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sticky Footer - улучшенный дизайн */}
                    <div className="px-6 py-4 border-t border-border shrink-0 bg-background rounded-b-2xl">
                        <div className="flex items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClear}
                                disabled={!hasLocalChanges}
                                className="text-sm hover:text-error hover:bg-error/10"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('reset')}
                            </Button>

                            <div className="flex items-center gap-2">
                                {/* Показываем счетчик в футере для наглядности */}
                                {resultsCount !== null && !isLoadingCount && (
                                    <div className="text-sm text-text-secondary px-3">
                                        {formatNumber(resultsCount)}
                                    </div>
                                )}
                                
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={handleApply}
                                    disabled={isLoadingCount}
                                    className="min-w-[140px]"
                                >
                                    {isLoadingCount ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('loading')}
                                        </>
                                    ) : (
                                        <>
                                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                                            {t('show')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
