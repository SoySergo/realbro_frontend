'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import { AgencyCard } from '@/entities/agency';
import { useAgencyFilters } from '@/features/agency-filters';
import { SearchFiltersBar, MobileSearchHeader, MobileFiltersSheet } from '@/widgets/search-filters-bar';
import { Button } from '@/shared/ui/button';
import { getAgenciesList } from '@/shared/api';
import type { AgencyCardData } from '@/entities/agency';

interface AgenciesPageProps {
    locale: string;
    initialAgencies?: AgencyCardData[];
}

/**
 * Страница поиска агентств недвижимости
 * Использует единый SearchFiltersBar с категорией "professionals"
 */
export function AgenciesPage({ locale, initialAgencies = [] }: AgenciesPageProps) {
    const t = useTranslations('agency');
    const tCommon = useTranslations('common');

    const [agencies, setAgencies] = useState<AgencyCardData[]>(initialAgencies);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const { filters } = useAgencyFilters();

    // Загрузка агентств
    const loadAgencies = useCallback(
        async (pageNum: number, append = false) => {
            setIsLoading(true);
            try {
                const result = await getAgenciesList(filters, pageNum, 12, locale);

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
        [filters, locale]
    );

    // Загрузка при изменении фильтров
    useEffect(() => {
        setPage(1);
        loadAgencies(1, false);
    }, [loadAgencies]);

    // Загрузить ещё
    const handleLoadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadAgencies(nextPage, true);
    }, [page, loadAgencies]);

    // For agencies: open mobile filters
    const handleOpenFilters = () => {
        setIsMobileFiltersOpen(true);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Мобильный хедер */}
            <div className="md:hidden">
                <MobileSearchHeader
                    onOpenFilters={handleOpenFilters}
                    currentCategory="professionals"
                />
            </div>

            {/* Мобильный sheet фильтров */}
            <MobileFiltersSheet
                open={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
                currentCategory="professionals"
            />

            {/* Десктоп: единый хедер фильтров */}
            <div className="hidden md:block">
                <SearchFiltersBar currentCategory="professionals" />
            </div>

            {/* Список агентств */}
            <div className="max-w-6xl mx-auto px-4 py-6 md:pt-16">
                {isLoading && agencies.length === 0 ? (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {agencies.map((agency) => (
                                <AgencyCard
                                    key={agency.id}
                                    agency={agency}
                                    locale={locale}
                                />
                            ))}
                        </div>

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
