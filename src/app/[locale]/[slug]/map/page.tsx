'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';

const SearchMap = dynamic(
    () => import('@/features/map').then((mod) => ({ default: mod.SearchMap })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-background-secondary flex items-center justify-center rounded-xl">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
        ),
    }
);

export default function MapPage() {
    const t = useTranslations('filters');
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const locale = params.locale as string;

    return (
        <div className="relative h-full rounded-[9px] overflow-hidden">
            <SearchMap />

            {/* Кнопка переключения на список */}
            <button
                onClick={() => router.push(`/${locale}/${slug}/catalog`)}
                className="absolute top-3 right-3 z-10 flex items-center gap-2 h-9 px-3 rounded-md bg-background text-text-primary text-sm font-medium shadow-md hover:bg-background-secondary transition-colors"
            >
                <LayoutGrid className="w-4 h-4" />
                {t('viewList')}
            </button>
        </div>
    );
}
