'use client';

import { memo, useCallback, useMemo, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useRafCallback, useReducedMotion, useDebouncedCallback } from '@/shared/hooks';
import type { LocationItem } from '@/entities/location';

type SelectedLocationsListProps = {
    /** Массив выбранных локаций */
    locations: LocationItem[];
    /** Колбэк для удаления локации */
    onRemove: (wikidata: string) => void;
};

type LocationItemProps = {
    location: LocationItem;
    onRemove: (wikidata: string) => void;
    formatType: (type: string) => string;
    removeLabel: string;
    prefersReducedMotion: boolean;
};

/**
 * Мемоизированный элемент списка локаций
 * Оптимизирован для предотвращения лишних ререндеров
 */
const LocationListItem = memo(function LocationListItem({
    location,
    onRemove,
    formatType,
    removeLabel,
    prefersReducedMotion,
}: LocationItemProps) {
    // RAF-обёртка для плавного удаления
    const rafRemove = useRafCallback(onRemove);

    // Debounce для предотвращения множественных кликов
    const debouncedRemove = useDebouncedCallback(rafRemove, 50);

    // Мемоизированный обработчик удаления с stopPropagation
    const handleRemove = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            const wikidataId = location.wikidata || '';
            if (wikidataId) {
                debouncedRemove(wikidataId);
            }
        },
        [location.wikidata, debouncedRemove]
    );

    // Проверка корректности данных локации
    if (!location || !location.name || !location.type) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-3 px-3 py-2 rounded-md',
                'bg-background-secondary border border-border',
                'min-h-10 will-change-transform',
                // Отключаем анимации если пользователь предпочитает уменьшенное движение
                prefersReducedMotion
                    ? 'hover:border-brand-primary/50'
                    : 'hover:border-brand-primary/50 transition-colors'
            )}
        >
            {/* Информация о локации */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-text-primary truncate">
                    {location.name}
                </span>
                <span className="text-xs text-text-tertiary whitespace-nowrap shrink-0">
                    {formatType(location.type)}
                </span>
            </div>

            {/* Кнопка удаления - нативный button для лучшей производительности */}
            <button
                type="button"
                onClick={handleRemove}
                className={cn(
                    'h-6 w-6 p-0 shrink-0 rounded-sm',
                    'flex items-center justify-center',
                    'text-text-tertiary hover:bg-error/10 hover:text-error',
                    'touch-manipulation', // Оптимизация для touch-устройств
                    prefersReducedMotion ? '' : 'transition-colors active:scale-95'
                )}
                title={removeLabel}
                aria-label={`${removeLabel} ${location.name}`}
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
});

/**
 * Компактный список выбранных локаций
 * Оптимизирован для производительности на мобильных устройствах:
 * - React.memo для предотвращения лишних ререндеров
 * - useCallback для мемоизации обработчиков
 * - will-change для оптимизации анимаций
 * - touch-manipulation для быстрой реакции на тап
 */
export const SelectedLocationsList = memo(function SelectedLocationsList({
    locations,
    onRemove,
}: SelectedLocationsListProps) {
    const t = useTranslations('locationSearch');

    // Проверка предпочтения уменьшенного движения
    const prefersReducedMotion = useReducedMotion();

    // Мемоизированная функция форматирования типа
    const formatType = useCallback(
        (type: string): string => {
            return t(`types.${type}`);
        },
        [t]
    );

    // Мемоизированная метка удаления
    const removeLabel = useMemo(() => t('remove'), [t]);

    // Мемоизированный список ключей для быстрого сравнения
    const locationKeys = useMemo(
        () => locations.map((loc) => loc.wikidata || `loc-${loc.id || loc.name}`),
        [locations]
    );

    if (locations.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
                {t('selectedLocations')} ({locations.length})
            </label>

            {/* Список с нативным скроллом */}
            <div className="relative">
                <div
                    className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overscroll-contain"
                    style={{ WebkitOverflowScrolling: 'touch' }} // Плавный скролл на iOS
                >
                    <div className="flex flex-col gap-2 pr-2">
                        {locations.map((location, index) => (
                            <LocationListItem
                                key={locationKeys[index]}
                                location={location}
                                onRemove={onRemove}
                                formatType={formatType}
                                removeLabel={removeLabel}
                                prefersReducedMotion={prefersReducedMotion}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});
