'use client';

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Search,
    SlidersHorizontal,
    Trash2,
    CloudUpload,
    CloudCheck,
    CloudCog,
    FingerprintIcon,
} from 'lucide-react';
import { useSearchFilters } from '@/features/search-filters/model';
import { useFilterStore } from '../model/store';
import { useSidebarStore } from '@/widgets/sidebar';
import { getPropertiesCount, getAgenciesCount } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';

import { SearchCategorySwitcher, type SearchCategory } from '@/features/search-category';
import { useAgencyFilters } from '@/features/agency-filters';

// Фильтры недвижимости
import { MarkerTypeFilter } from '@/features/marker-type-filter';
import { LocationFilterButton } from '@/features/location-filter';
import { CategoryFilter } from '@/features/category-filter';
import { PriceFilter } from '@/features/price-filter';
import { RoomsFilter } from '@/features/rooms-filter';
import { AreaFilter } from '@/features/area-filter';

// Фильтры профессионалов
import { ProfessionalFiltersGroup } from './professional-filters-group';

// Панель "Все фильтры"
import { FiltersDesktopPanel } from './filters-desktop-panel';

interface SearchFiltersBarContentProps {
    currentCategory?: SearchCategory;
}

/**
 * Widget: Единая панель фильтров поиска
 *
 * Поддерживает два режима:
 * - properties: фильтры недвижимости (локация, категория, цена, комнаты, площадь)
 * - professionals: фильтры профессионалов (имя, телефон, языки, типы недвижимости)
 *
 * Общие элементы: AI Agent, переключатель категории, маркеры
 */
function SearchFiltersBarContent({ currentCategory = 'properties' }: SearchFiltersBarContentProps) {
    const t = useTranslations('filters');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { filtersCount, clearFilters, filters, setFilters } = useSearchFilters();
    const { currentFilters, setLocationMode } = useFilterStore();
    const { addQuery, updateQuery, activeQueryId, queries } = useSidebarStore();
    const agencyFilters = useAgencyFilters();

    const isProperties = currentCategory === 'properties';

    const [resultsCount, setResultsCount] = useState<number | null>(null);
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
            return filtersCount > 0;
        }
        if (activeQuery.isUnsaved) {
            return true;
        }
        return savedFiltersSnapshot !== currentFiltersSnapshot;
    }, [activeQuery, savedFiltersSnapshot, currentFiltersSnapshot, filtersCount]);

    // Определяем количество активных фильтров в зависимости от категории
    const hasActiveFilters = isProperties
        ? filtersCount > 0
        : agencyFilters.filtersCount > 0;

    // Получение количества результатов
    const fetchResultsCount = useCallback(async () => {
        setIsLoadingCount(true);
        try {
            if (isProperties) {
                const mergedFilters = { ...filters, ...currentFilters };
                const count = await getPropertiesCount(mergedFilters);
                setResultsCount(count);
            } else {
                const count = await getAgenciesCount(agencyFilters.filters, locale);
                setResultsCount(count);
            }
        } catch (error) {
            console.error('Failed to fetch results count:', error);
            setResultsCount(null);
        } finally {
            setIsLoadingCount(false);
        }
    }, [isProperties, filters, currentFilters, agencyFilters.filters, locale]);

    // Обновляем счётчик при изменении фильтров (с debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchResultsCount();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchResultsCount]);

    const handleReset = () => {
        if (isProperties) {
            clearFilters();
        } else {
            agencyFilters.resetFilters();
        }
    };

    const handleShowResults = () => {
        setIsFiltersPopupOpen(false);

        if (isProperties) {
            const mergedFilters = { ...filters, ...currentFilters };
            if (activeQueryId && activeQuery) {
                updateQuery(activeQueryId, {
                    filters: mergedFilters,
                    resultsCount: resultsCount ?? undefined,
                });
            }
            setFilters(mergedFilters);
        }
        // Для professionals — фильтры применяются автоматически через стор
    };

    const handleSave = () => {
        if (activeQuery) {
            if (activeQuery.isUnsaved) {
                setIsSavePopoverOpen(true);
            } else {
                const mergedFilters = { ...filters, ...currentFilters };
                updateQuery(activeQueryId!, {
                    filters: mergedFilters,
                    resultsCount: resultsCount ?? undefined,
                });
                setSavedFiltersSnapshot(JSON.stringify(mergedFilters));
            }
        } else {
            setIsSavePopoverOpen(true);
        }
    };

    const handleSaveNewFilter = () => {
        if (filterName.trim()) {
            const mergedFilters = { ...filters, ...currentFilters };

            if (activeQuery?.isUnsaved) {
                updateQuery(activeQueryId!, {
                    title: filterName.trim(),
                    filters: mergedFilters,
                    resultsCount: resultsCount ?? undefined,
                    isUnsaved: false,
                });
                setSavedFiltersSnapshot(JSON.stringify(mergedFilters));
            } else {
                addQuery({
                    title: filterName.trim(),
                    filters: mergedFilters,
                    resultsCount: resultsCount ?? undefined,
                    isUnsaved: false,
                });
            }
            setFilterName('');
            setIsSavePopoverOpen(false);
        }
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString('ru-RU');
    };

    const SaveIcon = activeQuery ? (hasUnsavedChanges ? CloudCog : CloudCheck) : CloudUpload;

    return (
        <div className="w-full bg-background-secondary border-b border-border relative z-50">
            <div className="flex items-center gap-2 px-4 py-2.5 fixed top-0 backdrop-blur-sm bg-background-secondary/85 w-full border-b border-border z-50">
                {/* Кнопка ИИ агент */}
                <Button
                    size="sm"
                    className="shrink-0 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                    <FingerprintIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('aiAgent')}</span>
                </Button>

                <div className="w-px h-6 bg-border shrink-0" />

                {/* Переключатель категории */}
                <SearchCategorySwitcher currentCategory={currentCategory} locale={locale} />

                <div className="w-px h-6 bg-border shrink-0" />

                {/* Фильтр маркеров — общий для обеих категорий */}
                <MarkerTypeFilter />

                {/* Зона фильтров — зависит от категории */}
                <div
                    ref={filtersContainerRef}
                    className="hidden md:flex items-center gap-2 flex-1 min-w-0"
                >
                    {isProperties ? (
                        <>
                            <LocationFilterButton />
                            <CategoryFilter />
                            <div className="hidden lg:block">
                                <PriceFilter />
                            </div>
                            <div className="hidden lg:block">
                                <RoomsFilter />
                            </div>
                            <div className="hidden 2xl:block">
                                <AreaFilter />
                            </div>
                        </>
                    ) : (
                        <ProfessionalFiltersGroup />
                    )}

                    {/* Кнопки действий */}
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                        {/* Все фильтры */}
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

                        {/* Очистить */}
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

                        {/* Сохранить/Обновить — только для properties */}
                        {isProperties && (
                            activeQuery ? (
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
                            )
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
                                    {resultsCount !== null ? formatNumber(resultsCount) : tCommon('show')}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Панель "Все фильтры" — пока только для properties */}
            {isProperties && (
                <FiltersDesktopPanel
                    open={isFiltersPopupOpen}
                    onOpenChange={setIsFiltersPopupOpen}
                />
            )}
        </div>
    );
}

interface SearchFiltersBarProps {
    currentCategory?: SearchCategory;
}

export function SearchFiltersBar({ currentCategory = 'properties' }: SearchFiltersBarProps) {
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
            <SearchFiltersBarContent currentCategory={currentCategory} />
        </Suspense>
    );
}
