'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Режим рисования области на карте
 * Позволяет пользователю нарисовать произвольный полигон на карте
 */

type LocationDrawModeProps = {
    onActivateDrawing: () => void;
};

export function LocationDrawMode({ onActivateDrawing }: LocationDrawModeProps) {
    const t = useTranslations('filters');

    return (
        <div className="flex items-center gap-3">
            <Label className="text-sm text-text-primary">
                {t('locationDraw')}:
            </Label>
            <div className="text-sm text-text-secondary">
                Нарисуйте область на карте
            </div>
            <Button
                size="sm"
                onClick={onActivateDrawing}
                className={cn(
                    "h-8 cursor-pointer",
                    "bg-brand-primary hover:bg-brand-primary-hover text-white"
                )}
            >
                Начать рисование
            </Button>
        </div>
    );
}
