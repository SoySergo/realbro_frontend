import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';

type MapDrawControlsProps = {
    hasPolygons: boolean;
    isDrawing: boolean;
    onStartDrawing: () => void;
    onClearAll: () => void;
};

/**
 * Панель управления рисованием полигонов
 */
export function MapDrawControls({
    hasPolygons,
    isDrawing,
    onStartDrawing,
    onClearAll,
}: MapDrawControlsProps) {
    return (
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
            {!isDrawing && (
                <Button
                    onClick={onStartDrawing}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg"
                >
                    <Pencil className="w-4 h-4 mr-2" />
                    Начать рисование
                </Button>
            )}

            {hasPolygons && !isDrawing && (
                <Button
                    onClick={onClearAll}
                    variant="destructive"
                    className="shadow-lg"
                >
                    <Trash className="w-4 h-4 mr-2" />
                    Очистить всё
                </Button>
            )}
        </div>
    );
}
