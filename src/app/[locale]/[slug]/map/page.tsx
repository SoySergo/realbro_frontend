'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { LayoutGrid, List as ListIcon, Home, Search, Heart, User, FingerprintIcon } from 'lucide-react';
import { MobileMapSidebar, type MobileSnapState } from '@/widgets/map-sidebar';
import { MobileSearchHeader, MobileFiltersSheet } from '@/widgets/search-filters-bar';
import { Button } from '@/shared/ui/button';
import { Link } from '@/shared/config/routing';
import { cn } from '@/shared/lib/utils';
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

    // Состояние мобильного bottom sheet
    const [mobileSnapState, setMobileSnapState] = useState<MobileSnapState>('half');

    // Состояние мобильных фильтров
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
    const isExpanded = mobileSnapState === 'expanded';

    return (
        <div className="relative h-full slug-desktop:rounded-[9px] overflow-hidden">
            <SearchMap
                onMarkerClick={handleMarkerClick}
                onClusterClick={handleClusterClick}
            />

            {/* Mobile: хедер + фильтры + bottom sheet + навигация */}
            <div className="slug-desktop:hidden">
                {/* Мобильный хедер с фильтрами */}
                {!isExpanded && (
                    <MobileSearchHeader onOpenFilters={() => setIsMobileFiltersOpen(true)} />
                )}

                {/* Мобильный sheet фильтров */}
                <MobileFiltersSheet
                    open={isMobileFiltersOpen}
                    onOpenChange={setIsMobileFiltersOpen}
                />

                {/* Bottom sheet со списком */}
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
                        className="fixed left-4 z-40 gap-2 shadow-lg bg-brand-primary hover:bg-brand-primary/90 text-white h-10 px-4 rounded-lg"
                        style={{ bottom: `${64 + 12}px` }}
                    >
                        <ListIcon className="w-5 h-5" />
                        <span className="font-medium">{tMapSidebar('showAsList')}</span>
                    </Button>
                )}

                {/* Нижняя навигация — 5 элементов по макету */}
                <MapBottomNavigation />
            </div>
            {/* Кнопка переключения на список */}
            <Link
                href={`/${slug}/catalog`}
                className="absolute top-3 right-3 z-10 flex items-center gap-2 h-9 px-3 rounded-md bg-background text-text-primary text-sm font-medium shadow-md hover:bg-background-secondary transition-colors"
            >
                <LayoutGrid className="w-4 h-4" />
                {t('viewList')}
            </Link>
        </div>
    );
}

/**
 * Нижняя навигация для мобильной карты — 5 иконок по макету Figma:
 * Home, Search, AI Agent (центральная), Favorites, Profile
 */
function MapBottomNavigation() {
    const t = useTranslations('sidebar');

    const navItems = [
        { id: 'home', icon: Home, labelKey: 'home', href: '/' as const },
        { id: 'search', icon: Search, labelKey: 'search', href: '/search' as const },
        { id: 'agent', icon: FingerprintIcon, labelKey: 'aiAgent', isCenter: true },
        { id: 'favorites', icon: Heart, labelKey: 'favorites', href: '/favorites' as const },
        { id: 'profile', icon: User, labelKey: 'profile', href: '/profile' as const },
    ];

    return (
        <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    if (item.isCenter) {
                        return (
                            <button
                                key={item.id}
                                aria-label={t(item.labelKey)}
                                className="relative flex items-center justify-center -mt-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center shadow-lg">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.id}
                            href={item.href!}
                            aria-label={t(item.labelKey)}
                            className={cn(
                                'relative flex flex-col items-center justify-center',
                                'w-full h-full gap-1 rounded-lg transition-colors',
                                'text-text-secondary hover:text-text-primary active:text-brand-primary'
                            )}
                        >
                            <Icon className="w-6 h-6" />
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
