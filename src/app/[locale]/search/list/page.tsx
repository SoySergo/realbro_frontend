import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import {
    getPropertiesListServer,
    parseFiltersFromSearchParams,
} from '@/shared/api/properties-server';
import { SearchListPage } from '@/screens/search-list-page';

// ISR: revalidate every 60 seconds
export const revalidate = 60;

// Generate metadata for SEO
export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'listing' });

    return {
        title: t('title'),
        description: t('metaDescription'),
    };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const resolvedSearchParams = await searchParams;

    // Parse filters from URL
    const filters = parseFiltersFromSearchParams(resolvedSearchParams);

    // Parse pagination
    const page = resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1;
    const sortBy = (resolvedSearchParams.sortBy as 'price' | 'area' | 'createdAt') || 'createdAt';
    const sortOrder = (resolvedSearchParams.sortOrder as 'asc' | 'desc') || 'desc';

    // Fetch data on server (ISR cached)
    const initialData = await getPropertiesListServer({
        filters,
        page,
        limit: 24,
        sortBy,
        sortOrder,
    });

    return (
        <Suspense fallback={<SearchListSkeleton />}>
            <SearchListPage
                initialData={initialData}
                initialFilters={filters}
                initialPage={page}
                initialSortBy={sortBy}
                initialSortOrder={sortOrder}
            />
        </Suspense>
    );
}

function SearchListSkeleton() {
    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex flex-col">
                {/* Skeleton header */}
                <div className="shrink-0 hidden md:block">
                    <div className="w-full bg-background-secondary border-b border-border">
                        <div className="flex items-center gap-2 px-4 py-3">
                            <div className="h-8 w-32 bg-background animate-pulse rounded" />
                            <div className="h-8 w-24 bg-background animate-pulse rounded" />
                        </div>
                    </div>
                </div>

                {/* Skeleton grid */}
                <div className="flex-1 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-card rounded-xl overflow-hidden border border-border"
                            >
                                <div className="aspect-square bg-background-secondary animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-6 w-24 bg-background-secondary animate-pulse rounded" />
                                    <div className="h-4 w-32 bg-background-secondary animate-pulse rounded" />
                                    <div className="h-4 w-full bg-background-secondary animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
