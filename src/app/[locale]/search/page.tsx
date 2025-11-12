import { Sidebar } from '@/components/layout/sidebar';
import { PropertyMap } from '@/components/features/map/PropertyMap';
import { FilterBar } from '@/components/features/search/FilterBar';
import { setRequestLocale } from 'next-intl/server';


type Props = {
    params: Promise<{ locale: string }>;
};

export default async function SearchPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar (Desktop + Mobile) */}
            <Sidebar />

            {/* Основной контент с картой */}
            <main className="flex-1 md:ml-16 pb-16 md:pb-0">
                {/* Отступ сверху для мобильного верхнего меню */}
                <div className="h-20 md:hidden" />

                {/* Контейнер карты и фильтров */}
                <div className="relative h-[calc(100vh-5rem)] md:h-screen w-full">
                    {/* Панель фильтров поверх карты */}
                    <div className="absolute top-0 left-0 right-0 z-50">
                        <FilterBar />

                    </div>

                    {/* Карта на всю высоту */}
                    <div className="absolute z-10 inset-0">
                        <PropertyMap />
                    </div>
                </div>
            </main>
        </div>
    );
}
