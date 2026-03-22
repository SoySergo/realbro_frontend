'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { MapPin } from 'lucide-react';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { useRouter } from '@/shared/config/routing';
import { cn } from '@/shared/lib/utils';
import type { LocationFilterMode } from '@/features/location-filter/model';

/**
 * Кнопка-тогл для режима фильтрации локации.
 * При нажатии: активируется режим "search" (по умолчанию), появляются табы над панелью.
 * При повторном нажатии: деактивируется.
 *
 * Если есть сохранённый фильтр — показывает иконку и количество.
 */
// Режимы, требующие карту для работы
const MAP_REQUIRED_MODES: LocationFilterMode[] = ['draw', 'isochrone', 'radius', 'search'];

export function LocationFilterButton() {
    const t = useTranslations('filters');
    const { locationFilter, activeLocationMode, setLocationMode, currentFilters } = useFilterStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleToggle = () => {
        if (activeLocationMode) {
            // Выключаем режим локации
            setLocationMode(null);
        } else {
            // Включаем режим локации — восстанавливаем сохранённый мод или по умолчанию "search"
            const defaultMode: LocationFilterMode = locationFilter?.mode || 'search';

            // Если на странице листинга — редирект на карту
            const isOnListPage = pathname?.includes('/search/properties/list') || pathname?.includes('/search/agencies/list');
            if (MAP_REQUIRED_MODES.includes(defaultMode) && isOnListPage) {
                setLocationMode(defaultMode);
                router.push(`/search/properties/map?openMode=${defaultMode}`);
                return;
            }

            setLocationMode(defaultMode);
        }
    };

    // Состояние кнопки: панель открыта vs фильтр применён
    const hasGeometryIds = !!(currentFilters.polygonIds?.length);
    const hasSearchLocations = !!(locationFilter?.mode === 'search' && locationFilter.selectedLocations?.length);
    const isPanelOpen = !!activeLocationMode;
    const hasAppliedFilter = hasGeometryIds || hasSearchLocations;
    const isActive = isPanelOpen;

    // Подсчёт выбранных параметров (учитываем множественные полигоны)
    const getSelectedCount = (): number => {
        if (!locationFilter) {
            // Проверяем наличие геометрий в фильтрах даже без locationFilter
            const polygonCount = currentFilters.polygonIds?.length || 0;
            if (polygonCount > 0) return polygonCount;
            return 0;
        }

        switch (locationFilter.mode) {
            case 'search':
                return locationFilter.selectedLocations?.length || 0;
            case 'draw': {
                // Учитываем множественные полигоны из фильтров
                const idsCount = currentFilters.polygonIds?.length || 0;
                return idsCount > 0 ? idsCount : (locationFilter.polygon ? 1 : 0);
            }
            case 'isochrone':
                return locationFilter.isochrone ? 1 : 0;
            case 'radius':
                return locationFilter.radius ? 1 : 0;
            default:
                return 0;
        }
    };

    const selectedCount = getSelectedCount();

    return (
        <button
            onClick={handleToggle}
            className={cn(
                'flex h-9 items-center justify-between gap-2 rounded-md cursor-pointer',
                'px-3 py-2 text-sm whitespace-nowrap transition-all duration-200',
                // Неактивное состояние (нет ни панели, ни фильтра)
                !isActive && !hasAppliedFilter && 'bg-background border border-border dark:border-transparent text-text-primary hover:text-text-primary',
                // Фильтр применён, но панель закрыта
                !isActive && hasAppliedFilter && 'bg-brand-primary/10 border border-brand-primary text-brand-primary hover:bg-brand-primary/20',
                // Панель открыта
                isActive && 'bg-brand-primary text-white border border-brand-primary',
                isActive && 'hover:bg-brand-primary-hover'
            )}
        >
            <MapPin className="w-4 h-4" />
            <span>{t('location')}</span>
            {selectedCount > 0 && (
                <span className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-white/80' : hasAppliedFilter ? 'text-brand-primary' : 'text-text-tertiary'
                )}>
                    (+{selectedCount})
                </span>
            )}
        </button>
    );
}
