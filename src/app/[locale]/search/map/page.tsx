'use client';

import { Suspense } from 'react';
import { SearchMapPage } from '@/screens/search-map-page';

/**
 * /search/map - полностью клиентская страница с картой
 *
 * - Клиентский рендеринг для интерактивности
 * - Lazy loading Mapbox GL JS
 * - Skeleton при загрузке
 */
export default function Page() {
    return (
        <Suspense fallback={<SearchMapSkeleton />}>
            <SearchMapPage />
        </Suspense>
    );
}

function SearchMapSkeleton() {
    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 flex flex-col md:flex-row">
                {/* Mobile header skeleton */}
                <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background-secondary border-b border-border">
                    <div className="flex items-center gap-2 px-3 py-2.5">
                        <div className="flex-1 h-10 bg-background animate-pulse rounded-lg" />
                        <div className="w-12 h-10 bg-background animate-pulse rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2 px-3 pb-2 overflow-hidden">
                        <div className="h-8 w-24 bg-background animate-pulse rounded shrink-0" />
                        <div className="h-8 w-28 bg-background animate-pulse rounded shrink-0" />
                        <div className="h-8 w-24 bg-background animate-pulse rounded shrink-0" />
                    </div>
                </div>

                <div className="flex-1 relative">
                    {/* Mobile header offset */}
                    <div className="h-[104px] md:hidden" />

                    {/* Desktop filters skeleton */}
                    <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
                        <div className="w-full bg-background-secondary border-b border-border">
                            <div className="flex items-center gap-2 px-4 py-3">
                                <div className="h-8 w-32 bg-background animate-pulse rounded" />
                                <div className="h-8 w-24 bg-background animate-pulse rounded" />
                                <div className="h-8 w-24 bg-background animate-pulse rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Map skeleton */}
                    <div className="absolute z-10 inset-0 md:pt-[60px]">
                        <div className="w-full h-full bg-background-secondary animate-pulse flex items-center justify-center">
                            <div className="text-text-tertiary">
                                <svg
                                    className="w-16 h-16 animate-pulse"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar skeleton - desktop only */}
                <div className="hidden md:block w-80 bg-background border-l border-border">
                    <div className="p-3 border-b border-border">
                        <div className="h-8 w-full bg-background-secondary animate-pulse rounded" />
                    </div>
                    <div className="p-3 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-24 bg-background-secondary animate-pulse rounded-lg"
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
