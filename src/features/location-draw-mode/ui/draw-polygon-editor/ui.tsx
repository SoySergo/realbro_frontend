'use client';

import { Button } from '@/shared/ui/button';
import { Check, X, Undo } from 'lucide-react';

type DrawPolygonEditorProps = {
    /** Количество точек в текущем полигоне */
    pointsCount: number;
    /** Колбэк для завершения полигона */
    onComplete: () => void;
    /** Колбэк для отмены рисования */
    onCancel: () => void;
    /** Колбэк для отмены последней точки */
    onUndo: () => void;
    /** Переводы текстов */
    translations: {
        points: string;
        save: string;
        minThreePoints: string;
        undo: string;
        cancel: string;
    };
};

/**
 * Popup с кнопками редактора полигона
 * Отображается рядом с первой точкой во время рисования
 * 
 * Кнопки:
 * - Сохранить (Check) - завершить полигон (мин. 3 точки)
 * - Отменить точку (Undo) - удалить последнюю точку
 * - Отменить всё (X) - отменить рисование полностью
 */
export function DrawPolygonEditor({
    pointsCount,
    onComplete,
    onCancel,
    onUndo,
    translations,
}: DrawPolygonEditorProps) {
    // Минимум 3 точки для завершения полигона
    const canComplete = pointsCount >= 3;
    const canUndo = pointsCount > 0;

    return (
        <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg shadow-lg">
            {/* Сохранить */}
            <Button
                onClick={onComplete}
                disabled={!canComplete}
                size="sm"
                className="bg-success hover:bg-success/90 text-white shadow-sm disabled:opacity-50 h-8 px-3"
                title={canComplete ? translations.save : translations.minThreePoints}
            >
                <Check className="h-4 w-4" />
            </Button>

            {/* Шаг назад */}
            <Button
                onClick={onUndo}
                disabled={!canUndo}
                size="sm"
                variant="outline"
                className="shadow-sm disabled:opacity-50 h-8 px-3"
                title={translations.undo}
            >
                <Undo className="h-4 w-4" />
            </Button>

            {/* Отменить всё */}
            <Button
                onClick={onCancel}
                size="sm"
                variant="destructive"
                className="shadow-sm h-8 px-3"
                title={translations.cancel}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
