'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Pen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useLocalLocationState } from '@/hooks/useLocalLocationState';
import { LocationModeActions } from './LocationModeActions';
import type { DrawPolygon } from '@/types/filter';

/**
 * Режим рисования области на карте
 * Позволяет пользователю нарисовать произвольный полигон на карте
 * 
 * ДВУХСЛОЙНАЯ СИСТЕМА:
 * - Локальный слой (localStorage): временные изменения до применения
 * - Глобальный слой (store): применённые фильтры
 */

type LocationDrawModeProps = {
    /** Коллбэк для активации режима рисования на карте */
    onActivateDrawing: () => void;
    /** Коллбэк для удаления полигона с карты */
    onDeletePolygon?: (polygonId: string) => void;
    /** Текущий нарисованный полигон (передаётся с карты) */
    drawnPolygon?: DrawPolygon | null;
};

export function LocationDrawMode({
    onActivateDrawing,
    onDeletePolygon,
    drawnPolygon
}: LocationDrawModeProps) {
    const t = useTranslations('filters');

    const {
        activeLocationMode,
        locationFilter,
        setLocationFilter,
        setLocationMode,
    } = useFilterStore();

    // Локальное состояние для этого режима
    const {
        currentLocalState,
        updateDrawState,
        clearLocalState,
        getModesWithData,
        loadFromGlobalFilter,
        forceCleanLocalStorage,
    } = useLocalLocationState(activeLocationMode);

    // Локальный полигон (до применения)
    const localDrawState = currentLocalState as { polygon: DrawPolygon | null } | null;
    const localPolygon = useMemo(
        () => localDrawState?.polygon || null,
        [localDrawState]
    );

    // Название полигона (редактируемое)
    const [polygonName, setPolygonName] = useState(localPolygon?.name || '');

    // Состояние рисования
    const [isDrawing, setIsDrawing] = useState(false);

    // Инициализация: при открытии режима загружаем из глобального фильтра
    useEffect(() => {
        if (locationFilter?.mode === 'draw') {
            loadFromGlobalFilter('draw', locationFilter);
            console.log('[LOCAL] Loaded draw mode from global filter');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeLocationMode]);

    // Обновление названия при изменении локального полигона
    useEffect(() => {
        if (localPolygon?.name) {
            setPolygonName(localPolygon.name);
        }
    }, [localPolygon]);

    // Синхронизация нарисованного полигона с локальным состоянием
    useEffect(() => {
        if (drawnPolygon && isDrawing) {
            updateDrawState({ polygon: drawnPolygon });
            setIsDrawing(false);
            console.log('[LOCAL] Polygon drawn and saved to local state');
        }
    }, [drawnPolygon, isDrawing, updateDrawState]);

    // Активация режима рисования
    const handleStartDrawing = () => {
        setIsDrawing(true);
        onActivateDrawing();
        console.log('[DRAW] Drawing mode activated');
    };

    // Удаление полигона
    const handleDeletePolygon = () => {
        if (localPolygon && onDeletePolygon) {
            onDeletePolygon(localPolygon.id);
        }
        clearLocalState('draw');
        console.log('[LOCAL] Polygon deleted from local state');
    };

    // Обновление названия полигона
    const handleNameChange = (name: string) => {
        setPolygonName(name);
        if (localPolygon) {
            updateDrawState({
                polygon: {
                    ...localPolygon,
                    name,
                },
            });
        }
    };

    // Очистка локального состояния (кнопка "Очистить")
    const handleClear = () => {
        if (localPolygon && onDeletePolygon) {
            onDeletePolygon(localPolygon.id);
        }
        clearLocalState('draw');
        setPolygonName('');
        console.log('[LOCAL] Cleared local draw state');
    };

    // Выход из режима (кнопка X)
    const handleExit = () => {
        // Если был нарисован полигон - удаляем его с карты
        if (localPolygon && onDeletePolygon) {
            onDeletePolygon(localPolygon.id);
        }
        // Полностью очищаем ВСЕ локальные состояния
        forceCleanLocalStorage();
        // Закрываем панель деталей
        setLocationMode(null);
        console.log('[LOCAL] Exited draw mode and cleaned all local states');
    };

    // Сохранение фильтра в глобальный store
    const handleSave = () => {
        if (!localPolygon) return;

        // Применяем локальные изменения в глобальный store
        setLocationFilter({
            mode: 'draw',
            polygon: {
                ...localPolygon,
                name: polygonName || t('drawnArea'),
            },
        });

        // Полностью очищаем localStorage после сохранения
        forceCleanLocalStorage();

        // Закрываем панель деталей
        setLocationMode(null);

        console.log('[GLOBAL] Draw filter saved');
        console.log('[LOCAL] Cleaned localStorage after save');
    };

    return (
        <>
            <div className="flex items-center gap-3 flex-wrap flex-1">
                <Label className="text-sm text-text-primary">
                    {t('locationDraw')}:
                </Label>

                {/* Если полигон не нарисован - показываем кнопку "Начать рисование" */}
                {!localPolygon && (
                    <>
                        <div className="text-sm text-text-secondary">
                            {t('drawAreaHint')}
                        </div>
                        <Button
                            size="sm"
                            onClick={handleStartDrawing}
                            disabled={isDrawing}
                            className={cn(
                                'h-8 cursor-pointer transition-colors',
                                'bg-brand-primary hover:bg-brand-primary-hover text-white',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            <Pen className="w-4 h-4 mr-1.5" />
                            {isDrawing ? t('drawing') : t('startDrawing')}
                        </Button>
                    </>
                )}

                {/* Если полигон нарисован - показываем информацию и поле для названия */}
                {localPolygon && (
                    <>
                        <Input
                            type="text"
                            value={polygonName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(e.target.value)}
                            placeholder={t('polygonNamePlaceholder')}
                            className={cn(
                                'w-[200px] h-9 px-3 text-sm rounded-md transition-colors',
                                'bg-background border border-border',
                                'text-text-primary placeholder:text-text-tertiary',
                                'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
                                'hover:border-border-hover'
                            )}
                        />

                        <div className="text-xs text-text-secondary">
                            {t('polygonDrawn')}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDeletePolygon}
                            className={cn(
                                'h-8 cursor-pointer',
                                'text-error hover:text-error hover:bg-error/10'
                            )}
                        >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            {t('deletePolygon')}
                        </Button>
                    </>
                )}
            </div>

            {/* Кнопки управления */}
            <LocationModeActions
                currentMode="draw"
                hasCurrentData={!!localPolygon}
                otherModesWithData={getModesWithData('draw')}
                onClear={handleClear}
                onApply={handleSave}
                onExit={handleExit}
            />
        </>
    );
}
