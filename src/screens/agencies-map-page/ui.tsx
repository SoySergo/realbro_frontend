'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import {
    SearchFiltersBar,
    MobileSearchHeader,
    MobileFiltersSheet,
} from '@/widgets/search-filters-bar';
import { AgencyCard } from '@/entities/agency';
import { useAgencyFilters } from '@/features/agency-filters';
import { getAgenciesList } from '@/shared/api';
import type { AgencyCardData } from '@/entities/agency';

/**
 * Страница карты агентств — плейсхолдер
 * Использует единый SearchFiltersBar с категорией "professionals"
 */
export function AgenciesMapPage() {
    const t = useTranslations('agency');
    const [agencies, setAgencies] = useState<AgencyCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const { filters } = useAgencyFilters();

    // Загрузка агентств
    const loadAgencies = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getAgenciesList(filters, 1, 20, 'ru');
            setAgencies(result.data);
        } catch (error) {
            console.error('Failed to load agencies:', error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadAgencies();
    }, [loadAgencies]);

    return (
        <div className="flex h-dvh bg-background overflow-hidden">
            <main className="flex-1 md:ml-16 md:pb-0 flex flex-col md:flex-row">
                {/* Мобильный хедер */}
                <div className="md:hidden">
                    <MobileSearchHeader
                        onOpenFilters={() => setIsMobileFiltersOpen(true)}
                        currentCategory="professionals"
                    />
                </div>

                {/* Мобильный sheet фильтров */}
                <MobileFiltersSheet
                    open={isMobileFiltersOpen}
                    onOpenChange={setIsMobileFiltersOpen}
                    currentCategory="professionals"
                />

                {/* Контейнер карты */}
                <div className="flex-1 relative">
                    <div className="absolute inset-0 md:relative md:h-screen w-full">
                        {/* Панель фильтров поверх карты — только desktop */}
                        <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
                            <SearchFiltersBar currentCategory="professionals" />
                        </div>

                        {/* Плейсхолдер карты */}
                        <div className="absolute z-10 inset-0 md:pt-14">
                            <div className="w-full h-full bg-background-secondary flex items-center justify-center">
                                <div className="text-center">
                                    <Building2 className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                                    <p className="text-text-secondary">{t('searchAgencies')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Сайдбар со списком агентств — desktop */}
                <div className="hidden md:flex flex-col w-80 bg-background border-l border-border h-screen overflow-hidden">
                    <div className="p-3 border-b border-border">
                        <h3 className="text-sm font-semibold text-text-primary">
                            {t('agencies')} ({agencies.length})
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-24 bg-background-secondary animate-pulse rounded-lg" />
                            ))
                        ) : agencies.length === 0 ? (
                            <div className="text-center py-8">
                                <Building2 className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
                                <p className="text-sm text-text-secondary">{t('noAgenciesFound')}</p>
                            </div>
                        ) : (
                            agencies.map((agency) => (
                                <AgencyCard
                                    key={agency.id}
                                    agency={agency}
                                    locale="ru"
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Мобильный сайдбар — bottom sheet */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background rounded-t-2xl border-t border-border shadow-lg max-h-[50vh] overflow-y-auto">
                    <div className="flex justify-center pt-2 pb-1">
                        <div className="w-10 h-1 bg-border rounded-full" />
                    </div>
                    <div className="p-3 space-y-3">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-background-secondary animate-pulse rounded-lg" />
                            ))
                        ) : (
                            agencies.slice(0, 5).map((agency) => (
                                <AgencyCard
                                    key={agency.id}
                                    agency={agency}
                                    locale="ru"
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
