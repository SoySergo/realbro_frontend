'use client';

import { useRef, useEffect, useState, useCallback, type MouseEvent, memo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, useRouter as useLocalizedRouter } from '@/shared/config/routing';
import { Button } from '@/shared/ui/button';
import {
    SlidersHorizontal,
    FingerprintIcon,
    ArrowUpDown,
    X,
    Map,
    List,
    CloudUpload,
    Building2,
    Users,
} from 'lucide-react';
import { CloudSyncIcon, CloudCheckIcon } from '@/shared/icons/cloude-sync';
import { useSearchFilters } from '@/features/search-filters/model';
import { useSearchViewMode, useActiveLocationMode } from '../model/store';
import { QueriesSelect } from '@/widgets/sidebar/ui/queries-select';
import { useSidebarStore } from '@/widgets/sidebar/model';
import { useAuth } from '@/features/auth';
import { cn } from '@/shared/lib/utils';
import { useReducedMotion, useDebouncedCallback } from '@/shared/hooks';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import type { MarkerType } from '@/entities/filter';

type MobileSearchHeaderProps = {
    onOpenFilters: () => void;
    className?: string;
};

// Высота основного хедера
const HEADER_HEIGHT = 56;

/**
 * Мобильный хедер для страницы поиска
 */
export function MobileSearchHeader({ onOpenFilters, className }: MobileSearchHeaderProps) {
    const { filtersCount, filters } = useSearchFilters();
    const t = useTranslations('sidebar');
    const tFilters = useTranslations('filters');
    const tCommon = useTranslations('common');
    const tCategory = useTranslations('searchCategory');
    // Используем оптимизированный селектор вместо полного стора
    const searchViewMode = useSearchViewMode();
    const router = useRouter();
    const localizedRouter = useLocalizedRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Auth state
    const { isAuthenticated } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Получаем queries для определения первого визита
    const { queries, addQuery } = useSidebarStore();
    const isFirstTimeUser = queries.length === 0;
    
    // Обработчик сохранения фильтра
    const handleSaveFilter = async () => {
        if (!isAuthenticated) {
            // Если не авторизован - открываем модалку регистрации
            // Сохраняем текущие параметры в URL чтобы модалка открылась поверх
            const params = new URLSearchParams(searchParams);
            params.set('modal', 'register');
            router.push(`${pathname}?${params.toString()}`);
            return;
        }

        setIsSaving(true);

        // Имитация асинхронного сохранения на бекенд
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            addQuery({
                title: t('newSearch'),
                filters: filters,
                isUnsaved: true, // В будущем это будет false, когда будет реальное сохранение
            });
            
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to save filter:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const isMapMode = searchViewMode === 'map';

    // Обработчик смены категории поиска
    const handleCategoryChange = (value: string) => {
        if (value === 'professionals') {
            localizedRouter.push('/agencies');
        }
    };

    return (
        <div className={cn('', className)}>
            {/* Фиксированный хедер */}
            <div className="fixed top-0 left-0 right-0 z-101 bg-background-secondary">
                <div className="flex items-center px-3 py-2 gap-2">
                    {/* Logo Block */}
                    <div className="flex-[0_0_auto]">
                        <Link href="/" className="flex items-start">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                            />
                            <span className="ml-2 text-xl font-bold text-text-primary leading-none">Realbro</span>
                        </Link>
                    </div>

                    {/* Переключатель категории: Недвижимость / Агентства */}
                    <Select value="properties" onValueChange={handleCategoryChange}>
                        <SelectTrigger className="h-8 w-auto gap-1 text-xs border-border px-2 shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                            <SelectValue>{tCategory('properties')}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="properties">
                                <span className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {tCategory('properties')}
                                </span>
                            </SelectItem>
                            <SelectItem value="professionals">
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {tCategory('professionals')}
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Actions Block */}
                    <div className="flex-[1_1_auto] flex items-center justify-end gap-2 min-w-0 pl-2">
                        {isFirstTimeUser ? (
                            <>
                                {/* Первый визит: кнопка "Сохранить фильтр" (не тянется) + кнопка "Фильтры" */}
                                <Button
                                    onClick={handleSaveFilter}
                                    disabled={filtersCount === 0 || isSaving || isSuccess}
                                    className={cn(
                                        'h-10 gap-2 px-4 shrink-0 transition-all duration-300',
                                        filtersCount > 0
                                            ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                                            : 'bg-background-tertiary text-text-secondary cursor-not-allowed',
                                        isSaving && 'animate-pulse cursor-wait',
                                        isSuccess && 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                    )}
                                >
                                    {isSaving ? (
                                        <CloudSyncIcon className="w-5 h-5 animate-spin" />
                                    ) : isSuccess ? (
                                        <CloudCheckIcon className="w-5 h-5" />
                                    ) : (
                                        <CloudUpload className="w-5 h-5" />
                                    )}
                                    
                                    <span>
                                        {isSaving 
                                            ? tCommon('saving') 
                                            : isSuccess 
                                                ? tCommon('saved') 
                                                : t('saveFilter')
                                        }
                                    </span>
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    onClick={onOpenFilters}
                                    className={cn(
                                        'h-10 bg-background border-border shrink-0',
                                        filtersCount > 0
                                            ? 'w-10 p-0 border-brand-primary text-brand-primary relative'
                                            : 'px-4 gap-2'
                                    )}
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                    {filtersCount === 0 && <span>{tFilters('title')}</span>}
                                    {filtersCount > 0 && (
                                        <span className="bg-brand-primary absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {filtersCount}
                                        </span>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Вернувшийся пользователь: dropdown (компактный) + иконка фильтров */}
                                <div className="min-w-0 shrink-0 max-w-[200px]">
                                    <QueriesSelect
                                        triggerClassName="h-10 text-base bg-background border border-border rounded-lg px-4 justify-between"
                                    />
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={onOpenFilters}
                                    className={cn(
                                        'h-10 w-10 bg-background border-border shrink-0 relative',
                                        filtersCount > 0 && 'border-brand-primary text-brand-primary'
                                    )}
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                    {filtersCount > 0 && (
                                        <span className="bg-brand-primary absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {filtersCount}
                                        </span>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Отступ для фиксированного хедера */}
            <div style={{ height: HEADER_HEIGHT }} />

            {/* Плавающий блок фильтров */}
            <MobileFiltersFloatingBar isMapMode={isMapMode} />
        </div>
    );
}

type MobileFiltersFloatingBarProps = {
    isMapMode: boolean;
};

/**
 * Плавающий блок с фильтрами
 * - В режиме карты: всегда поверх карты, без фона
 * - В режиме списка: sticky под хедером, скрывается при скролле вниз
 */
function MobileFiltersFloatingBar({ isMapMode }: MobileFiltersFloatingBarProps) {
    const t = useTranslations('filters');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { filters, setFilters, clearFilter } = useSearchFilters();

    // Проверка предпочтения уменьшенного движения
    const prefersReducedMotion = useReducedMotion();

    // Состояние видимости (только для режима списка)
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    const sortOptions = [
        { value: 'createdAt', label: t('sortDate') },
        { value: 'price', label: t('price') },
        { value: 'area', label: t('area') },
    ];

    const selectedSort = filters.sort || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const handleSortChange = (value: string) => {
        setFilters({ sort: value });
    };

    const toggleSortOrder = () => {
        setFilters({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    };

    // Активные фильтры
    const activeFilterChips: { key: string; label: string }[] = [];

    if (filters.categoryIds && filters.categoryIds.length > 0) {
        activeFilterChips.push({ key: 'categoryIds', label: `${t('category')}: ${filters.categoryIds.length}` });
    }
    if (filters.minPrice || filters.maxPrice) {
        const priceLabel = filters.minPrice && filters.maxPrice
            ? `${filters.minPrice}-${filters.maxPrice}€`
            : filters.minPrice
                ? `от ${filters.minPrice}€`
                : `до ${filters.maxPrice}€`;
        activeFilterChips.push({ key: 'price', label: priceLabel });
    }
    if (filters.rooms && filters.rooms.length > 0) {
        activeFilterChips.push({ key: 'rooms', label: `${t('rooms')}: ${filters.rooms.join(', ')}` });
    }
    if (filters.minArea || filters.maxArea) {
        const areaLabel = filters.minArea && filters.maxArea
            ? `${filters.minArea}-${filters.maxArea} м²`
            : filters.minArea
                ? `от ${filters.minArea} м²`
                : `до ${filters.maxArea} м²`;
        activeFilterChips.push({ key: 'area', label: areaLabel });
    }

    const handleRemoveChip = (key: string) => {
        if (key === 'price') {
            setFilters({ minPrice: undefined, maxPrice: undefined });
        } else if (key === 'area') {
            setFilters({ minArea: undefined, maxArea: undefined });
        } else {
            clearFilter(key as keyof typeof filters);
        }
    };

    // Обработчик скролла (только для режима списка)
    const handleScroll = useCallback(() => {
        if (isMapMode || ticking.current) return;

        ticking.current = true;
        requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const scrollDiff = currentScrollY - lastScrollY.current;

            // Скролл вниз > 5px - скрываем, вверх - показываем
            if (scrollDiff > 5) {
                setIsVisible(false);
            } else if (scrollDiff < -5) {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
            ticking.current = false;
        });
    }, [isMapMode]);

    // Сброс видимости при смене режима
    useEffect(() => {
        if (isMapMode) return;

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll, isMapMode]);

    // Показываем панель при переключении в режим карты
    useEffect(() => {
        if (isMapMode) {
            lastScrollY.current = 0;
        }
    }, [isMapMode]);

    // Режим карты: фиксированный поверх карты, без фона
    if (isMapMode) {
        return (
            <div
                className="fixed left-0 right-0 z-40 pointer-events-none"
                style={{ top: HEADER_HEIGHT }}
            >
                <div
                    ref={scrollContainerRef}
                    className="flex items-center gap-2 px-3 py-2 overflow-x-auto pointer-events-auto"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <FilterButtons
                        t={t}
                        sortOptions={sortOptions}
                        selectedSort={selectedSort}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        onToggleSortOrder={toggleSortOrder}
                        activeFilterChips={activeFilterChips}
                        onRemoveChip={handleRemoveChip}
                        withShadow
                        prefersReducedMotion={prefersReducedMotion}
                    />
                </div>
            </div>
        );
    }

    // Режим списка: fixed с анимацией скрытия
    return (
        <>
            {/* Плейсхолдер для отступа контента */}
            <div className="h-[52px]" />

            {/* Фиксированная панель */}
            <div
                className={cn(
                    'fixed left-0 right-0 z-40',
                    // Отключаем анимации если пользователь предпочитает уменьшенное движение
                    prefersReducedMotion
                        ? (isVisible ? 'translate-y-0' : '-translate-y-full')
                        : cn(
                              'transition-transform duration-200 ease-out',
                              isVisible ? 'translate-y-0' : '-translate-y-full'
                          )
                )}
                style={{ top: HEADER_HEIGHT }}
            >
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto bg-background-secondary/95 backdrop-blur-sm border-b border-border"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <div className="flex items-center gap-2 px-3 py-2 w-max min-w-full">
                        <FilterButtons
                            t={t}
                            sortOptions={sortOptions}
                            selectedSort={selectedSort}
                            sortOrder={sortOrder}
                            onSortChange={handleSortChange}
                            onToggleSortOrder={toggleSortOrder}
                            activeFilterChips={activeFilterChips}
                            onRemoveChip={handleRemoveChip}
                            prefersReducedMotion={prefersReducedMotion}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

type FilterButtonsProps = {
    t: (key: string) => string;
    sortOptions: { value: string; label: string }[];
    selectedSort: string;
    sortOrder: string;
    onSortChange: (value: string) => void;
    onToggleSortOrder: () => void;
    activeFilterChips: { key: string; label: string }[];
    onRemoveChip: (key: string) => void;
    withShadow?: boolean;
    prefersReducedMotion?: boolean;
};

/**
 * Мемоизированный chip для фильтра
 */
const FilterChip = memo(function FilterChip({
    chipKey,
    label,
    onRemove,
    shadowClass,
    prefersReducedMotion,
}: {
    chipKey: string;
    label: string;
    onRemove: (key: string) => void;
    shadowClass: string;
    prefersReducedMotion: boolean;
}) {
    // Debounce для предотвращения множественных кликов
    const debouncedRemove = useDebouncedCallback(onRemove, 50);

    const handleClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            debouncedRemove(chipKey);
        },
        [chipKey, debouncedRemove]
    );

    return (
        <Button
            variant="outline"
            onClick={handleClick}
            className={cn(
                'shrink-0 h-9 gap-2 text-sm bg-background border-border px-3 touch-manipulation',
                shadowClass,
                prefersReducedMotion ? '' : 'transition-colors'
            )}
        >
            <span className="whitespace-nowrap">{label}</span>
            <X className="w-3.5 h-3.5 shrink-0" />
        </Button>
    );
});

/**
 * Кнопки фильтров - вынесены отдельно для переиспользования
 */
const FilterButtons = memo(function FilterButtons({
    t,
    sortOptions,
    selectedSort,
    sortOrder,
    onSortChange,
    onToggleSortOrder,
    activeFilterChips,
    onRemoveChip,
    withShadow = false,
    prefersReducedMotion = false,
}: FilterButtonsProps) {
    const shadowClass = withShadow ? 'shadow-md' : '';

    return (
        <>
            {/* ИИ Агент */}
            <Button
                className={cn(
                    'shrink-0 gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white h-9 px-4 touch-manipulation',
                    shadowClass
                )}
            >
                <FingerprintIcon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{t('aiAgent')}</span>
            </Button>

            {/* Сортировка */}
            <div className={cn('flex items-center shrink-0', shadowClass && 'shadow-md rounded-lg')}>
                <Select value={selectedSort} onValueChange={onSortChange}>
                    <SelectTrigger
                        className="w-fit h-9 text-sm bg-background border-border rounded-r-none border-r-0 px-3 touch-manipulation"
                    >
                        <SelectValue>
                            {sortOptions.find(s => s.value === selectedSort)?.label}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-sm">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={onToggleSortOrder}
                    className={cn(
                        'h-9 w-9 p-0 rounded-l-none bg-background border-border touch-manipulation',
                        prefersReducedMotion ? '' : 'transition-transform'
                    )}
                >
                    <ArrowUpDown className={cn(
                        'w-4 h-4',
                        sortOrder === 'asc' && 'rotate-180'
                    )} />
                </Button>
            </div>

            {/* Активные фильтры */}
            {activeFilterChips.map((chip) => (
                <FilterChip
                    key={chip.key}
                    chipKey={chip.key}
                    label={chip.label}
                    onRemove={onRemoveChip}
                    shadowClass={shadowClass}
                    prefersReducedMotion={prefersReducedMotion}
                />
            ))}
        </>
    );
});

/**
 * Плавающая кнопка переключения карта/список
 * Скрывается когда активен режим локации (draw, search, radius, isochrone)
 *
 * При клике на "Карта" из листинга - редирект на /search/map
 * При клике на "Список" с карты - редирект на /search/list
 */
export function MobileViewToggle() {
    const t = useTranslations('filters');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // Используем оптимизированный селектор вместо полного стора
    const activeLocationMode = useActiveLocationMode();

    // Определяем текущий режим по URL
    const isMapPage = pathname.includes('/search/map');

    // Скрываем кнопку когда активен любой режим локации
    if (activeLocationMode) {
        return null;
    }

    const handleToggle = () => {
        // Сохраняем текущие параметры фильтров
        const params = searchParams.toString();
        const queryString = params ? `?${params}` : '';

        if (isMapPage) {
            // С карты на список
            router.push(`/search/list${queryString}`);
        } else {
            // С листинга на карту
            router.push(`/search/map${queryString}`);
        }
    };

    return (
        <Button
            onClick={handleToggle}
            className={cn(
                'fixed left-4 bottom-20 z-40 gap-2 shadow-lg',
                'bg-brand-primary hover:bg-brand-primary/90 text-white',
                'h-10 px-4 rounded-lg'
            )}
        >
            {isMapPage ? (
                <>
                    <List className="w-5 h-5" />
                    <span className="font-medium">{t('viewList')}</span>
                </>
            ) : (
                <>
                    <Map className="w-5 h-5" />
                    <span className="font-medium">{t('viewMap')}</span>
                </>
            )}
        </Button>
    );
}
