'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import { MobileMapSidebar, type MobileSnapState } from '@/widgets/map-sidebar';
import { BottomNavigation } from '@/widgets/sidebar';
import { Button } from '@/shared/ui/button';
import type { PropertyGridCard } from '@/entities/property';

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
    const tMapSidebar = useTranslations('mapSidebar');
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const locale = params.locale as string;

    // Состояние мобильного bottom sheet
    const [mobileSnapState, setMobileSnapState] = useState<MobileSnapState>('half');

    // Состояние выбранного маркера / кластера
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [clusterPropertyIds, setClusterPropertyIds] = useState<string[] | undefined>(undefined);

    // Клик по объекту
    const handlePropertyClick = useCallback((property: PropertyGridCard) => {
        router.push(`/${locale}/property/${property.slug || property.id}`);
    }, [router, locale]);

    // Клик по маркеру на карте
    const handleMarkerClick = useCallback((propertyId: string) => {
        setSelectedPropertyId(propertyId);
        setClusterPropertyIds(undefined);
    }, []);

    // Клик по кластеру
    const handleClusterClick = useCallback((propertyIds: string[]) => {
        setClusterPropertyIds(propertyIds);
        setSelectedPropertyId(null);
    }, []);

    // Сброс кластера
    const handleClusterReset = useCallback(() => {
        setClusterPropertyIds(undefined);
        setSelectedPropertyId(null);
    }, []);

    const isCollapsed = mobileSnapState === 'collapsed';

    return (
        <div className="relative h-full slug-desktop:rounded-[9px] overflow-hidden">
            <SearchMap
                onMarkerClick={handleMarkerClick}
                onClusterClick={handleClusterClick}
            />

            {/* Desktop: кнопка переключения на список */}
            <button
                onClick={() => router.push(`/${locale}/${slug}/catalog`)}
                className="hidden slug-desktop:flex absolute top-3 right-3 z-10 items-center gap-2 h-9 px-3 rounded-md bg-background text-text-primary text-sm font-medium shadow-md hover:bg-background-secondary transition-colors"
            >
                <LayoutGrid className="w-4 h-4" />
                {t('viewList')}
            </button>

            {/* Mobile: MobileMapSidebar (bottom sheet) */}
            <div className="slug-desktop:hidden">
                <MobileMapSidebar
                    onPropertyClick={handlePropertyClick}
                    selectedPropertyId={selectedPropertyId}
                    clusterPropertyIds={clusterPropertyIds}
                    onClusterReset={handleClusterReset}
                    snapState={mobileSnapState}
                    onSnapStateChange={setMobileSnapState}
                />

                {/* Кнопка «Список» — отображается когда bottom sheet полностью скрыт */}
                {isCollapsed && (
                    <Button
                        onClick={() => setMobileSnapState('expanded')}
                        className="fixed left-4 bottom-20 z-40 gap-2 shadow-lg bg-brand-primary hover:bg-brand-primary/90 text-white h-10 px-4 rounded-lg"
                    >
                        <ListIcon className="w-5 h-5" />
                        <span className="font-medium">{tMapSidebar('showAsList')}</span>
                    </Button>
                )}

                {/* Нижняя навигация */}
                <BottomNavigation />
            </div>
        </div>
    );
}
