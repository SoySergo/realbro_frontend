'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { X, Trash2, Check } from 'lucide-react';

type LocationModeActionsProps = {
    /** Есть ли локальные данные для очистки */
    hasLocalData: boolean;
    /** Колбэк для очистки локальных данных */
    onClear: () => void;
    /** Колбэк для применения фильтров (сохранения в URL/store) */
    onApply: () => void;
    /** Колбэк для закрытия панели */
    onClose?: () => void;
    /** Показывать ли кнопку закрытия */
    showClose?: boolean;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Универсальные кнопки действий для режимов фильтра локации
 * Используется в isochrone, draw, radius, search режимах
 */
export function LocationModeActions({
    hasLocalData,
    onClear,
    onApply,
    onClose,
    showClose = true,
    className,
}: LocationModeActionsProps) {
    const t = useTranslations('locationFilter.actions');

    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                {/* Кнопка очистки локальных данных */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClear}
                    disabled={!hasLocalData}
                    className="flex-1"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('clear')}
                </Button>

                {/* Кнопка применения фильтров */}
                <Button
                    size="sm"
                    onClick={onApply}
                    disabled={!hasLocalData}
                    className="flex-1 bg-brand-primary hover:bg-brand-primary-hover"
                >
                    <Check className="h-4 w-4 mr-2" />
                    {t('save')}
                </Button>

                {/* Кнопка закрытия (опционально) */}
                {showClose && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="shrink-0 h-9 w-9 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
