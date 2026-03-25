'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import {
    Search,
    MessageCircle,
    Heart,
    User,
    Fingerprint,
    SlidersHorizontal,
    MapPin,
    Map as MapIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Link, usePathname } from '@/shared/config/routing';
import { ThemeSwitcher } from '@/features/theme-switcher';
import { LanguageSwitcher } from '@/features/language-switcher';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { useAuth } from '@/features/auth';
import { useFilters } from '@/features/search-filters/model/use-filters';
import { useActiveLocationMode, useSetLocationMode } from '@/features/search-filters/model/use-location-mode';
import type { LocationFilterMode } from '@/features/search-filters/model/use-location-mode';
import { CategoryFilter } from '@/features/category-filter';
import { SearchCategorySwitcher, type SearchCategory } from '@/features/search-category';
import { FiltersDesktopPanel } from '@/widgets/search-filters-bar/ui/filters-desktop-panel';
import { useFilterStore } from '@/widgets/search-filters-bar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import type { MarkerType } from '@/entities/filter';

const navItems = [
    { id: 'search', icon: Search, labelKey: 'search', href: '/search' },
    { id: 'chat', icon: MessageCircle, labelKey: 'chat', href: '/chat' },
    { id: 'favorites', icon: Heart, labelKey: 'favorites', href: '/favorites' },
    { id: 'profile', icon: User, labelKey: 'profile', href: '/profile' },
] as const;

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

/**
 * CatalogScrollHeader — хедер каталога при скролле.
 *
 * Появляется когда секция фильтров уходит из видимой области.
 * Объединяет элементы SearchPageHeader (лого + навигация) и
 * инструменты фильтрации (AI агент, маркеры, категории, локация, фильтры).
 */
export function CatalogScrollHeader() {
    const t = useTranslations('filters');
    const tSidebar = useTranslations('sidebar');
    const tListing = useTranslations('listing');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const { isAuthenticated } = useAuth();
    const { filters, setFilters, filtersCount } = useFilters();
    const activeLocationMode = useActiveLocationMode();
    const setLocationMode = useSetLocationMode();

    const [currentCategory, setCurrentCategory] = useState<SearchCategory>('properties');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const locationCount = useMemo(() => {
        return (filters.polygonIds?.length ?? 0)
            + (filters.isochroneIds?.length ?? 0)
            + (filters.radiusIds?.length ?? 0)
            + (filters.adminLevel2?.length ?? 0)
            + (filters.adminLevel4?.length ?? 0)
            + (filters.adminLevel6?.length ?? 0)
            + (filters.adminLevel7?.length ?? 0)
            + (filters.adminLevel8?.length ?? 0)
            + (filters.adminLevel9?.length ?? 0)
            + (filters.adminLevel10?.length ?? 0);
    }, [filters]);

    const handleShowOnMap = () => {
        router.push(`/${locale}/${slug}/map`);
    };

    return (
        <>
            <TooltipProvider delayDuration={200}>
                <header
                    className={cn(
                        'flex h-[52px] items-center justify-between',
                        'bg-background rounded-[9px]',
                        'px-3'
                    )}
                >
                    {/* Левая часть — лого */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 px-2">
                        <Image
                            src="/Logo keys.svg"
                            alt="RealBro"
                            width={28}
                            height={28}
                            className="shrink-0 w-7 h-7"
                        />
                        <span className="hidden slug-wide:inline font-bold text-lg text-text-primary whitespace-nowrap">
                            RealBro
                        </span>
                    </Link>

                    {/* Центральная часть — фильтры */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 mx-3">
                        {/* AI Agent */}
                        <button
                            className={cn(
                                'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                                'bg-brand-primary text-white',
                                'hover:bg-brand-primary-hover transition-colors'
                            )}
                        >
                            <Fingerprint className="w-5 h-5" />
                        </button>

                        {/* Маркеры (auth only) */}
                        {isAuthenticated && (
                            <div className="hidden slug-xl:block shrink-0">
                                <Select
                                    value={filters.markerType || 'all'}
                                    onValueChange={(value) =>
                                        setFilters({ markerType: value as MarkerType })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[140px] text-sm border-border">
                                        <SelectValue>
                                            {t(`markerType.${filters.markerType || 'all'}`) || t('markerAll')}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {markerOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {t(`markerType.${opt.labelKey}`) || opt.labelKey}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Раздел + категория */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <SearchCategorySwitcher
                                currentCategory={currentCategory}
                                locale={locale}
                                className="h-9 min-w-0 flex-1"
                            />
                            <div className="min-w-0 flex-1">
                                <CategoryFilter />
                            </div>
                        </div>

                        {/* Кнопка «Смотреть на карте» */}
                        <button
                            onClick={handleShowOnMap}
                            className={cn(
                                'flex items-center gap-1.5 h-9 px-3 rounded-md shrink-0',
                                'bg-brand-primary text-white text-sm font-medium',
                                'hover:bg-brand-primary-hover transition-colors'
                            )}
                        >
                            <MapIcon className="w-4 h-4" />
                            <span className="hidden slug-wide:inline whitespace-nowrap">
                                {tListing('showOnMap')}
                            </span>
                        </button>

                        {/* Локация + фильтры */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={() => {
                                    if (activeLocationMode) {
                                        setLocationMode(null);
                                    } else {
                                        const { locationFilter } = useFilterStore.getState();
                                        const modeFromStore = locationFilter?.mode;
                                        let modeFromUrl: LocationFilterMode | undefined;
                                        if (filters.polygonIds?.length) modeFromUrl = 'draw';
                                        else if (filters.isochroneIds?.length) modeFromUrl = 'isochrone';
                                        else if (filters.radiusIds?.length) modeFromUrl = 'radius';
                                        setLocationMode(modeFromStore ?? modeFromUrl ?? 'search');
                                    }
                                }}
                                className={cn(
                                    'relative w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-all duration-200',
                                    activeLocationMode
                                        ? 'bg-brand-primary text-white border border-brand-primary hover:bg-brand-primary-hover'
                                        : 'border border-border bg-background text-text-secondary hover:text-brand-primary hover:bg-background-secondary'
                                )}
                            >
                                <MapPin className="w-4 h-4" />
                                {locationCount > 0 && !activeLocationMode && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-brand-primary rounded-full">
                                        {locationCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setIsFiltersOpen(true)}
                                className={cn(
                                    'relative w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                                    'border border-border bg-background',
                                    'text-text-secondary hover:text-brand-primary hover:bg-background-secondary',
                                    'transition-colors'
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                {filtersCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-brand-primary rounded-full">
                                        {filtersCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Разделитель */}
                    <div className="w-px h-6 bg-border shrink-0 mx-1" />

                    {/* Навигация */}
                    <nav className="flex items-center gap-1 shrink-0">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname?.startsWith(item.href);
                            const label = tSidebar(item.labelKey);

                            return (
                                <Tooltip key={item.id}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-150',
                                                'text-text-secondary hover:text-brand-primary hover:bg-background-secondary',
                                                isActive && 'text-brand-primary bg-brand-primary/10'
                                            )}
                                        >
                                            <Icon className="w-5 h-5 shrink-0" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </nav>

                    {/* Тема, язык */}
                    <div className="flex items-center gap-1 shrink-0">
                        <ThemeSwitcher />
                        <LanguageSwitcher />
                    </div>
                </header>
            </TooltipProvider>

            {/* Панель "Все фильтры" */}
            <FiltersDesktopPanel
                open={isFiltersOpen}
                onOpenChange={setIsFiltersOpen}
                currentCategory={currentCategory}
                onCategoryChange={setCurrentCategory}
            />
        </>
    );
}
