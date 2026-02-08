'use client';

import React from 'react';
import Image from 'next/image';
import { X, Scale, ChevronRight, Trash2 } from 'lucide-react';
import { cn, safeImageSrc } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { useComparisonStore, useComparisonCount, COMPARISON_MAX_ITEMS } from '../model';
import type { Property } from '@/entities/property';

export interface FloatingComparisonBarTranslations {
    compare: string;
    clearAll: string;
    selected: string;
    outOf: string;
    openComparison: string;
}

interface FloatingComparisonBarProps {
    translations: FloatingComparisonBarTranslations;
    onOpenComparison: () => void;
    className?: string;
}

/**
 * FloatingComparisonBar - Плавающая панель внизу экрана для сравнения
 * 
 * Показывает превью выбранных объектов и кнопку перехода к сравнению.
 * Автоматически скрывается когда нет объектов для сравнения.
 */
export function FloatingComparisonBar({
    translations,
    onOpenComparison,
    className,
}: FloatingComparisonBarProps) {
    const t = translations;
    const { getComparisonProperties, removeFromComparison, clearComparison } = useComparisonStore();
    const count = useComparisonCount();

    const properties = getComparisonProperties();

    // Не показываем если нет объектов
    if (count === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50',
                'bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl',
                'p-3 md:p-4',
                'flex items-center gap-3 md:gap-4',
                'animate-in slide-in-from-bottom-4 duration-300',
                'max-w-[95vw] md:max-w-2xl',
                className
            )}
        >
            {/* Превью объектов */}
            <div className="flex items-center gap-2 overflow-hidden flex-shrink-0">
                {properties.map((property) => (
                    <PropertyThumb
                        key={property.id}
                        property={property}
                        onRemove={() => removeFromComparison(property.id)}
                    />
                ))}
                {/* Пустые слоты */}
                {Array.from({ length: COMPARISON_MAX_ITEMS - count }).map((_, idx) => (
                    <div
                        key={`empty-${idx}`}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 border-dashed border-border bg-background-secondary flex items-center justify-center flex-shrink-0"
                    >
                        <Scale className="w-4 h-4 text-text-tertiary" />
                    </div>
                ))}
            </div>

            {/* Счётчик и действия */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <div className="text-sm text-text-secondary whitespace-nowrap hidden sm:block">
                    <span className="font-semibold text-text-primary">{count}</span>
                    <span className="mx-1">{t.outOf}</span>
                    <span>{COMPARISON_MAX_ITEMS}</span>
                </div>

                {/* Кнопка очистки */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearComparison}
                    className="text-text-tertiary hover:text-error hover:bg-error/10 p-2 h-auto"
                    title={t.clearAll}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>

                {/* Кнопка сравнения */}
                <Button
                    onClick={onOpenComparison}
                    className="gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white"
                    disabled={count < 2}
                >
                    <Scale className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.compare}</span>
                    <ChevronRight className="w-4 h-4 hidden sm:block" />
                </Button>
            </div>
        </div>
    );
}

/**
 * Превью объекта в плавающей панели
 */
function PropertyThumb({
    property,
    onRemove,
}: {
    property: Property;
    onRemove: () => void;
}) {
    return (
        <div className="relative group flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 border-border">
                {property.images[0] ? (
                    <Image
                        src={safeImageSrc(property.images[0])}
                        alt={property.title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-background-secondary flex items-center justify-center">
                        <Scale className="w-4 h-4 text-text-tertiary" />
                    </div>
                )}
            </div>
            {/* Кнопка удаления */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className={cn(
                    'absolute -top-1 -right-1 w-5 h-5 rounded-full',
                    'bg-error text-white flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'cursor-pointer hover:bg-error/80'
                )}
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}
