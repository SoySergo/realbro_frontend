'use client';

import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { LocationModeActions } from '@/features/location-filter/ui/location-mode-actions';
import { cn } from '@/shared/lib/utils';

type LocationModeWrapperProps = {
    /** Заголовок режима (название режима из локализации) */
    title: string;
    /** Контент режима (компоненты формы) */
    children: React.ReactNode;
    /** Зафиксированный контент (не скролится, например инпут поиска) */
    fixedContent?: React.ReactNode;
    /** Есть ли локальные данные для очистки */
    hasLocalData: boolean;
    /** Колбэк для очистки локальных данных */
    onClear: () => void;
    /** Колбэк для применения фильтров (сохранения в URL/store) */
    onApply: () => void;
    /** Колбэк для закрытия панели режима */
    onClose: () => void;
    /** Состояние загрузки при сохранении */
    isSaving?: boolean;
    /** CSS классы для контейнера */
    className?: string;
};

/**
 * Универсальная обёртка для всех режимов фильтра локации
 *
 * Структура:
 * - Вверху: Заголовок режима + Крестик (закрыть)
 * - В центре: Контент режима (children)
 * - Внизу: Кнопки действий (Очистить, Сохранить)
 *
 * Используется в: isochrone, draw, radius, search режимах
 */
export function LocationModeWrapper({
    title,
    children,
    fixedContent,
    hasLocalData,
    onClear,
    onApply,
    onClose,
    isSaving = false,
    className,
}: LocationModeWrapperProps) {
    return (
        <div className={cn('flex flex-col bg-background border border-border rounded-lg shadow-lg max-h-[calc(100vh-200px)]', className)}>
            {/* Шапка: Заголовок + Крестик */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    disabled={isSaving}
                    className="h-8 w-8 p-0 hover:bg-background-secondary"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Зафиксированный контент (если есть) */}
            {fixedContent && (
                <div className="px-4 pt-4 shrink-0">
                    {fixedContent}
                </div>
            )}

            {/* Контент режима - скролируемая область */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 min-h-0" style={{ paddingTop: fixedContent ? '1rem' : '1rem' }}>
                {children}
            </div>

            {/* Футер: Кнопки действий */}
            <div className="px-4 py-3 border-t border-border shrink-0">
                <LocationModeActions
                    hasLocalData={hasLocalData}
                    onClear={onClear}
                    onApply={onApply}
                    showClose={false}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
