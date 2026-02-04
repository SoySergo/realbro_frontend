'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import { AgencyCard } from '@/entities/agency';
import { AgencyFiltersBar } from '@/features/agency-filters';
import { Button } from '@/shared/ui/button';
import { getAgenciesList } from '@/shared/api';
import type { AgencyCardData, AgencyFilters } from '@/entities/agency';

interface AgenciesPageProps {
    locale: string;
    initialAgencies?: AgencyCardData[];
}

/**
 * Страница поиска агентств недвижимости
 * Отображает список агентств с фильтрами
 */
export function AgenciesPage({ locale, initialAgencies = [] }: AgenciesPageProps) {
    const t = useTranslations('agency');
    const tCommon = useTranslations('common');

    const [agencies, setAgencies] = useState<AgencyCardData[]>(initialAgencies);
    const [filters, setFilters] = useState<AgencyFilters>({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

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

    return (
        <div className="min-h-screen bg-background">
            {/* Заголовок */}
            <div className="bg-background-secondary border-b border-border">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                        {t('agencies')}
                    </h1>
                    <p className="text-text-secondary mt-1">
                        {t('searchAgencies')}
                    </p>
                </div>
            </div>

            {/* Фильтры */}
            <AgencyFiltersBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
            />

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
