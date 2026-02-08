'use client';

import { useCallback, useRef, useState } from 'react';
import { toast as sonnerToast } from 'sonner';
import { X, ThumbsUp, ThumbsDown, StickyNote, Home, User2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Property } from '@/entities/property';

export interface PropertyToast {
    id: string;
    property: Property;
    filterName?: string;
    timestamp: number;
}

export interface PropertyToastLabels {
    newProperty: string;
    view: string;
    like?: string;
    dislike?: string;
    note?: string;
    rooms?: string;
}

interface PropertyToastContentProps {
    toast: PropertyToast;
    toastId: string | number;
    onLike?: (propertyId: string) => void;
    onDislike?: (propertyId: string) => void;
    onNote?: (propertyId: string) => void;
    onOpen?: (property: Property) => void;
    labels: PropertyToastLabels;
}

/**
 * Контент тоста с информацией о новом объекте
 * Используется внутри sonner toast. Clickable карточка, кнопки like/dislike/note
 */
function PropertyToastContent({
    toast: propertyToast,
    toastId,
    onLike,
    onDislike,
    onNote,
    onOpen,
    labels,
}: PropertyToastContentProps) {
    const { property, filterName } = propertyToast;
    const mainImage = property.images?.[0];

    // Свайп-поддержка
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });

    const handleDismiss = useCallback(() => {
        sonnerToast.dismiss(toastId);
    }, [toastId]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const deltaX = e.touches[0].clientX - touchStartRef.current.x;
        const deltaY = e.touches[0].clientY - touchStartRef.current.y;
        setSwipeOffset({
            x: deltaX,
            y: Math.min(0, deltaY),
        });
    }, []);

    const handleTouchEnd = useCallback(() => {
        const threshold = 80;
        if (Math.abs(swipeOffset.x) > threshold || swipeOffset.y < -threshold) {
            handleDismiss();
        } else {
            setSwipeOffset({ x: 0, y: 0 });
        }
        touchStartRef.current = null;
    }, [swipeOffset, handleDismiss]);

    const handleClick = useCallback(() => {
        onOpen?.(property);
        handleDismiss();
    }, [property, onOpen, handleDismiss]);

    const handleLike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onLike?.(property.id);
    }, [property.id, onLike]);

    const handleDislike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDislike?.(property.id);
    }, [property.id, onDislike]);

    const handleNote = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onNote?.(property.id);
    }, [property.id, onNote]);

    return (
        <div
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                transform: `translateX(${swipeOffset.x}px) translateY(${swipeOffset.y}px)`,
                transition: swipeOffset.x === 0 && swipeOffset.y === 0 ? 'transform 0.2s ease-out' : 'none',
            }}
            className="cursor-pointer w-full"
        >
            {/* Заголовок с иконкой агента и кнопкой закрытия */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <User2 className="w-3.5 h-3.5 text-brand-primary" />
                </div>
                <span className="text-xs text-muted-foreground truncate">{labels.newProperty}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                    }}
                    className="ml-auto shrink-0 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground active:scale-95"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Превью объекта */}
            <div className="flex gap-3">
                {/* Изображение */}
                <div className="w-18 h-14 md:w-24 md:h-18 shrink-0 rounded-lg overflow-hidden bg-background-secondary">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={property.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-6 h-6 text-text-tertiary" />
                        </div>
                    )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-semibold text-card-foreground truncate">
                        {property.price.toLocaleString()} €
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {property.rooms > 0 && `${property.rooms} ${labels.rooms ?? 'комн.'} · `}
                        {property.area} m²
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {property.address}
                        {filterName && ` · ${filterName}`}
                    </p>
                </div>
            </div>

            {/* Кнопки действий — внизу */}
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-success hover:bg-success/10 transition-all active:scale-95 touch-manipulation"
                    title={labels.like}
                >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{labels.like}</span>
                </button>
                <button
                    onClick={handleDislike}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-error hover:bg-error/10 transition-all active:scale-95 touch-manipulation"
                    title={labels.dislike}
                >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{labels.dislike}</span>
                </button>
                <button
                    onClick={handleNote}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/10 transition-all active:scale-95 touch-manipulation"
                    title={labels.note}
                >
                    <StickyNote className="w-4 h-4" />
                    <span>{labels.note}</span>
                </button>
            </div>
        </div>
    );
}

interface PropertyToastContainerProps {
    toasts: PropertyToast[];
    onDismiss: (id: string) => void;
    onLike?: (propertyId: string) => void;
    onDislike?: (propertyId: string) => void;
    onNote?: (propertyId: string) => void;
    onOpen?: (property: Property) => void;
    labels: PropertyToastLabels;
}

/**
 * Контейнер для показа property тостов через sonner
 * Рендерится один раз, слушает изменения toasts массива и показывает sonner тосты
 */
export function PropertyToastContainer({
    toasts,
    onDismiss,
    onLike,
    onDislike,
    onNote,
    onOpen,
    labels,
}: PropertyToastContainerProps) {
    // Отслеживаем показанные тосты чтобы не дублировать
    const shownRef = useRef<Set<string>>(new Set());

    // Показываем новые тосты через sonner
    toasts.forEach((propertyToast) => {
        if (shownRef.current.has(propertyToast.id)) return;
        shownRef.current.add(propertyToast.id);

        sonnerToast.custom(
            (toastId) => (
                <PropertyToastContent
                    toast={propertyToast}
                    toastId={toastId}
                    onLike={onLike}
                    onDislike={onDislike}
                    onNote={onNote}
                    onOpen={onOpen}
                    labels={labels}
                />
            ),
            {
                id: propertyToast.id,
                duration: 30000,
                position: 'top-center',
                className: cn(
                    'w-full max-w-[380px] md:max-w-[420px]',
                    'bg-card border border-border rounded-xl shadow-lg p-3',
                ),
                onDismiss: () => {
                    shownRef.current.delete(propertyToast.id);
                    onDismiss(propertyToast.id);
                },
                onAutoClose: () => {
                    shownRef.current.delete(propertyToast.id);
                    onDismiss(propertyToast.id);
                },
            }
        );
    });

    // Убираем тосты, которые были удалены из массива
    const currentIds = new Set(toasts.map((t) => t.id));
    shownRef.current.forEach((id) => {
        if (!currentIds.has(id)) {
            sonnerToast.dismiss(id);
            shownRef.current.delete(id);
        }
    });

    return null;
}
