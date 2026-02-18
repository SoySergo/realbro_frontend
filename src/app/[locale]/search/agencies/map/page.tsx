'use client';

import { Suspense } from 'react';
import { AgenciesMapPage } from '@/screens/agencies-map-page';

/**
 * /search/agencies/map - клиентская страница с картой агентств
 */
export default function Page() {
    return (
        <Suspense fallback={<AgenciesMapSkeleton />}>
            <AgenciesMapPage />
        </Suspense>
    );
}

function AgenciesMapSkeleton() {
    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-14 pb-16 md:pb-0 flex flex-col md:flex-row">
                <div className="flex-1 relative">
                    <div className="absolute z-10 inset-0 md:pt-[52px]">
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
                <div className="hidden md:block w-80 bg-background border-l border-border">
                    <div className="p-3 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-background-secondary animate-pulse rounded-lg" />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
