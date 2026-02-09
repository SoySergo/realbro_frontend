'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { X, Loader2, Search, Phone } from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { useAgencyFilters } from '@/features/agency-filters';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { SearchCategorySwitcher } from '@/features/search-category';
import type { SearchCategory } from '@/features/search-category';
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

// Константы
const MAX_PRICE = 20_000;
const MAX_AREA = 500;

interface MobileFiltersSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentCategory?: SearchCategory;
}

/**
 * Мобильная версия панели фильтров с улучшенным UI/UX
 * 
 * Особенности:
 * - Full-screen bottom sheet
 * - Drag handle сверху
 * - Accordion-стиль для категорий фильтров
 * - Sticky footer с динамическим подсчётом результатов
 * - Локальное состояние - изменения применяются только по кнопке "Показать N вариантов"
 * - Touch-friendly размеры элементов (минимум 44px)
 */
export function MobileFiltersSheet({ open, onOpenChange, currentCategory = 'properties' }: MobileFiltersSheetProps) {
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

    // Блокировка скролла body при открытых фильтрах
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

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

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 animate-in fade-in duration-75"
                style={{ zIndex: 110 }}
                onClick={() => onOpenChange(false)}
            />

            {/* Content */}
            <div
                className="fixed inset-0 bg-background flex flex-col animate-in slide-in-from-bottom duration-300"
                style={{ zIndex: 120 }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-2 pb-1 shrink-0">
                    <div className="w-12 h-1 rounded-full bg-text-tertiary" />
                </div>

                {/* Заголовок - улучшенный */}
                <div className="px-4 py-4 border-b border-border shrink-0 bg-background">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">{t('title')}</h2>
                            {resultsCount !== null && (
                                <p className="text-xs text-text-secondary mt-1">
                                    {t('resultsFound', { count: formatNumber(resultsCount) })}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2.5 rounded-lg hover:bg-background-tertiary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label={t('cancel')}
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>
                    
                    {/* Переключатель категорий - в хедере */}
                    <SearchCategorySwitcher
                        currentCategory={currentCategory}
                        locale={locale}
                        className="w-full"
                    />
                </div>

                {/* Фильтры в вертикальной компоновке со скроллом */}
                <div
                    className="flex-1 overflow-y-auto px-4 py-2"
                    onScroll={() => {
                        // Скрываем клавиатуру при скролле на мобильных
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                    }}
                >
                    <div className="flex flex-col gap-1">{isProperties ? (
                                <>
                                    {/* Локация - в приоритете */}
                                    <div className="mb-1">
                                        <FilterSection id="location" title={t('categories.location')}>
                                            <div className="py-4">
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

                                    {/* Основные фильтры */}
                                    <FilterSection id="category" title={t('category')}>
                                        <div className="py-4">
                                            <CategoryFilterMobile
                                                value={localCategoryIds}
                                                onChange={setLocalCategoryIds}
                                            />
                                        </div>
                                    </FilterSection>

                                    <FilterSection id="price" title={t('categories.price')}>
                                        <div className="py-4">
                                            <PriceFilterMobile
                                                minPrice={localMinPrice}
                                                maxPrice={localMaxPrice}
                                                onMinPriceChange={setLocalMinPrice}
                                                onMaxPriceChange={setLocalMaxPrice}
                                            />
                                        </div>
                                    </FilterSection>

                                    <FilterSection id="rooms" title={t('categories.rooms')}>
                                        <div className="py-4">
                                            <RoomsFilterMobile
                                                value={localRooms}
                                                onChange={setLocalRooms}
                                            />
                                        </div>
                                    </FilterSection>

                                    <FilterSection id="area" title={t('categories.area')}>
                                        <div className="py-4">
                                            <AreaFilterMobile
                                                minArea={localMinArea}
                                                maxArea={localMaxArea}
                                                onMinAreaChange={setLocalMinArea}
                                                onMaxAreaChange={setLocalMaxArea}
                                            />
                                        </div>
                                    </FilterSection>

                                    {/* Дополнительные - отдельная группа */}
                                    <div className="mt-2 pt-3 border-t border-border">
                                        <FilterSection id="marker-type" title={t('markerType')}>
                                            <div className="py-4">
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
                                    {/* Фильтры профессионалов */}
                                    <FilterSection id="agency-name" title={tAgency('searchByName')}>
                                        <div className="py-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                                <Input
                                                    type="text"
                                                    placeholder={tAgency('namePlaceholder')}
                                                    value={localQuery}
                                                    onChange={(e) => setLocalQuery(e.target.value)}
                                                    className="h-11 min-h-[44px] text-base pl-10"
                                                />
                                            </div>
                                        </div>
                                    </FilterSection>

                                    <FilterSection id="agency-phone" title={tAgency('searchByPhone')}>
                                        <div className="py-4">
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                                <Input
                                                    type="tel"
                                                    placeholder={tAgency('phonePlaceholder')}
                                                    value={localPhone}
                                                    onChange={(e) => setLocalPhone(e.target.value)}
                                                    className="h-11 min-h-[44px] text-base pl-10"
                                                />
                                            </div>
                                        </div>
                                    </FilterSection>

                                    <FilterSection id="agency-languages" title={tAgency('languages')}>
                                        <div className="py-4 space-y-2">
                                            {AVAILABLE_LANGUAGES.map((lang) => (
                                                <label
                                                    key={lang}
                                                    className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-background-tertiary rounded-md px-2 -mx-2 transition-colors min-h-[44px]"
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
                                                    <span className="text-base text-text-primary">
                                                        {tLang(lang)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection id="agency-property-types" title={tAgency('propertyTypes')}>
                                        <div className="py-4 space-y-2">
                                            {AGENCY_PROPERTY_TYPES.map((type) => (
                                                <label
                                                    key={type}
                                                    className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-background-tertiary rounded-md px-2 -mx-2 transition-colors min-h-[44px]"
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
                                                    <span className="text-base text-text-primary">
                                                        {tAgency(`propertyType.${type}`)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <div className="mt-2 pt-3 border-t border-border">
                                        <FilterSection id="marker-type" title={t('markerType')}>
                                            <div className="py-4">
                                                <MarkerTypeFilterMobile
                                                     value={localMarkerType}
                                                    onChange={setLocalMarkerType}
                                                />
                                            </div>
                                        </FilterSection>
                                    </div>
                                </>
                            )}
                    </div>
                </div>

                {/* Sticky Footer - улучшенный */}
                <div className="sticky bottom-0 px-4 py-3 border-t border-border bg-background shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                    style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
                >
                    <div className="flex gap-3">
                        <Button
                            onClick={handleClear}
                            variant="ghost"
                            disabled={!hasLocalChanges}
                            className="text-text-secondary hover:text-error hover:bg-error/10 min-h-[48px]"
                        >
                            {t('reset')}
                        </Button>
                        <Button
                            onClick={handleApply}
                            variant="default"
                            className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium min-h-[48px]"
                            disabled={isLoadingCount}
                        >
                            {isLoadingCount ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('loading')}
                                </>
                            ) : (
                                <>
                                    {resultsCount !== null && resultsCount > 0
                                        ? t('showResults', { count: formatNumber(resultsCount) })
                                        : resultsCount === 0
                                        ? t('noResults')
                                        : t('show')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
