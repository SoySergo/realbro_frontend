'use client';

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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

// Импорт переключателя категории поиска
import { SearchCategorySwitcher } from '@/features/search-category';

// Импорты фильтров
import { MarkerTypeFilter, MarkerTypeFilterMobile } from '@/features/marker-type-filter';
import { LocationFilterButton, LocationFilterMobile } from '@/features/location-filter';
import { CategoryFilter, CategoryFilterMobile } from '@/features/category-filter';
import { PriceFilter, PriceFilterMobile } from '@/features/price-filter';
import { RoomsFilter, RoomsFilterMobile } from '@/features/rooms-filter';
import { AreaFilter, AreaFilterMobile } from '@/features/area-filter';
import type { LocationFilterMode } from '@/features/location-filter/model';

// Импорт улучшенной панели фильтров для desktop
import { FiltersDesktopPanel } from './filters-desktop-panel';

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
    const locale = useLocale();
    const { filtersCount, clearFilters, filters, setFilters } = useSearchFilters();
    const { currentFilters, setLocationMode } = useFilterStore();
    const { addQuery, updateQuery, activeQueryId, queries } = useSidebarStore();

    const [propertiesCount, setPropertiesCount] = useState<number | null>(null);
    const [isLoadingCount, setIsLoadingCount] = useState(false);
    const [isFiltersPopupOpen, setIsFiltersPopupOpen] = useState(false);
    const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [savedFiltersSnapshot, setSavedFiltersSnapshot] = useState<string | null>(null);

    const filtersContainerRef = useRef<HTMLDivElement>(null);

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
        // Если вкладка ещё не сохранена (isUnsaved: true), всегда показываем как несохранённую
        if (activeQuery.isUnsaved) {
            return true;
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
        // 1. Закрыть попап полных фильтров
        setIsFiltersPopupOpen(false);

        // 2. Объединить URL-фильтры с location/polygon фильтрами
        const mergedFilters = { ...filters, ...currentFilters };

        // 3. Обновить активную вкладку если есть
        if (activeQueryId && activeQuery) {
            updateQuery(activeQueryId, {
                filters: mergedFilters,
                resultsCount: propertiesCount ?? undefined,
            });
        }

        // 4. Применить фильтры (обновить URL, это вызовет перезагрузку данных)
        setFilters(mergedFilters);
    };

    const handleSave = () => {
        if (activeQuery) {
            // Проверяем, является ли вкладка несохранённой (новой)
            if (activeQuery.isUnsaved) {
                // Для несохранённых вкладок показываем диалог ввода названия
                setIsSavePopoverOpen(true);
            } else {
                // Обновляем существующий (уже сохранённый) фильтр
                const mergedFilters = { ...filters, ...currentFilters };
                updateQuery(activeQueryId!, {
                    filters: mergedFilters,
                    resultsCount: propertiesCount ?? undefined,
                });
                setSavedFiltersSnapshot(JSON.stringify(mergedFilters));
            }
        } else {
            // Нет активного запроса - открываем popover для ввода названия нового фильтра
            setIsSavePopoverOpen(true);
        }
    };

    const handleSaveNewFilter = () => {
        if (filterName.trim()) {
            const mergedFilters = { ...filters, ...currentFilters };

            if (activeQuery?.isUnsaved) {
                // Для несохранённой вкладки обновляем title и снимаем флаг isUnsaved
                updateQuery(activeQueryId!, {
                    title: filterName.trim(),
                    filters: mergedFilters,
                    resultsCount: propertiesCount ?? undefined,
                    isUnsaved: false,
                });
                setSavedFiltersSnapshot(JSON.stringify(mergedFilters));
            } else {
                // Создаём новую вкладку с isUnsaved: false (сразу сохранённая)
                addQuery({
                    title: filterName.trim(),
                    filters: mergedFilters,
                    resultsCount: propertiesCount ?? undefined,
                    isUnsaved: false,
                });
            }
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
        <div className="w-full bg-background-secondary border-b border-border relative z-50 ">
            <div className="flex items-center gap-2 px-4 py-2.5 fixed top-0 backdrop-blur-sm bg-background-secondary/85 w-full border-b border-border z-50">
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

                {/* Переключатель: Недвижимость / Агентства */}
                <SearchCategorySwitcher currentCategory="properties" locale={locale} />

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
                            aria-label={t('allFilters')}
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
                            aria-label={t('clearAll')}
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

            {/* Улучшенная панель фильтров для desktop */}
            <FiltersDesktopPanel 
                open={isFiltersPopupOpen} 
                onOpenChange={setIsFiltersPopupOpen} 
            />
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
