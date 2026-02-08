import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getAgenciesList } from '@/shared/api';
import { AgenciesPage } from '@/screens/agencies-page';
import type { AgencyCardData } from '@/entities/agency';

// ISR: revalidate every 3600 seconds
export const revalidate = 3600;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'agency' });

    return {
        title: t('searchAgencies'),
        description: t('searchAgencies'),
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    let initialAgencies: AgencyCardData[];
    try {
        const result = await getAgenciesList({}, 1, 12, locale);
        initialAgencies = result.data;
    } catch {
        initialAgencies = [];
    }

    return (
        <Suspense fallback={<AgenciesListSkeleton />}>
            <AgenciesPage locale={locale} initialAgencies={initialAgencies} />
        </Suspense>
    );
}

function AgenciesListSkeleton() {
    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex flex-col">
                <div className="flex-1 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
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
                </div>
            </main>
        </div>
    );
}
