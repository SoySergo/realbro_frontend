'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Users } from 'lucide-react';
import Image from 'next/image';
import { Link, useRouter } from '@/shared/config/routing';
import { AgencyCard } from '@/entities/agency';
import { AgencyFiltersBar } from '@/features/agency-filters';
import { SearchCategorySwitcher } from '@/features/search-category';
import { Button } from '@/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { getAgenciesList } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import type { AgencyCardData, AgencyFilters } from '@/entities/agency';

// Высота мобильного хедера
const MOBILE_HEADER_HEIGHT = 56;

interface AgenciesPageProps {
    locale: string;
    initialAgencies?: AgencyCardData[];
}

/**
 * Страница поиска агентств недвижимости
 * Отображает список агентств с фильтрами
 * Поведение фильтров аналогично странице поиска недвижимости:
 * - Скролл вниз → фильтры скрываются
 * - Скролл вверх → фильтры появляются
 */
export function AgenciesPage({ locale, initialAgencies = [] }: AgenciesPageProps) {
    const t = useTranslations('agency');
    const tCommon = useTranslations('common');
    const tCategory = useTranslations('searchCategory');
    const router = useRouter();

    const [agencies, setAgencies] = useState<AgencyCardData[]>(initialAgencies);
    const [filters, setFilters] = useState<AgencyFilters>({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Состояние для скрытия/показа фильтров при скролле
    const [isFiltersVisible, setIsFiltersVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    // Загрузка агентств
    const loadAgencies = useCallback(
        async (currentFilters: AgencyFilters, pageNum: number, append = false) => {
            setIsLoading(true);
            try {
                const result = await getAgenciesList(currentFilters, pageNum, 12, locale);
                
                if (append) {
                    setAgencies((prev) => [...prev, ...result.data]);
                } else {
                    setAgencies(result.data);
                }
                
                setTotalPages(result.pagination.totalPages);
                setHasMore(pageNum < result.pagination.totalPages);
            } catch (error) {
                console.error('Failed to load agencies:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [locale]
    );

    // Загрузка при изменении фильтров
    useEffect(() => {
        setPage(1);
        loadAgencies(filters, 1, false);
    }, [filters, loadAgencies]);

    // Скролл-зависимое скрытие/показ фильтров (как у недвижимости)
    useEffect(() => {
        const handleScroll = () => {
            if (ticking.current) return;

            ticking.current = true;
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const scrollDiff = currentScrollY - lastScrollY.current;

                // Скролл вниз > 5px — скрываем, вверх — показываем
                if (scrollDiff > 5) {
                    setIsFiltersVisible(false);
                } else if (scrollDiff < -5) {
                    setIsFiltersVisible(true);
                }

                lastScrollY.current = currentScrollY;
                ticking.current = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Обработка изменения фильтров
    const handleFiltersChange = useCallback((newFilters: Partial<AgencyFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    }, []);

    // Сброс фильтров
    const handleResetFilters = useCallback(() => {
        setFilters({});
    }, []);

    // Загрузить ещё
    const handleLoadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadAgencies(filters, nextPage, true);
    }, [page, filters, loadAgencies]);

    // Обработчик смены категории поиска (мобилка)
    const handleCategoryChange = (value: string) => {
        if (value === 'properties') {
            router.push('/search/map');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Мобильный хедер — фиксированный */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background-secondary border-b border-border">
                <div className="flex items-center px-3 py-2 gap-2">
                    {/* Logo */}
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
                    <Select value="professionals" onValueChange={handleCategoryChange}>
                        <SelectTrigger className="h-8 w-auto gap-1 text-xs border-border px-2 shrink-0">
                            <Users className="w-3.5 h-3.5" />
                            <SelectValue>{tCategory('professionals')}</SelectValue>
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
                </div>
            </div>

            {/* Отступ для мобильного хедера */}
            <div className="md:hidden" style={{ height: MOBILE_HEADER_HEIGHT }} />

            {/* Десктоп: заголовок с переключателем */}
            <div className="hidden md:block bg-background-secondary border-b border-border">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
                    {/* Переключатель категории */}
                    <SearchCategorySwitcher currentCategory="professionals" locale={locale} />

                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            {t('agencies')}
                        </h1>
                        <p className="text-text-secondary text-sm mt-0.5">
                            {t('searchAgencies')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Мобильный заголовок */}
            <div className="md:hidden bg-background-secondary border-b border-border">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-bold text-text-primary">
                        {t('agencies')}
                    </h1>
                    <p className="text-text-secondary text-sm mt-0.5">
                        {t('searchAgencies')}
                    </p>
                </div>
            </div>

            {/* Фильтры — sticky с анимацией скрытия при скролле */}
            <div
                className={cn(
                    'sticky z-40 transition-transform duration-200 ease-out',
                    isFiltersVisible ? 'translate-y-0' : '-translate-y-full'
                )}
                style={{ top: 0 }}
            >
                <AgencyFiltersBar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                />
            </div>

            {/* Список агентств */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {isLoading && agencies.length === 0 ? (
                    // Скелетон загрузки
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-background border border-border rounded-xl p-4 animate-pulse"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-14 h-14 rounded-lg bg-background-secondary" />
                                    <div className="flex-1">
                                        <div className="h-5 w-3/4 bg-background-secondary rounded mb-2" />
                                        <div className="h-4 w-1/2 bg-background-secondary rounded" />
                                    </div>
                                </div>
                                <div className="h-10 bg-background-secondary rounded mb-3" />
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-background-secondary rounded" />
                                    <div className="h-6 w-16 bg-background-secondary rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : agencies.length === 0 ? (
                    // Пустой результат
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-text-primary mb-2">
                            {t('noAgenciesFound')}
                        </h2>
                        <p className="text-text-secondary">
                            {t('tryChangeFilters')}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Сетка агентств */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {agencies.map((agency) => (
                                <AgencyCard
                                    key={agency.id}
                                    agency={agency}
                                    locale={locale}
                                />
                            ))}
                        </div>

                        {/* Кнопка "Загрузить ещё" */}
                        {hasMore && (
                            <div className="mt-8 text-center">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                >
                                    {isLoading ? tCommon('loading') : t('loadMore')}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
