'use client';

import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';

type DrawPolygonActionsProps = {
    /** Колбэк для редактирования полигона */
    onEdit: () => void;
    /** Колбэк для удаления полигона */
    onDelete: () => void;
    /** Переводы текстов */
    translations: {
        edit: string;
        delete: string;
    };
};

/**
 * Popup с действиями для завершённого полигона
 * Появляется при клике на полигон
 * 
 * Действия:
 * - Редактировать - перейти в режим редактирования точек
 * - Удалить - удалить полигон
 */
export function DrawPolygonActions({ onEdit, onDelete, translations }: DrawPolygonActionsProps) {
    return (
        <div className="flex flex-col gap-2 p-3 min-w-[180px]">
            <Button
                onClick={onEdit}
                size="sm"
                className="w-full justify-start bg-brand-primary hover:bg-brand-primary-hover text-white"
            >
                <Edit className="h-4 w-4 mr-2" />
                {translations.edit}
            </Button>

            <Button
                onClick={onDelete}
                size="sm"
                variant="destructive"
                className="w-full justify-start"
            >
                <Trash className="h-4 w-4 mr-2" />
                {translations.delete}
            </Button>
        </div>
    );
}
