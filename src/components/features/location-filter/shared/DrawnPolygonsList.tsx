'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit, Trash, MapPin, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { DrawPolygon } from '@/types/draw';

type DrawnPolygonsListProps = {
    /** Массив нарисованных полигонов */
    polygons: DrawPolygon[];
    /** Колбэк для редактирования полигона */
    onEdit: (id: string) => void;
    /** Колбэк для удаления полигона */
    onDelete: (id: string) => void;
    /** Колбэк для выбора полигона (подсветка на карте) */
    onSelect?: (id: string | null) => void;
    /** ID выбранного полигона */
    selectedId?: string | null;
};

// Максимальное количество полигонов
const MAX_POLYGONS = 4;

/**
 * Список нарисованных полигонов
 * Показывает карточки с информацией о каждом полигоне
 * Паттерн взят из LocationSearch (строки 160-189)
 */
export function DrawnPolygonsList({
    polygons,
    onEdit,
    onDelete,
    onSelect,
    selectedId,
}: DrawnPolygonsListProps) {
    const t = useTranslations('draw');

    if (polygons.length === 0) return null;

    // Форматирование даты создания
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Проверка достижения лимита
    const limitReached = polygons.length >= MAX_POLYGONS;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
                {t('drawnPolygons')} ({polygons.length}/{MAX_POLYGONS})
            </label>

            {/* Предупреждение о достижении лимита */}
            {limitReached && (
                <Alert variant="warning" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        {t('maxPolygonsReached')}
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                {polygons.map((polygon) => {
                    const isSelected = selectedId === polygon.id;

                    return (
                        <div
                            key={polygon.id}
                            onClick={() => onSelect?.(isSelected ? null : polygon.id)}
                            className={cn(
                                'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                                isSelected
                                    ? 'bg-brand-primary/10 border-brand-primary'
                                    : 'bg-background-secondary border-border hover:border-brand-primary/50'
                            )}
                        >
                            {/* Иконка */}
                            <MapPin className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />

                            {/* Информация */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary">
                                    {t('polygonName', { number: polygons.indexOf(polygon) + 1 })}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-text-tertiary">
                                        {polygon.points.length} {t('points')}
                                    </p>
                                    <span className="text-xs text-text-tertiary">•</span>
                                    <p className="text-xs text-text-tertiary">
                                        {formatDate(polygon.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Действия */}
                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(polygon.id);
                                    }}
                                    className="h-8 w-8 p-0"
                                    title={t('edit')}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(polygon.id);
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-error/10 hover:text-error"
                                    title={t('delete')}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
