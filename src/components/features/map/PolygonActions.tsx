import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';

type PolygonActionsProps = {
    onEdit: () => void;
    onDelete: () => void;
};

/**
 * Действия с завершённым полигоном (редактировать/удалить)
 * Появляются при клике на полигон
 */
export function PolygonActions({ onEdit, onDelete }: PolygonActionsProps) {
    return (
        <div className="flex gap-2">
            <Button
                onClick={onEdit}
                size="sm"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg"
            >
                <Edit className="w-4 h-4 mr-1" />
                Редактировать
            </Button>

            <Button
                onClick={onDelete}
                size="sm"
                variant="destructive"
                className="shadow-lg"
            >
                <Trash className="w-4 h-4 mr-1" />
                Удалить
            </Button>
        </div>
    );
}
