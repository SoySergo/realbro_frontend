'use client';

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    Search,
    SlidersHorizontal,
    Trash2,
    CloudUpload,
    CloudCheck,
    CloudCog,
    FingerprintIcon,
    X,
} from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { useFilterStore } from '../model/store';
import { useSidebarStore } from '@/widgets/sidebar';
import { getPropertiesCount } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';

// Импорты фильтров
import { MarkerTypeFilter, MarkerTypeFilterMobile } from '@/features/marker-type-filter';
import { LocationFilterButton, LocationFilterMobile } from '@/features/location-filter';
import { CategoryFilter, CategoryFilterMobile } from '@/features/category-filter';
import { PriceFilter, PriceFilterMobile } from '@/features/price-filter';
import { RoomsFilter, RoomsFilterMobile } from '@/features/rooms-filter';
import { AreaFilter, AreaFilterMobile } from '@/features/area-filter';
import type { LocationFilterMode } from '@/features/location-filter/model';

/**
 * Widget: Панель фильтров поиска недвижимости
 *
 * Адаптивная панель с фильтрами для ПК:
 * - ИИ агент (первая кнопка)
 * - Фильтры с адаптивной видимостью по breakpoints
 * - Кнопки: очистить, сохранить/обновить, показать
 *
 * Breakpoints:
 * - >= 1440px: все фильтры видны
 * - >= 1024px < 1440px: скрыта площадь
 * - >= 768px < 1024px: скрыты площадь и комнаты
 * - < 768px: мобильная версия (Sheet)
 */
function SearchFiltersBarContent() {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const tSidebar = useTranslations('sidebar');
    const { filtersCount, clearFilters, filters, setFilters } = useSearchFilters();
    const { currentFilters, setLocationMode } = useFilterStore();
    const { addQuery, updateQuery, activeQueryId, queries } = useSidebarStore();

    const [propertiesCount, setPropertiesCount] = useState<number | null>(null);
    const [isLoadingCount, setIsLoadingCount] = useState(false);
    const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
    const [isFiltersPopupOpen, setIsFiltersPopupOpen] = useState(false);
    const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [savedFiltersSnapshot, setSavedFiltersSnapshot] = useState<string | null>(null);

    // Константы для попапа фильтров
    const MAX_PRICE = 20_000;
    const MAX_AREA = 500;

    // Локальное состояние для попапа фильтров
    const [localMarkerType, setLocalMarkerType] = useState(filters.markerType || 'all');
    const [localCategoryIds, setLocalCategoryIds] = useState<number[]>(filters.categoryIds || []);
    const [localRooms, setLocalRooms] = useState<number[]>(filters.rooms || []);
    const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || 0);
    const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || MAX_PRICE);
    const [localMinArea, setLocalMinArea] = useState(filters.minArea || 0);
    const [localMaxArea, setLocalMaxArea] = useState(filters.maxArea || MAX_AREA);
    const [localLocationMode, setLocalLocationMode] = useState<LocationFilterMode | null>(null);

    const filtersContainerRef = useRef<HTMLDivElement>(null);

    // Синхронизация локального состояния при открытии попапа
    useEffect(() => {
        if (isFiltersPopupOpen) {
            setLocalMarkerType(filters.markerType || 'all');
            setLocalCategoryIds(filters.categoryIds || []);
            setLocalRooms(filters.rooms || []);
            setLocalMinPrice(filters.minPrice || 0);
            setLocalMaxPrice(filters.maxPrice || MAX_PRICE);
            setLocalMinArea(filters.minArea || 0);
            setLocalMaxArea(filters.maxArea || MAX_AREA);
            setLocalLocationMode(null);
        }
    }, [isFiltersPopupOpen]);

    // Проверка локальных изменений в попапе
    const hasLocalChanges =
        localMarkerType !== 'all' ||
        localCategoryIds.length > 0 ||
        localRooms.length > 0 ||
        localMinPrice !== 0 ||
        localMaxPrice !== MAX_PRICE ||
        localMinArea !== 0 ||
        localMaxArea !== MAX_AREA ||
        localLocationMode !== null;

    // Применение фильтров из попапа
    const handleApplyFiltersFromPopup = () => {
        setFilters({
            markerType: localMarkerType !== 'all' ? localMarkerType : undefined,
            categoryIds: localCategoryIds.length > 0 ? localCategoryIds : undefined,
            rooms: localRooms.length > 0 ? localRooms : undefined,
            minPrice: localMinPrice !== 0 ? localMinPrice : undefined,
            maxPrice: localMaxPrice !== MAX_PRICE ? localMaxPrice : undefined,
            minArea: localMinArea !== 0 ? localMinArea : undefined,
            maxArea: localMaxArea !== MAX_AREA ? localMaxArea : undefined,
        });
        setIsFiltersPopupOpen(false);
    };

    // Очистка локальных фильтров в попапе
    const handleClearLocalFilters = () => {
        setLocalMarkerType('all');
        setLocalCategoryIds([]);
        setLocalRooms([]);
        setLocalMinPrice(0);
        setLocalMaxPrice(MAX_PRICE);
        setLocalMinArea(0);
        setLocalMaxArea(MAX_AREA);
        setLocalLocationMode(null);
    };

    // Активный запрос (сохранённый фильтр)
    const activeQuery = useMemo(
        () => queries.find((q) => q.id === activeQueryId),
        [queries, activeQueryId]
    );

    // Текущие фильтры как строка для сравнения
    const currentFiltersSnapshot = useMemo(
        () => JSON.stringify({ ...filters, ...currentFilters }),
        [filters, currentFilters]
    );

    // При смене активного запроса - сохраняем snapshot
    useEffect(() => {
        if (activeQuery) {
            setSavedFiltersSnapshot(JSON.stringify(activeQuery.filters));
        } else {
            setSavedFiltersSnapshot(null);
        }
    }, [activeQuery?.id]);

    // Есть ли несохранённые изменения
    const hasUnsavedChanges = useMemo(() => {
        if (!activeQuery) {
            // Нет активного запроса - можно сохранить если есть фильтры
            return filtersCount > 0;
        }
        // Есть активный запрос - сравниваем с сохранённым состоянием
        return savedFiltersSnapshot !== currentFiltersSnapshot;
    }, [activeQuery, savedFiltersSnapshot, currentFiltersSnapshot, filtersCount]);

    const hasActiveFilters = filtersCount > 0;

    // Функция для получения количества объектов
    const fetchPropertiesCount = useCallback(async () => {
        setIsLoadingCount(true);
        try {
            const mergedFilters = { ...filters, ...currentFilters };
            const count = await getPropertiesCount(mergedFilters);
            setPropertiesCount(count);
        } catch (error) {
            console.error('Failed to fetch properties count:', error);
            setPropertiesCount(null);
        } finally {
            setIsLoadingCount(false);
        }
    }, [filters, currentFilters]);

    // Обновляем счётчик при изменении фильтров (с debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPropertiesCount();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [fetchPropertiesCount]);

    const handleReset = () => {
        clearFilters();
    };

    const handleShowResults = () => {
        // Логика показа результатов
    };

    const handleSave = () => {
        if (activeQuery) {
            // Обновляем существующий фильтр
            const mergedFilters = { ...filters, ...currentFilters };
            updateQuery(activeQueryId!, {
                filters: mergedFilters,
                resultsCount: propertiesCount ?? undefined,
            });
            setSavedFiltersSnapshot(JSON.stringify(mergedFilters));
        } else {
            // Открываем popover для ввода названия нового фильтра
            setIsSavePopoverOpen(true);
        }
    };

    const handleSaveNewFilter = () => {
        if (filterName.trim()) {
            const mergedFilters = { ...filters, ...currentFilters };
            addQuery({
                title: filterName.trim(),
                filters: mergedFilters,
                resultsCount: propertiesCount ?? undefined,
            });
            setFilterName('');
            setIsSavePopoverOpen(false);
        }
    };

    // Форматирование числа с разделителями
    const formatNumber = (num: number): string => {
        return num.toLocaleString('ru-RU');
    };

    // Иконка для кнопки сохранения
    const SaveIcon = activeQuery ? (hasUnsavedChanges ? CloudCog : CloudCheck) : CloudUpload;

    return (
        <div className="w-full bg-background-secondary border-b border-border relative z-50">
            <div className="flex items-center gap-2 px-4 py-2.5">
                {/* Кнопка ИИ агент - первая, синяя */}
                <Button
                    size="sm"
                    className="shrink-0 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                    <FingerprintIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('aiAgent')}</span>
                </Button>

                {/* Разделитель */}
                <div className="w-px h-6 bg-border shrink-0" />

                {/* Фильтр маркеров (ИИ статусы) */}
                <MarkerTypeFilter />

                {/* Основные фильтры - адаптивная видимость */}
                <div
                    ref={filtersContainerRef}
                    className="hidden md:flex items-center gap-2 flex-1 min-w-0"
                >
                    {/* Локация - всегда видна на md+ */}
                    <LocationFilterButton />

                    {/* Категория - всегда видна на md+ */}
                    <CategoryFilter />

                    {/* Цена - скрыта на < 1024px */}
                    <div className="hidden lg:block">
                        <PriceFilter />
                    </div>

                    {/* Комнаты - скрыты на < 1024px */}
                    <div className="hidden lg:block">
                        <RoomsFilter />
                    </div>

                    {/* Площадь - скрыта на < 1440px */}
                    <div className="hidden 2xl:block">
                        <AreaFilter />
                    </div>

                    {/* Блок кнопок действий - рядом с фильтрами */}
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                        {/* Кнопка "Все фильтры" - иконка фильтра */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsFiltersPopupOpen(true)}
                            className="text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10"
                            title={t('allFilters')}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </Button>

                        {/* Кнопка "Очистить" - иконка корзины */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleReset}
                            disabled={!hasActiveFilters}
                            className={cn(
                                "text-text-secondary",
                                hasActiveFilters && "hover:text-error hover:bg-error/10"
                            )}
                            title={t('clearAll')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>

                        {/* Кнопка "Сохранить/Обновить" */}
                        {activeQuery ? (
                            // Есть активный запрос - просто кнопка обновления
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges}
                                className={cn(
                                    "text-text-secondary",
                                    hasUnsavedChanges && "hover:text-brand-primary hover:bg-brand-primary/10"
                                )}
                                title={hasUnsavedChanges ? tCommon('save') : t('title')}
                            >
                                <SaveIcon className="w-4 h-4" />
                            </Button>
                        ) : (
                            // Нет активного запроса - popover для ввода названия
                            <Popover open={isSavePopoverOpen} onOpenChange={setIsSavePopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={!hasActiveFilters}
                                        className={cn(
                                            "text-text-secondary",
                                            hasActiveFilters && "hover:text-brand-primary hover:bg-brand-primary/10"
                                        )}
                                        title={tCommon('save')}
                                    >
                                        <CloudUpload className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-72 p-4">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm">{t('saveConfirmTitle')}</h4>
                                        <Input
                                            placeholder={t('title')}
                                            value={filterName}
                                            onChange={(e) => setFilterName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSaveNewFilter();
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setIsSavePopoverOpen(false);
                                                    setFilterName('');
                                                }}
                                            >
                                                {t('cancel')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveNewFilter}
                                                disabled={!filterName.trim()}
                                            >
                                                {tCommon('save')}
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Кнопка "Показать" с счётчиком */}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleShowResults}
                            disabled={isLoadingCount}
                            className={cn(
                                'bg-brand-primary hover:bg-brand-primary/90 text-white',
                                'min-w-[90px] justify-center'
                            )}
                        >
                            <Search className="w-4 h-4 mr-1.5" />
                            {isLoadingCount ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                <span>
                                    {propertiesCount !== null ? formatNumber(propertiesCount) : tCommon('show')}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Попап с полными фильтрами по центру экрана */}
            {isFiltersPopupOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 z-100 animate-in fade-in duration-150"
                        onClick={() => setIsFiltersPopupOpen(false)}
                    />

                    {/* Modal по центру */}
                    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
                        <div
                            className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in zoom-in-95 fade-in duration-150"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Заголовок */}
                            <div className="px-5 py-4 border-b border-border shrink-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-text-primary">{t('title')}</h2>
                                    <button
                                        onClick={() => setIsFiltersPopupOpen(false)}
                                        className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                                    >
                                        <X className="w-5 h-5 text-text-secondary" />
                                    </button>
                                </div>
                            </div>

                            {/* Фильтры со скроллом */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                <div className="flex flex-col gap-6">
                                    {/* Тип маркера */}
                                    <div className="w-full">
                                        <Label className="text-sm font-medium text-text-primary mb-3 block">
                                            {t('markerType')}
                                        </Label>
                                        <MarkerTypeFilterMobile
                                            value={localMarkerType}
                                            onChange={setLocalMarkerType}
                                        />
                                    </div>

                                    {/* Локация */}
                                    <div className="w-full">
                                        <Label className="text-sm font-medium text-text-primary mb-3 block">
                                            {t('location')}
                                        </Label>
                                        <LocationFilterMobile
                                            value={localLocationMode}
                                            onChange={setLocalLocationMode}
                                            onLaunch={(mode: LocationFilterMode) => {
                                                setLocationMode(mode);
                                                setIsFiltersPopupOpen(false);
                                            }}
                                        />
                                    </div>

                                    {/* Категория */}
                                    <div className="w-full">
                                        <Label className="text-sm font-medium text-text-primary mb-3 block">
                                            {t('category')}
                                        </Label>
                                        <CategoryFilterMobile
                                            value={localCategoryIds}
                                            onChange={setLocalCategoryIds}
                                        />
                                    </div>

                                    {/* Цена */}
                                    <div className="w-full">
                                        <Label className="text-sm font-medium text-text-primary mb-3 block">
                                            {t('priceRange')}
                                        </Label>
                                        <PriceFilterMobile
                                            minPrice={localMinPrice}
                                            maxPrice={localMaxPrice}
                                            onMinPriceChange={setLocalMinPrice}
                                            onMaxPriceChange={setLocalMaxPrice}
                                        />
                                    </div>

                                    {/* Комнаты */}
                                    <div className="w-full">
                                        <Label className="text-sm font-medium text-text-primary mb-3 block">
                                            {t('rooms')}
                                        </Label>
                                        <RoomsFilterMobile
                                            value={localRooms}
                                            onChange={setLocalRooms}
                                        />
                                    </div>

                                    {/* Площадь */}
                                    <div className="w-full">
                                        <Label className="text-sm font-medium text-text-primary mb-3 block">
                                            {t('areaRange')}
                                        </Label>
                                        <AreaFilterMobile
                                            minArea={localMinArea}
                                            maxArea={localMaxArea}
                                            onMinAreaChange={setLocalMinArea}
                                            onMaxAreaChange={setLocalMaxArea}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Футер с кнопками */}
                            <div className="px-5 py-4 border-t border-border shrink-0 bg-background rounded-b-xl">
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleClearLocalFilters}
                                        className="flex-1 h-11"
                                        variant="ghost"
                                        disabled={!hasLocalChanges}
                                    >
                                        {t('clear')}
                                    </Button>
                                    <Button
                                        onClick={handleApplyFiltersFromPopup}
                                        className="flex-1 h-11 bg-brand-primary text-white"
                                        variant="default"
                                    >
                                        {t('apply')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function SearchFiltersBar() {
    return (
        <Suspense fallback={
            <div className="w-full bg-background-secondary border-b border-border">
                <div className="flex items-center gap-2 px-4 py-2.5">
                    <div className="h-8 w-24 bg-background animate-pulse rounded" />
                    <div className="h-8 w-32 bg-background animate-pulse rounded" />
                    <div className="h-8 w-20 bg-background animate-pulse rounded" />
                </div>
            </div>
        }>
            <SearchFiltersBarContent />
        </Suspense>
    );
}
