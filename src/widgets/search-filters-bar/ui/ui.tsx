'use client';

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    SlidersHorizontal,
    Trash2,
    CloudUpload,
    CloudCheck,
    CloudCog,
    RefreshCw,
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
import { useAuth } from '@/features/auth';
import { useToast } from '@/shared/ui/toast';

import { SearchCategorySwitcher, type SearchCategory } from '@/features/search-category';
import { useAgencyFilters } from '@/features/agency-filters';

// Фильтры недвижимости
// TODO: MarkerTypeFilter — найти эстетичное место в UI
// import { MarkerTypeFilter } from '@/features/marker-type-filter';
import { LocationFilterButton } from '@/features/location-filter';
import { CategoryFilter } from '@/features/category-filter';
import { SubcategoryFilter } from '@/features/subcategory-filter';
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
    const tSidebar = useTranslations('sidebar');
    const locale = useLocale();
    const { filtersCount, clearFilters, filters, setFilters } = useSearchFilters();
    const { currentFilters, setLocationMode } = useFilterStore();
    const { addQuery, updateQuery, activeQueryId, queries } = useSidebarStore();
    const agencyFilters = useAgencyFilters();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const isProperties = currentCategory === 'properties';

    const [resultsCount, setResultsCount] = useState<number | null>(null);
    const [isLoadingCount, setIsLoadingCount] = useState(false);
    const [isFiltersPopupOpen, setIsFiltersPopupOpen] = useState(false);
    const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [savedFiltersSnapshot, setSavedFiltersSnapshot] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [justSynced, setJustSynced] = useState(false);

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

    // Авто-синхронизация фильтров для авторизованных пользователей (debounce 3 сек)
    useEffect(() => {
        if (!isAuthenticated || !isProperties || !activeQuery || activeQuery.isUnsaved || !hasUnsavedChanges) return;

        const timeoutId = setTimeout(async () => {
            setIsSyncing(true);
            try {
                const mergedFilters = { ...filters, ...currentFilters };
                updateQuery(activeQueryId!, {
                    filters: mergedFilters,
                    resultsCount: resultsCount ?? undefined,
                });
                setSavedFiltersSnapshot(JSON.stringify(mergedFilters));
                setJustSynced(true);
                setTimeout(() => setJustSynced(false), 2000);
            } catch (error) {
                console.error('Auto-sync failed:', error);
            } finally {
                setIsSyncing(false);
            }
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [currentFiltersSnapshot, isAuthenticated, isProperties, activeQuery?.id, activeQuery?.isUnsaved]);

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

    // Авто-применение фильтров при изменении (с debounce)
    useEffect(() => {
        if (!isProperties) return;

        const timeoutId = setTimeout(() => {
            const mergedFilters = { ...filters, ...currentFilters };
            setFilters(mergedFilters);

            if (activeQueryId && activeQuery) {
                updateQuery(activeQueryId, {
                    filters: mergedFilters,
                    resultsCount: resultsCount ?? undefined,
                });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [currentFiltersSnapshot]);

    const handleReset = () => {
        if (isProperties) {
            clearFilters();
            // Также сбрасываем location state в Zustand store
            const { resetFilters: resetStoreFilters } = useFilterStore.getState();
            resetStoreFilters();
        } else {
            agencyFilters.resetFilters();
        }
    };


    // Проверка авторизации перед сохранением фильтра
    const requireAuth = useCallback((): boolean => {
        if (!isAuthenticated) {
            showToast(tSidebar('loginRequired'), 'warning');
            return false;
        }
        return true;
    }, [isAuthenticated, showToast, tSidebar]);

    const handleSave = () => {
        if (!requireAuth()) return;

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

    const handleSaveNewFilter = async () => {
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
                // Используем saveNewTabWithGeometry для переноса гостевой геометрии
                const { saveNewTabWithGeometry } = useSidebarStore.getState();
                const hasGuestGeometry = (mergedFilters.polygon_ids?.length ?? 0) > 0 || (mergedFilters.geometryIds?.length ?? 0) > 0;

                if (hasGuestGeometry) {
                    const tabId = await saveNewTabWithGeometry(filterName.trim(), mergedFilters);
                    if (tabId) {
                        // Обновляем geometry_source на 'filter' после переноса
                        const { setFilters: updateStoreFilters } = useFilterStore.getState();
                        updateStoreFilters({ geometry_source: 'filter' });
                    }
                } else {
                    addQuery({
                        title: filterName.trim(),
                        filters: mergedFilters,
                        resultsCount: resultsCount ?? undefined,
                        isUnsaved: false,
                    });
                }
            }
            setFilterName('');
            setIsSavePopoverOpen(false);
        }
    };

    const SaveIcon = isSyncing ? RefreshCw : activeQuery ? (justSynced ? CloudCheck : (hasUnsavedChanges ? CloudCog : CloudCheck)) : CloudUpload;

    return (
        <div className="w-full relative z-50">
            <div className="flex items-center gap-2 px-3 w-full justify-end">
                {/* Переключатель категории — всегда первый элемент слева */}
                <SearchCategorySwitcher currentCategory={currentCategory} locale={locale} />

                {/* Зона фильтров — прилипает слева после переключателя, растёт вправо */}
                <div
                    ref={filtersContainerRef}
                    className="flex items-center gap-2 min-w-0 shrink-0"
                >
                    {isProperties ? (
                        <>
                            {/* Локация — появляется с 900px */}
                            <div className="hidden filters-1:block shrink-0">
                                <LocationFilterButton />
                            </div>
                            {/* Категория — появляется с 1100px */}
                            <div className="hidden filters-2:block shrink-0">
                                <CategoryFilter />
                            </div>
                            {/* Подкатегория — появляется вместе с категорией */}
                            <SubcategoryFilter className="hidden filters-2:block shrink-0" />
                            {/* Цена — появляется с 1200px */}
                            <div className="hidden filters-3:block shrink-0">
                                <PriceFilter />
                            </div>
                            {/* Комнаты — появляются с 1300px */}
                            <div className="hidden filters-4:block shrink-0">
                                <RoomsFilter />
                            </div>
                            {/* Площадь — показана с 2xl (1536px) */}
                            <div className="hidden 2xl:block shrink-0">
                                <AreaFilter />
                            </div>
                        </>
                    ) : (
                        <div className="hidden filters-1:contents">
                            <ProfessionalFiltersGroup />
                        </div>
                    )}
                </div>

                {/* Кнопки действий — фиксированы справа */}
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
                                disabled={isSyncing || (!hasUnsavedChanges && !justSynced)}
                                className={cn(
                                    "text-text-secondary",
                                    isSyncing && "text-brand-primary",
                                    justSynced && "text-success",
                                    hasUnsavedChanges && !isSyncing && "hover:text-brand-primary hover:bg-brand-primary/10"
                                )}
                                title={isSyncing ? tCommon('saving') : (justSynced ? tCommon('saved') : (hasUnsavedChanges ? tCommon('save') : t('title')))}
                            >
                                <SaveIcon className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                            </Button>
                        ) : (
                            <Popover open={isSavePopoverOpen} onOpenChange={(open) => {
                                if (open && !requireAuth()) return;
                                setIsSavePopoverOpen(open);
                            }}>
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

                    {/* Кнопка "Найди мне" (AI) — в конце */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="btn-ai-neon ml-3 shrink-0 gap-2"
                    >
                        <FingerprintIcon className="w-4 h-4 text-brand-primary" />
                        <span className="hidden sm:inline font-medium">{t('findMe')}</span>
                    </Button>
                </div>
            </div>

            {/* Панель "Все фильтры" */}
            <FiltersDesktopPanel
                open={isFiltersPopupOpen}
                onOpenChange={setIsFiltersPopupOpen}
                currentCategory={currentCategory}
            />
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
