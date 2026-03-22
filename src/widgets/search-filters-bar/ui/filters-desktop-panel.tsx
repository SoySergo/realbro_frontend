'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { X, Loader2, Search, Phone, Trash2, Building2, Users, MapPin, ListTree, Map, Pencil, Circle, Clock } from 'lucide-react';
import { useFilters } from '@/features/search-filters/model/use-filters';
import { useActiveLocationMode, useSetLocationMode } from '@/features/search-filters/model/use-location-mode';
import { useAgencyFilters } from '@/features/agency-filters';
import { useAuth } from '@/features/auth';
import { RoomsFilterMobile } from '@/features/rooms-filter';
import { PriceFilterMobile } from '@/features/price-filter';
import { AreaFilterMobile } from '@/features/area-filter';
import type { LocationFilterMode } from '@/features/location-filter/model';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/popover';
import { getPropertiesCount, getAgenciesCount, getCategories, getSubcategories, searchLocations } from '@/shared/api';
import type { MapboxLocation } from '@/entities/location';
import type { Category, Subcategory } from '@/shared/api/dictionaries';
import { AVAILABLE_LANGUAGES, AGENCY_PROPERTY_TYPES } from '@/entities/agency';
import type { AgencyPropertyType } from '@/entities/agency';
import type { MarkerType } from '@/entities/filter';
import type { SearchCategory } from '@/features/search-category';
import { cn } from '@/shared/lib/utils';

// Типы
type PropertyClass = 'residential' | 'commercial' | 'land';
type DealType = 'rent' | 'sale';

const markerOptions: { value: MarkerType; labelKey: string }[] = [
    { value: 'all', labelKey: 'all' },
    { value: 'like', labelKey: 'like' },
    { value: 'dislike', labelKey: 'dislike' },
    { value: 'view', labelKey: 'view' },
    { value: 'no_view', labelKey: 'noView' },
    { value: 'saved', labelKey: 'saved' },
    { value: 'to_review', labelKey: 'toReview' },
    { value: 'to_think', labelKey: 'toThink' },
];

// Константы
const MAX_PRICE = 20_000;
const MAX_AREA = 500;

interface FiltersDesktopPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentCategory?: SearchCategory;
    onCategoryChange?: (category: SearchCategory) => void;
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
export function FiltersDesktopPanel({ open, onOpenChange, currentCategory = 'properties', onCategoryChange }: FiltersDesktopPanelProps) {
    const t = useTranslations('filters');
    const tCategory = useTranslations('searchCategory');
    const tAgency = useTranslations('agency');
    const tLang = useTranslations('languages');
    const locale = useLocale();
    const { filters, setFilters, clearFilters } = useFilters();
    const agencyFiltersStore = useAgencyFilters();
    const activeLocationMode = useActiveLocationMode();
    const setLocationMode = useSetLocationMode();
    const { isAuthenticated } = useAuth();

    const [localCategory, setLocalCategory] = useState<SearchCategory>(currentCategory);

    const isProperties = localCategory === 'properties';

    const handleCategoryChange = (category: SearchCategory) => {
        setLocalCategory(category);
        onCategoryChange?.(category);
    };

    // Локальное состояние для фильтров недвижимости
    const [localMarkerType, setLocalMarkerType] = useState<MarkerType>(filters.markerType || 'all');
    const [localPropertyClass, setLocalPropertyClass] = useState<PropertyClass>('residential');
    const [localDealType, setLocalDealType] = useState<DealType>('rent');
    const [localCategoryIds, setLocalCategoryIds] = useState<number[]>(filters.categoryIds || []);
    const [localSubCategoryIds, setLocalSubCategoryIds] = useState<number[]>(filters.subCategories || []);
    const [localRooms, setLocalRooms] = useState<number[]>(filters.rooms || []);
    const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || 0);
    const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || MAX_PRICE);
    const [localMinArea, setLocalMinArea] = useState(filters.minArea || 0);
    const [localMaxArea, setLocalMaxArea] = useState(filters.maxArea || MAX_AREA);
    const [localLocationMode, setLocalLocationMode] = useState<LocationFilterMode | null>(activeLocationMode);

    // Поиск локации
    const [locationQuery, setLocationQuery] = useState('');
    const [locationResults, setLocationResults] = useState<MapboxLocation[]>([]);
    const [isLocationSearching, setIsLocationSearching] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const locationInputRef = useRef<HTMLInputElement>(null);

    // Для переоткрытия попапа после карты
    const pendingFilterReopenRef = useRef(false);

    // Субкатегории Popover
    const [subcatPopoverOpen, setSubcatPopoverOpen] = useState(false);

    // Категории и подкатегории с бекенда
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState(false);

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
            setLocalMarkerType((filters.markerType as MarkerType) || 'all');
            setLocalCategoryIds(filters.categoryIds || []);
            setLocalSubCategoryIds(filters.subCategories || []);
            setLocalRooms(filters.rooms || []);
            setLocalMinPrice(filters.minPrice || 0);
            setLocalMaxPrice(filters.maxPrice || MAX_PRICE);
            setLocalMinArea(filters.minArea || 0);
            setLocalMaxArea(filters.maxArea || MAX_AREA);
            setLocalLocationMode(activeLocationMode);
            setLocalCategory(currentCategory);
            // Синхронизация фильтров профессионалов
            setLocalQuery(agencyFiltersStore.filters.query || '');
            setLocalPhone(agencyFiltersStore.filters.phone || '');
            setLocalLanguages(agencyFiltersStore.filters.languages || []);
            setLocalPropertyTypes(agencyFiltersStore.filters.propertyTypes || []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Загрузка категорий с бекенда
    useEffect(() => {
        if (open && isProperties) {
            setIsCategoriesLoading(true);
            getCategories(locale).then((data) => {
                setCategories(data);
                setIsCategoriesLoading(false);
            });
        }
    }, [open, isProperties, locale]);

    // Загрузка подкатегорий при смене категорий
    useEffect(() => {
        if (localCategoryIds.length > 0) {
            setIsSubcategoriesLoading(true);
            Promise.all(
                localCategoryIds.map((catId) => getSubcategories(catId, locale))
            ).then((results) => {
                setSubcategories(results.flat());
                setIsSubcategoriesLoading(false);
                // Убираем выбранные подкатегории, которых больше нет
                setLocalSubCategoryIds((prev) => {
                    const allIds = new Set(results.flat().map((s) => s.id));
                    return prev.filter((id) => allIds.has(id));
                });
            });
        } else {
            setSubcategories([]);
            setLocalSubCategoryIds([]);
        }
    }, [localCategoryIds, locale]);

    // Функция для получения количества результатов
    const fetchResultsCount = useCallback(async () => {
        setIsLoadingCount(true);
        try {
            if (isProperties) {
                const mergedFilters = {
                    ...filters,
                    markerType: localMarkerType !== 'all' ? localMarkerType : undefined,
                    categoryIds: localCategoryIds.length > 0 ? localCategoryIds : undefined,
                    subCategories: localSubCategoryIds.length > 0 ? localSubCategoryIds : undefined,
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
    }, [isProperties, localMarkerType, localCategoryIds, localSubCategoryIds, localRooms, localMinPrice, localMaxPrice, localMinArea, localMaxArea, filters, localQuery, localPhone, localLanguages, localPropertyTypes, agencyFiltersStore.filters, locale]);

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
            localSubCategoryIds.length > 0,
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
                subCategories: localSubCategoryIds.length > 0 ? localSubCategoryIds : undefined,
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
            setLocalSubCategoryIds([]);
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

    // Поиск локации с debounce
    useEffect(() => {
        if (locationQuery.trim().length < 2) {
            setLocationResults([]);
            setShowLocationDropdown(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLocationSearching(true);
            try {
                const results = await searchLocations({
                    query: locationQuery,
                    language: locale,
                    limit: 8,
                });
                setLocationResults(results);
                setShowLocationDropdown(results.length > 0);
            } catch {
                setLocationResults([]);
            } finally {
                setIsLocationSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [locationQuery, locale]);

    // Переоткрытие фильтров после выхода из режима карты
    useEffect(() => {
        if (pendingFilterReopenRef.current && activeLocationMode === null && !open) {
            pendingFilterReopenRef.current = false;
            onOpenChange(true);
        }
    }, [activeLocationMode, open, onOpenChange]);

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
                className="fixed inset-0 bg-black/40 z-[100] animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />

            {/* Панель фильтров — по центру */}
            <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-12">
                <div
                    className={cn(
                        'bg-background rounded-2xl shadow-2xl w-full max-w-[640px] flex flex-col',
                        'animate-in zoom-in-95 fade-in slide-in-from-top-4 duration-200',
                        'max-h-[calc(100vh-6rem)]'
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">{t('title')}</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                            aria-label={t('cancel')}
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                        {/* Тип — всегда виден */}
                        <section>
                            <h3 className="text-sm font-medium text-text-primary mb-3">{t('propertyType')}</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCategoryChange('properties')}
                                    className={cn(
                                        'flex flex-col items-center gap-2 px-6 py-4 rounded-xl border-2 transition-all w-[120px]',
                                        localCategory === 'properties'
                                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                            : 'border-border text-text-secondary hover:border-text-tertiary'
                                    )}
                                >
                                    <Building2 className="w-7 h-7" />
                                    <span className="text-sm font-medium">{tCategory('properties')}</span>
                                </button>
                                <button
                                    onClick={() => handleCategoryChange('professionals')}
                                    className={cn(
                                        'flex flex-col items-center gap-2 px-6 py-4 rounded-xl border-2 transition-all w-[120px]',
                                        localCategory === 'professionals'
                                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                            : 'border-border text-text-secondary hover:border-text-tertiary'
                                    )}
                                >
                                    <Users className="w-7 h-7" />
                                    <span className="text-sm font-medium">{tCategory('professionals')}</span>
                                </button>
                            </div>
                        </section>

                        {isProperties ? (
                            <>
                                {/* Маркеры (auth only) */}
                                <section>
                                    <h3 className="text-sm font-medium text-text-primary mb-3">{t('markerType.all')}</h3>
                                    <div className="flex gap-3">
                                        <Select
                                            value={localMarkerType}
                                            onValueChange={(value) => setLocalMarkerType(value as MarkerType)}
                                        >
                                            <SelectTrigger className="h-10 flex-1 text-sm">
                                                <SelectValue>
                                                    {t(`markerType.${markerOptions.find(o => o.value === localMarkerType)?.labelKey || 'all'}`)}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {markerOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {t(`markerType.${opt.labelKey}`)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </section>

                                {/* Класс + Тип сделки + Категория */}
                                <section>
                                    <h3 className="text-sm font-medium text-text-primary mb-3">{t('propertyClass')}</h3>
                                    <div className="flex gap-3">
                                        <Select value={localPropertyClass} disabled>
                                            <SelectTrigger className="h-10 flex-1 text-sm">
                                                <SelectValue>
                                                    {t(`propertyClassResidential`)}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="residential">{t('propertyClassResidential')}</SelectItem>
                                                <SelectItem value="commercial">{t('propertyClassCommercial')}</SelectItem>
                                                <SelectItem value="land">{t('propertyClassLand')}</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={localDealType} disabled>
                                            <SelectTrigger className="h-10 flex-1 text-sm">
                                                <SelectValue>
                                                    {t('dealTypeRent')}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rent">{t('dealTypeRent')}</SelectItem>
                                                <SelectItem value="sale">{t('dealTypeSale')}</SelectItem>
                                            </SelectContent>
                                        </Select>

                                    </div>

                                    {/* Категория — чекбоксы */}
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-text-primary mb-2">{t('category')}</h3>
                                        {isCategoriesLoading ? (
                                            <div className="flex items-center justify-center py-3">
                                                <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-1">
                                                {categories.map((cat) => (
                                                    <label
                                                        key={cat.id}
                                                        className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-background-secondary rounded-md px-2 transition-colors"
                                                    >
                                                        <Checkbox
                                                            checked={localCategoryIds.includes(cat.id)}
                                                            onCheckedChange={() => {
                                                                setLocalCategoryIds((prev) =>
                                                                    prev.includes(cat.id)
                                                                        ? prev.filter((id) => id !== cat.id)
                                                                        : [...prev, cat.id]
                                                                );
                                                            }}
                                                        />
                                                        <span className="text-sm text-text-primary">
                                                            {cat.translated_name || cat.slug}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Субкатегория — Popover мультиселект с группировкой по категории */}
                                    {localCategoryIds.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="text-sm font-medium text-text-primary mb-2">{t('subcategory')}</h3>
                                            <Popover open={subcatPopoverOpen} onOpenChange={setSubcatPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <button className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-transparent text-sm shadow-xs hover:bg-background-secondary transition-colors w-[200px]">
                                                        {isSubcategoriesLoading
                                                            ? <Loader2 className="w-4 h-4 animate-spin text-brand-primary shrink-0" />
                                                            : <ListTree className="w-4 h-4 text-brand-primary shrink-0" />
                                                        }
                                                        <span className="truncate text-left flex-1">
                                                            {localSubCategoryIds.length > 0
                                                                ? subcategories
                                                                    .filter(s => localSubCategoryIds.includes(s.id))
                                                                    .map(s => s.translated_name || s.slug)
                                                                    .join(', ')
                                                                : t('subcategory')}
                                                        </span>
                                                        <svg className="size-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="z-[200] w-[240px] p-2 max-h-[280px] overflow-y-auto">
                                                    {isSubcategoriesLoading ? (
                                                        <div className="flex items-center justify-center py-3">
                                                            <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
                                                        </div>
                                                    ) : subcategories.length === 0 ? (
                                                        <div className="px-2 py-3 text-sm text-text-tertiary text-center">
                                                            —
                                                        </div>
                                                    ) : (
                                                        localCategoryIds.map((catId) => {
                                                            const cat = categories.find(c => c.id === catId);
                                                            const catSubs = subcategories.filter(s => s.category_id === catId);
                                                            if (catSubs.length === 0) return null;
                                                            return (
                                                                <div key={catId}>
                                                                    {localCategoryIds.length > 1 && (
                                                                        <div className="px-2 pt-2 pb-1 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                                                                            {cat?.translated_name || cat?.slug}
                                                                        </div>
                                                                    )}
                                                                    {catSubs.map((sub) => (
                                                                        <label
                                                                            key={sub.id}
                                                                            className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-background-secondary rounded-md px-2 transition-colors"
                                                                        >
                                                                            <Checkbox
                                                                                checked={localSubCategoryIds.includes(sub.id)}
                                                                                onCheckedChange={() => {
                                                                                    setLocalSubCategoryIds((prev) =>
                                                                                        prev.includes(sub.id)
                                                                                            ? prev.filter((id) => id !== sub.id)
                                                                                            : [...prev, sub.id]
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <span className="text-sm text-text-primary">
                                                                                {sub.translated_name || sub.slug}
                                                                            </span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </section>

                                {/* Локация */}
                                <section>
                                    <h3 className="text-sm font-medium text-text-primary mb-3">{t('location')}</h3>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                                            <Input
                                                ref={locationInputRef}
                                                value={locationQuery}
                                                onChange={(e) => setLocationQuery(e.target.value)}
                                                placeholder={t('searchPlaceholder')}
                                                className="h-10 pl-9 text-sm"
                                            />
                                            {isLocationSearching && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-text-tertiary" />
                                            )}
                                            {showLocationDropdown && locationResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md z-[200] max-h-[200px] overflow-y-auto">
                                                    {locationResults.map((loc) => (
                                                        <button
                                                            key={loc.id}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-background-secondary transition-colors"
                                                            onClick={() => {
                                                                setLocationQuery(loc.name);
                                                                setShowLocationDropdown(false);
                                                                setLocationResults([]);
                                                            }}
                                                        >
                                                            <MapPin className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="truncate">{loc.name}</span>
                                                                {loc.context && (
                                                                    <span className="text-xs text-text-tertiary truncate">{loc.context}</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] uppercase tracking-wide text-text-tertiary bg-background-secondary rounded px-1.5 py-0.5 shrink-0">
                                                                {t(`locationType${loc.placeType === 'place' ? 'City' : loc.placeType === 'country' ? 'Country' : loc.placeType === 'region' ? 'Region' : loc.placeType === 'district' ? 'District' : loc.placeType === 'neighborhood' ? 'Neighborhood' : loc.placeType === 'locality' ? 'Place' : 'Place'}`)}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="h-10 gap-2 text-sm shrink-0"
                                            onClick={() => {
                                                pendingFilterReopenRef.current = true;
                                                setLocationMode('search');
                                                onOpenChange(false);
                                            }}
                                        >
                                            <Map className="w-4 h-4" />
                                            {t('viewMap')}
                                        </Button>
                                    </div>

                                    {/* Активные геометрии (polygon/isochrone/radius) */}
                                    {(filters.polygonIds?.length || filters.isochroneIds?.length || filters.radiusIds?.length) ? (
                                        <div className="mt-3 space-y-1.5">
                                            {filters.polygonIds?.map((id) => (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-secondary group cursor-pointer hover:bg-background-tertiary transition-colors"
                                                    onClick={() => {
                                                        pendingFilterReopenRef.current = true;
                                                        setLocationMode('draw');
                                                        onOpenChange(false);
                                                    }}
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                                    <span className="text-sm text-text-primary truncate flex-1">
                                                        {t('drawnArea')}
                                                    </span>
                                                    <button
                                                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-background transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFilters({
                                                                polygonIds: filters.polygonIds?.filter(pid => pid !== id),
                                                            });
                                                        }}
                                                    >
                                                        <X className="w-3.5 h-3.5 text-text-tertiary" />
                                                    </button>
                                                </div>
                                            ))}
                                            {filters.radiusIds?.map((id) => (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-secondary group cursor-pointer hover:bg-background-tertiary transition-colors"
                                                    onClick={() => {
                                                        pendingFilterReopenRef.current = true;
                                                        setLocationMode('radius');
                                                        onOpenChange(false);
                                                    }}
                                                >
                                                    <Circle className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                                    <span className="text-sm text-text-primary truncate flex-1">
                                                        {t('radiusFilter')}
                                                    </span>
                                                    <button
                                                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-background transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFilters({
                                                                radiusIds: filters.radiusIds?.filter(rid => rid !== id),
                                                            });
                                                        }}
                                                    >
                                                        <X className="w-3.5 h-3.5 text-text-tertiary" />
                                                    </button>
                                                </div>
                                            ))}
                                            {filters.isochroneIds?.map((id) => (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-secondary group cursor-pointer hover:bg-background-tertiary transition-colors"
                                                    onClick={() => {
                                                        pendingFilterReopenRef.current = true;
                                                        setLocationMode('isochrone');
                                                        onOpenChange(false);
                                                    }}
                                                >
                                                    <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                                    <span className="text-sm text-text-primary truncate flex-1">
                                                        {t('isochroneFilter')}
                                                    </span>
                                                    <button
                                                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-background transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFilters({
                                                                isochroneIds: filters.isochroneIds?.filter(iid => iid !== id),
                                                            });
                                                        }}
                                                    >
                                                        <X className="w-3.5 h-3.5 text-text-tertiary" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </section>

                                {/* Цена и Площадь — в два столбца */}
                                <div className="grid grid-cols-2 gap-4">
                                    <section>
                                        <h3 className="text-sm font-medium text-text-primary mb-3">{t('price')}</h3>
                                        <PriceFilterMobile
                                            minPrice={localMinPrice}
                                            maxPrice={localMaxPrice}
                                            onMinPriceChange={setLocalMinPrice}
                                            onMaxPriceChange={setLocalMaxPrice}
                                        />
                                    </section>
                                    <section>
                                        <h3 className="text-sm font-medium text-text-primary mb-3">{t('area')}</h3>
                                        <AreaFilterMobile
                                            minArea={localMinArea}
                                            maxArea={localMaxArea}
                                            onMinAreaChange={setLocalMinArea}
                                            onMaxAreaChange={setLocalMaxArea}
                                        />
                                    </section>
                                </div>

                                {/* Количество комнат — скрываем если выбрана только категория "комната" */}
                                {!(localCategoryIds.length === 1 && localCategoryIds[0] === categories.find(c => c.slug === 'room')?.id) && (
                                    <section>
                                        <h3 className="text-sm font-medium text-text-primary mb-3">{t('roomCount')}</h3>
                                        <RoomsFilterMobile
                                            value={localRooms}
                                            onChange={setLocalRooms}
                                            className="gap-1"
                                        />
                                    </section>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Поиск по названию */}
                                <section>
                                    <h3 className="text-sm font-medium text-text-primary mb-3">{tAgency('searchByName')}</h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                        <Input
                                            type="text"
                                            placeholder={tAgency('namePlaceholder')}
                                            value={localQuery}
                                            onChange={(e) => setLocalQuery(e.target.value)}
                                            className="h-10 text-sm pl-10"
                                        />
                                    </div>
                                </section>

                                {/* Поиск по телефону */}
                                <section>
                                    <h3 className="text-sm font-medium text-text-primary mb-3">{tAgency('searchByPhone')}</h3>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                        <Input
                                            type="tel"
                                            placeholder={tAgency('phonePlaceholder')}
                                            value={localPhone}
                                            onChange={(e) => setLocalPhone(e.target.value)}
                                            className="h-10 text-sm pl-10"
                                        />
                                    </div>
                                </section>

                                {/* Языки */}
                                <section>
                                    <h3 className="text-sm font-medium text-text-primary mb-3">{tAgency('languages')}</h3>
                                    <div className="space-y-1.5">
                                        {AVAILABLE_LANGUAGES.map((lang) => (
                                            <label
                                                key={lang}
                                                className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-background-secondary rounded-md px-2 -mx-2 transition-colors"
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
                                </section>

                                {/* Типы недвижимости */}
                                <section>
                                    <h3 className="text-sm font-medium text-text-primary mb-3">{tAgency('propertyTypes')}</h3>
                                    <div className="space-y-1.5">
                                        {AGENCY_PROPERTY_TYPES.map((type) => (
                                            <label
                                                key={type}
                                                className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-background-secondary rounded-md px-2 -mx-2 transition-colors"
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
                                                    {tAgency(`propertyTypesLabels.${type}`)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-border shrink-0">
                        <div className="flex items-center justify-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                disabled={!hasLocalChanges}
                                className="text-sm gap-2 text-text-secondary hover:text-error hover:bg-error/10 [&:not(:disabled)]:text-error"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('clear')}
                            </Button>

                            <Button
                                type="button"
                                onClick={handleApply}
                                disabled={isLoadingCount}
                                className="w-[200px] bg-brand-primary hover:bg-brand-primary-hover text-white justify-center gap-2 disabled:opacity-100 disabled:bg-brand-primary disabled:text-white overflow-hidden"
                            >
                                <span>{t('show')}</span>
                                <span className={cn(
                                    'inline-flex items-center justify-center tabular-nums w-[40px] transition-opacity duration-300',
                                    isLoadingCount && 'opacity-40'
                                )}>
                                    <span
                                        key={resultsCount}
                                        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    >
                                        {resultsCount != null ? formatNumber(resultsCount) : '...'}
                                    </span>
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
