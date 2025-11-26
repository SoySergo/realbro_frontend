'use client';

import { Button } from '@/shared/ui/button';
import { Pencil, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

type DrawControlsProps = {
    /** Есть ли уже нарисованные полигоны */
    hasPolygons: boolean;
    /** Режим рисования активен */
    isDrawing: boolean;
    /** Колбэк для начала рисования */
    onStartDrawing: () => void;
    /** Количество полигонов (для проверки лимита) */
    polygonsCount?: number;
};

// Максимальное количество полигонов
const MAX_POLYGONS = 4;

/**
 * Кнопки управления рисованием полигонов
 * Показывает "Начать рисование" или "Добавить полигон"
 */
export function DrawControls({
    hasPolygons,
    isDrawing,
    onStartDrawing,
    polygonsCount = 0,
}: DrawControlsProps) {
    const t = useTranslations('draw');

    // Не показываем кнопки во время рисования
    if (isDrawing) return null;

    // Проверка достижения лимита
    const limitReached = polygonsCount >= MAX_POLYGONS;

    return (
        <div className="space-y-2">
            {!hasPolygons ? (
                <Button onClick={onStartDrawing} className="w-full" variant="default">
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('startDrawing')}
                </Button>
            ) : (
                <Button
                    onClick={onStartDrawing}
                    className="w-full"
                    variant="outline"
                    disabled={limitReached}
                    title={limitReached ? t('maxPolygonsReached') : undefined}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addPolygon')}
                </Button>
            )}
        </div>
    );
}
