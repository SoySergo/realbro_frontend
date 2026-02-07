'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import { useRouter } from '@/shared/config/routing';
import { AgencyCard } from '@/entities/agency';
import { AgencyFiltersBar } from '@/features/agency-filters';
import { SearchCategorySwitcher } from '@/features/search-category';
import { MobileSearchHeader } from '@/widgets/search-filters-bar';
import { Button } from '@/shared/ui/button';
import { getAgenciesList } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import type { AgencyCardData, AgencyFilters } from '@/entities/agency';

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

    const [agencies, setAgencies] = useState<AgencyCardData[]>(initialAgencies);
    const [filters, setFilters] = useState<AgencyFilters>({});
    const [page, setPage] = useState(1);
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
    
    // For agencies: empty filter handler (agency filters don't use MobileFiltersSheet)
    const handleOpenFilters = () => {
        // Agencies don't use MobileFiltersSheet, their filters are always visible
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Мобильный хедер — используем MobileSearchHeader */}
            <div className="md:hidden">
                <MobileSearchHeader 
                    onOpenFilters={handleOpenFilters}
                    currentCategory="professionals"
                />
            </div>

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
                    'sticky top-0 z-40 transition-transform duration-200 ease-out',
                    isFiltersVisible ? 'translate-y-0' : '-translate-y-full'
                )}
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
