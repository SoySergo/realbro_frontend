'use client';

import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import type { LocationItem as LocationItemType } from '../../model/types';

interface LocationItemProps {
    /** Локация для отображения */
    location: LocationItemType;
    /** Колбэк для удаления локации */
    onRemove?: (wikidata: string) => void;
    /** Функция для форматирования типа локации */
    formatType?: (type: string) => string;
    /** Дополнительные классы */
    className?: string;
}

/**
 * LocationItem - Презентационный компонент для отображения одной локации
 * 
 * Используется для отображения выбранной локации с кнопкой удаления
 */
export function LocationItem({
    location,
    onRemove,
    formatType,
    className,
}: LocationItemProps) {
    // Проверка корректности данных локации
    if (!location || !location.name || !location.type) {
        console.warn('[LocationItem] Invalid location data:', location);
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
                'min-h-10',
                className
            )}
        >
            {/* Информация о локации */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-medium text-text-primary truncate">
                    {location.name}
                </span>
                <span className="text-xs text-text-tertiary whitespace-nowrap shrink-0">
                    {formatType ? formatType(location.type) : location.type}
                </span>
            </div>

            {/* Кнопка удаления */}
            {onRemove && (
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
                    title="Remove"
                    aria-label={`Remove ${location.name}`}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
}
