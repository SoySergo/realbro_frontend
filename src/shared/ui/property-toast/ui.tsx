'use client';

import { useCallback, useRef, useState, memo, useEffect } from 'react';
import { toast as sonnerToast } from 'sonner';
import { X, ThumbsUp, ThumbsDown, StickyNote, Home, User2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PropertyChatCard } from '@/entities/property/model/card-types';
import { getImageUrl } from '@/entities/property/model/card-types';

export interface PropertyToast {
    id: string;
    property: PropertyChatCard;
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
    onOpen?: (property: PropertyChatCard) => void;
    labels: PropertyToastLabels;
}

/**
 * Контент тоста с информацией о новом объекте
 * Используется внутри sonner toast. Clickable карточка, кнопки like/dislike/note
 * Мемоизирован для оптимизации производительности
 */
const PropertyToastContent = memo(function PropertyToastContent({
    toast: propertyToast,
    toastId,
    onLike,
    onDislike,
    onNote,
    onOpen,
    labels,
}: PropertyToastContentProps) {
    const { property, filterName } = propertyToast;
    const mainImage = property.images?.[0] ? getImageUrl(property.images[0]) : undefined;

    // Свайп-поддержка
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);

    const handleDismiss = useCallback(() => {
        sonnerToast.dismiss(toastId);
    }, [toastId]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
        isDragging.current = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        const deltaX = e.touches[0].clientX - touchStartRef.current.x;
        const deltaY = e.touches[0].clientY - touchStartRef.current.y;

        // Отмечаем что началась drag gesture
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            isDragging.current = true;
        }

        setSwipeOffset({
            x: deltaX,
            y: Math.min(0, deltaY),
        });
    }, []);

    const handleTouchEnd = useCallback(() => {
        const threshold = 80;
        const shouldDismiss = Math.abs(swipeOffset.x) > threshold || swipeOffset.y < -threshold;

        if (shouldDismiss) {
            handleDismiss();
        } else {
            setSwipeOffset({ x: 0, y: 0 });
        }

        touchStartRef.current = null;
        // Сбрасываем флаг с небольшой задержкой чтобы не сработал клик
        setTimeout(() => {
            isDragging.current = false;
        }, 100);
    }, [swipeOffset, handleDismiss]);

    const handleClick = useCallback(() => {
        // Не открываем если идет свайп
        if (isDragging.current) return;

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
            className="cursor-pointer w-full will-change-transform"
            style={{
                transform: `translate3d(${swipeOffset.x}px, ${swipeOffset.y}px, 0)`,
                transition: swipeOffset.x === 0 && swipeOffset.y === 0 ? 'transform 0.2s ease-out' : 'none',
            }}
        >
            {/* Заголовок с иконкой агента и кнопкой закрытия */}
            <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <User2 className="w-3.5 h-3.5 text-brand-primary" />
                </div>
                <span className="text-xs font-medium text-foreground truncate">{labels.newProperty}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                    }}
                    className="ml-auto shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground active:scale-95"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Превью объекта */}
            <div className="flex gap-3 mb-3">
                {/* Изображение - больше на desktop */}
                <div className="w-20 h-16 md:w-28 md:h-22 lg:w-32 lg:h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={property.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/40" />
                        </div>
                    )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-bold text-foreground truncate mb-1">
                        {property.price.toLocaleString()} €
                    </p>
                    <p className="text-xs text-muted-foreground truncate mb-0.5">
                        {property.rooms > 0 && `${property.rooms} ${labels.rooms ?? 'комн.'} · `}
                        {property.area} m²
                    </p>
                    <p className="text-xs text-muted-foreground truncate line-clamp-2">
                        {property.address}
                        {filterName && ` · ${filterName}`}
                    </p>
                </div>
            </div>

            {/* Кнопки действий - оптимизированы для мобильных */}
            <div className="flex items-center gap-1 pt-2 border-t border-border/50">
                <button
                    onClick={handleLike}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-success hover:bg-success/10 transition-colors active:scale-95 touch-manipulation"
                    title={labels.like}
                    aria-label={labels.like}
                >
                    <ThumbsUp className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{labels.like}</span>
                </button>
                <button
                    onClick={handleDislike}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-error hover:bg-error/10 transition-colors active:scale-95 touch-manipulation"
                    title={labels.dislike}
                    aria-label={labels.dislike}
                >
                    <ThumbsDown className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{labels.dislike}</span>
                </button>
                <button
                    onClick={handleNote}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/10 transition-colors active:scale-95 touch-manipulation"
                    title={labels.note}
                    aria-label={labels.note}
                >
                    <StickyNote className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{labels.note}</span>
                </button>
            </div>
        </div>
    );
});

interface PropertyToastContainerProps {
    toasts: PropertyToast[];
    onDismiss: (id: string) => void;
    onLike?: (propertyId: string) => void;
    onDislike?: (propertyId: string) => void;
    onNote?: (propertyId: string) => void;
    onOpen?: (property: PropertyChatCard) => void;
    labels: PropertyToastLabels;
}

/**
 * Контейнер для показа property тостов через sonner
 * Оптимизирован с useEffect для предотвращения лишних рендеров
 * Мемоизирован для улучшения производительности
 */
export const PropertyToastContainer = memo(function PropertyToastContainer({
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
    const prevToastsRef = useRef<PropertyToast[]>([]);

    // Обработка новых тостов в useEffect для оптимизации
    useEffect(() => {
        const prevIds = new Set(prevToastsRef.current.map(t => t.id));
        const currentIds = new Set(toasts.map(t => t.id));

        // Показываем новые тосты
        toasts.forEach((propertyToast) => {
            if (shownRef.current.has(propertyToast.id)) return;

            // Добавляем в отслеживаемые
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
                        'w-full max-w-[380px] md:max-w-[480px] lg:max-w-[520px]',
                        'bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl p-3.5',
                        'animate-in slide-in-from-top-2 fade-in-0 duration-300',
                    ),
                    unstyled: false,
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
        shownRef.current.forEach((id) => {
            if (!currentIds.has(id) && prevIds.has(id)) {
                sonnerToast.dismiss(id);
                shownRef.current.delete(id);
            }
        });

        prevToastsRef.current = toasts;
    }, [toasts, onDismiss, onLike, onDislike, onNote, onOpen, labels]);

    return null;
});
