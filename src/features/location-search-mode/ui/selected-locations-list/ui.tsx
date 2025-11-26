'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import type { LocationItem } from '@/entities/location';

type SelectedLocationsListProps = {
    /** Массив выбранных локаций */
    locations: LocationItem[];
    /** Колбэк для удаления локации */
    onRemove: (wikidata: string) => void;
};

/**
 * Компактный список выбранных локаций
 * Отображается в одну строку с горизонтальным скроллом
 * Показывает имя локации + тип (серым) + кнопка удалить
 */
export function SelectedLocationsList({ locations, onRemove }: SelectedLocationsListProps) {
    const t = useTranslations('locationSearch');

    console.log('[SelectedLocationsList] Rendering with locations:', locations.length, locations.map(l => l.name));

    if (locations.length === 0) {
        console.log('[SelectedLocationsList] No locations, returning null');
        return null;
    }

    // Форматирование типа локации
    const formatType = (type: string): string => {
        return t(`types.${type}`);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
                {t('selectedLocations')} ({locations.length})
            </label>

            {/* Список с нативным скроллом и тенями */}
            <div className="relative">
                <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <div className="flex flex-col gap-2 pr-2">
                        {locations.map((location) => {
                            // Проверка корректности данных локации
                            if (!location || !location.name || !location.type) {
                                console.warn('[SelectedLocationsList] Invalid location data:', location);
                                return null;
                            }

                            // Уникальный ключ для элемента
                            const key = location.wikidata || `loc-${location.id || location.name}`;

                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        'flex items-center justify-between gap-3 px-3 py-2 rounded-md',
                                        'bg-background-secondary border border-border',
                                        'hover:border-brand-primary/50 transition-colors',
                                        'min-h-10'
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

                                    {/* Кнопка удаления */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const wikidataId = location.wikidata || '';
                                            if (wikidataId) {
                                                onRemove(wikidataId);
                                            }
                                        }}
                                        className="h-6 w-6 p-0 hover:bg-error/10 hover:text-error shrink-0"
                                        title={t('remove')}
                                        aria-label={`${t('remove')} ${location.name}`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
