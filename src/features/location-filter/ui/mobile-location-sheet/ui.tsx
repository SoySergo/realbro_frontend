"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Search, Pencil, Clock, Circle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { useFilterStore } from '@/widgets/search-filters-bar';
import type { LocationFilterMode } from '@/features/location-filter/model';

// Импорт контролов для радиуса (использоваться будет на карте через MapRadius)

interface MobileLocationSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Конфигурация табов режимов
const LOCATION_MODES = [
    { mode: 'search' as LocationFilterMode, icon: Search, key: 'locationSearch' },
    { mode: 'draw' as LocationFilterMode, icon: Pencil, key: 'locationDraw' },
    { mode: 'isochrone' as LocationFilterMode, icon: Clock, key: 'locationTimeFrom' },
    { mode: 'radius' as LocationFilterMode, icon: Circle, key: 'locationRadius' },
];

/**
 * Полноэкранный мобильный компонент для работы с локацией
 * - Карта занимает весь экран
 * - Табы режимов вверху (search, draw, isochrone, radius)
 * - Панель управления внизу (зависит от выбранного режима)
 */
export function MobileLocationSheet({ open, onOpenChange }: MobileLocationSheetProps) {
    const t = useTranslations('filters');
    const { activeLocationMode, setLocationMode } = useFilterStore();

    // Локальное состояние режима (применяется только по кнопке "Применить")
    const [localMode, setLocalMode] = useState<LocationFilterMode>(() => activeLocationMode || 'radius');

    // Применение фильтра: переводим режим в глобальный store и закрываем окно
    const handleApply = () => {
        setLocationMode(localMode);
        console.log('Applied location mode:', localMode);
        onOpenChange(false);
    };

    // Очистка фильтра (локально)
    const handleClear = () => {
        // В мобильной версии очистка происходит на самой карте через MapRadius
        console.log('Cleared location filter');
    };

    // Закрытие без применения
    const handleClose = () => {
        onOpenChange(false);
    };

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-110 animate-in fade-in duration-75"
                onClick={handleClose}
            />

            {/* Content */}
            {/* Основной контейнер - прозрачный, чтобы использовать уже инициализированную карту под ним */}
            <div className="fixed inset-0 bg-transparent z-120 flex flex-col animate-in slide-in-from-bottom duration-75">
                {/* Header с табами режимов */}
                <div className="shrink-0 bg-background border-b border-border">
                    {/* Верхняя строка с заголовком и кнопкой закрытия */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <h2 className="text-lg font-semibold text-text-primary">{t('location')}</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>

                    {/* Табы режимов — иконки без текста */}
                    <div className="flex items-center gap-2 px-3 py-2">
                        {LOCATION_MODES.map(({ mode, icon: Icon }) => {
                            const isActive = localMode === mode;
                            return (
                                <button
                                    key={mode}
                                    onClick={() => setLocalMode(mode)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center py-2 px-2 rounded-lg transition-all',
                                        isActive
                                            ? 'bg-brand-primary text-white'
                                            : 'text-text-secondary hover:bg-background-secondary'
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Карта под прозрачным оверлеем (используется существующий инстанс) */}
                <div className="flex-1 relative pointer-events-none">
                    {/* пустое пространство — клики проходят к карте ниже */}
                </div>

                {/* Панель управления внизу (зависит от режима) */}
                <div className="shrink-0 bg-background border-t border-border">
                    {/* В мобильном режиме все действия (выбор точки, контролы) выполняются на самой карте
                        Поэтому здесь показываем превью / кнопку "Открыть на карте" */}
                    {localMode === 'radius' && (
                        <div className="px-4 py-4 space-y-4 pointer-events-auto">
                            <p className="text-sm text-text-secondary">{t('locationRadius')}</p>

                            <Button
                                variant="outline"
                                className="w-full h-12 flex items-center justify-center gap-2"
                                onClick={() => {
                                    // Активируем режим на карте и скрываем меню фильтров
                                    setLocationMode('radius');
                                    onOpenChange(false);
                                }}
                            >
                                <Circle className="w-5 h-5" />
                                {t('selectPoint')}
                            </Button>
                        </div>
                    )}

                    {/* TODO: Панели для других режимов */}
                    {localMode === 'search' && (
                        <div className="px-4 py-4">
                            <p className="text-sm text-text-secondary text-center">
                                Режим поиска (в разработке)
                            </p>
                        </div>
                    )}
                    {localMode === 'draw' && (
                        <div className="px-4 py-4">
                            <p className="text-sm text-text-secondary text-center">
                                Режим рисования (в разработке)
                            </p>
                        </div>
                    )}
                    {localMode === 'isochrone' && (
                        <div className="px-4 py-4">
                            <p className="text-sm text-text-secondary text-center">
                                Режим времени в пути (в разработке)
                            </p>
                        </div>
                    )}

                    {/* Футер с кнопками */}
                    <div className="px-4 py-3 border-t border-border bg-background">
                        <div className="flex gap-3">
                            <Button
                                onClick={handleClear}
                                className="flex-1 h-11"
                                variant="ghost"
                            >
                                {t('clear')}
                            </Button>
                            <Button
                                onClick={handleApply}
                                className="flex-1 h-11 bg-brand-primary text-white"
                                variant="default"
                            >
                                {t('apply')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
