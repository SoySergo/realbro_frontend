import { Button } from '@/components/ui/button';
import { Check, X, Undo } from 'lucide-react';

type PolygonEditorProps = {
    pointsCount: number;
    onComplete: () => void;
    onCancel: () => void;
    onUndoLastPoint: () => void;
};

/**
 * Кнопки управления при рисовании полигона
 * Сохранить / Шаг назад / Отменить
 * Отображаются рядом с первой точкой полигона
 */
export function PolygonEditor({ pointsCount, onComplete, onCancel, onUndoLastPoint }: PolygonEditorProps) {
    // Минимум 3 точки для завершения полигона
    const canComplete = pointsCount >= 3;
    const canUndo = pointsCount > 0;

    return (
        <div className="flex gap-2">
            {/* Сохранить */}
            <Button
                onClick={onComplete}
                disabled={!canComplete}
                size="sm"
                className="bg-success hover:bg-success/90 text-white shadow-lg disabled:opacity-50"
                title={canComplete ? 'Сохранить полигон' : 'Минимум 3 точки'}
            >
                <Check className="w-4 h-4" />
            </Button>

            {/* Шаг назад */}
            <Button
                onClick={onUndoLastPoint}
                disabled={!canUndo}
                size="sm"
                variant="outline"
                className="shadow-lg disabled:opacity-50"
                title="Отменить последнюю точку"
            >
                <Undo className="w-4 h-4" />
            </Button>

            {/* Отменить всё */}
            <Button
                onClick={onCancel}
                size="sm"
                variant="destructive"
                className="shadow-lg"
                title="Отменить рисование"
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}
