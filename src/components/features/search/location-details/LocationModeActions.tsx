'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { LocationFilterMode } from '@/types/filter';

interface LocationModeActionsProps {
    // Текущий режим
    currentMode: LocationFilterMode;

    // Есть ли данные в текущем режиме
    hasCurrentData: boolean;

    // Режимы с данными (кроме текущего)
    otherModesWithData: LocationFilterMode[];

    // Коллбэки
    onClear: () => void;
    onApply: () => void;
    onExit: () => void; // Закрытие панели

    // Опционально: кастомная проверка disabled для кнопки Apply
    applyDisabled?: boolean;
}

/**
 * Общий компонент кнопок управления для режимов локации
 * 
 * 3 кнопки:
 * - Очистить: очищает локальное состояние текущего режима
 * - Сохранить: применяет данные в store (с предупреждением если есть данные в других режимах)
 * - X: закрывает панель (с предупреждением если есть несохранённые данные)
 */
export function LocationModeActions({
    currentMode,
    hasCurrentData,
    otherModesWithData,
    onClear,
    onApply,
    onExit,
    applyDisabled = false,
}: LocationModeActionsProps) {
    const t = useTranslations('filters');

    // Стейт для алертов
    const [showExitAlert, setShowExitAlert] = useState(false);
    const [showSaveAlert, setShowSaveAlert] = useState(false);

    // Обработчик кнопки X (выход)
    const handleExitClick = () => {
        // Если есть несохранённые данные - показываем алерт
        if (hasCurrentData) {
            setShowExitAlert(true);
        } else {
            onExit();
        }
    };

    // Подтверждение выхода
    const handleConfirmExit = () => {
        setShowExitAlert(false);
        onExit();
    };

    // Обработчик кнопки "Сохранить"
    const handleSaveClick = () => {
        // Если есть данные в других режимах - показываем алерт
        if (otherModesWithData.length > 0) {
            setShowSaveAlert(true);
        } else {
            onApply();
        }
    };

    // Подтверждение сохранения
    const handleConfirmSave = () => {
        setShowSaveAlert(false);
        onApply();
    };

    // Получить название режима для отображения
    const getModeName = (mode: LocationFilterMode): string => {
        const modeNames: Record<LocationFilterMode, string> = {
            search: t('locationSearch'),
            draw: t('locationDraw'),
            isochrone: t('locationTimeFrom'),
            radius: t('locationRadius'),
        };
        return modeNames[mode];
    };

    return (
        <>
            <div className="flex items-center gap-2 ml-auto">
                {/* Кнопка "Очистить" */}
                {hasCurrentData && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className={cn(
                            "h-8 cursor-pointer",
                            "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <X className="w-4 h-4 mr-1" />
                        {t('clear')}
                    </Button>
                )}

                {/* Кнопка "Сохранить" */}
                <Button
                    size="sm"
                    onClick={handleSaveClick}
                    disabled={!hasCurrentData || applyDisabled}
                    className={cn(
                        "h-8 cursor-pointer",
                        "bg-brand-primary hover:bg-brand-primary-hover text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <Check className="w-4 h-4 mr-1" />
                    {t('save')}
                </Button>

                {/* Кнопка закрыть (X) */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExitClick}
                    className={cn(
                        "h-8 cursor-pointer",
                        "text-text-secondary hover:text-text-primary"
                    )}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Алерт при выходе с несохранёнными данными */}
            <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
                <AlertDialogContent className="bg-background border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-text-primary">
                            {t('exitConfirmTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-text-secondary">
                            {t('exitConfirmDescription', { mode: getModeName(currentMode) })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border hover:bg-background-secondary">
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmExit}
                            className="bg-error hover:bg-error/90 text-white"
                        >
                            {t('exitAnyway')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Алерт при сохранении с потерей данных других режимов */}
            <AlertDialog open={showSaveAlert} onOpenChange={setShowSaveAlert}>
                <AlertDialogContent className="bg-background border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-text-primary">
                            {t('saveConfirmTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-text-secondary">
                            {t('saveConfirmDescription', {
                                currentMode: getModeName(currentMode),
                                otherModes: otherModesWithData.map(m => getModeName(m)).join(', ')
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border hover:bg-background-secondary">
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmSave}
                            className="bg-brand-primary hover:bg-brand-primary-hover text-white"
                        >
                            {t('saveAnyway')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
