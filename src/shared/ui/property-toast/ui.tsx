'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Home, ThumbsUp, ThumbsDown, Pencil, User2 } from 'lucide-react';
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

interface PropertyToastItemProps {
    toast: PropertyToast;
    onDismiss: (id: string) => void;
    onLike?: (propertyId: string) => void;
    onDislike?: (propertyId: string) => void;
    onNote?: (propertyId: string) => void;
    onOpen?: (property: Property) => void;
    labels: PropertyToastLabels;
    index: number;
}

/**
 * Компонент одного тоста с информацией о новом объекте
 * Действия (лайк, дизлайк, заметка) внизу, крестик справа вверху
 * Длительный таймаут (30с), поддержка свайпа для закрытия
 */
function PropertyToastItem({ toast, onDismiss, onLike, onDislike, onNote, onOpen, labels, index }: PropertyToastItemProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [progress, setProgress] = useState(100);
    // Увеличенное время отображения — 30 секунд
    const duration = 30000;
    const intervalRef = useRef<number | undefined>(undefined);
    const dismissedRef = useRef(false);

    // Свайп-поддержка
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });

    const handleDismiss = useCallback(() => {
        if (dismissedRef.current) return;
        dismissedRef.current = true;
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
        }
        setIsLeaving(true);
        setTimeout(() => onDismiss(toast.id), 300);
    }, [toast.id, onDismiss]);

    // Анимация появления
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Прогресс-бар и автоматическое скрытие
    useEffect(() => {
        const startTime = Date.now();
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining <= 0) {
                handleDismiss();
            }
        };
        intervalRef.current = window.setInterval(updateProgress, 100);
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [duration, handleDismiss]);

    // Обработка свайпа — вверх или в сторону для закрытия
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
        // Разрешаем только свайп вверх (отрицательный Y) или в стороны
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

    const handleLike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onLike?.(toast.property.id);
    }, [toast.property.id, onLike]);

    const handleDislike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDislike?.(toast.property.id);
    }, [toast.property.id, onDislike]);

    const handleNote = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onNote?.(toast.property.id);
    }, [toast.property.id, onNote]);

    const handleClick = useCallback(() => {
        onOpen?.(toast.property);
        handleDismiss();
    }, [toast.property, onOpen, handleDismiss]);

    const { property, filterName } = toast;
    const mainImage = property.images?.[0];

    // Эффект стекинга — каждый следующий тост немного смещён и уменьшен
    const stackStyle = {
        transform: `translateX(${swipeOffset.x}px) translateY(${swipeOffset.y + index * 4}px) scale(${1 - index * 0.03})`,
        zIndex: 100 - index,
        opacity: index > 2 ? 0 : 1 - index * 0.1,
    };

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={stackStyle}
            className={cn(
                'relative overflow-hidden bg-card border border-border rounded-xl shadow-lg cursor-pointer',
                'w-full max-w-[360px] md:max-w-[420px]',
                'transition-all duration-300 ease-out',
                swipeOffset.x === 0 && swipeOffset.y === 0 && 'transition-transform',
                isVisible && !isLeaving
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 -translate-y-4 scale-95'
            )}
        >
            {/* Прогресс-бар */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
                <div
                    className="h-full bg-brand-primary transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="p-3 pt-4">
                {/* Заголовок с иконкой агента и кнопкой закрытия справа вверху */}
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
                        className="ml-auto shrink-0 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Превью объекта — без кнопок сбоку */}
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
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-success hover:bg-success/10 transition-all active:scale-95"
                        title={labels.like}
                    >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{labels.like}</span>
                    </button>
                    <button
                        onClick={handleDislike}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-error hover:bg-error/10 transition-all active:scale-95"
                        title={labels.dislike}
                    >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{labels.dislike}</span>
                    </button>
                    <button
                        onClick={handleNote}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/10 transition-all active:scale-95"
                        title={labels.note}
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>{labels.note}</span>
                    </button>
                </div>
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
 * Контейнер для отображения тостов — по центру сверху
 * Тосты стекируются один на другой с эффектом наложения
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
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center w-full max-w-[360px] md:max-w-[420px] px-4 pointer-events-none">
            {toasts.slice(0, 5).map((toast, idx) => (
                <div
                    key={toast.id}
                    className={cn(
                        'pointer-events-auto w-full',
                        idx > 0 && '-mt-2'
                    )}
                >
                    <PropertyToastItem
                        toast={toast}
                        onDismiss={onDismiss}
                        onLike={onLike}
                        onDislike={onDislike}
                        onNote={onNote}
                        onOpen={onOpen}
                        labels={labels}
                        index={idx}
                    />
                </div>
            ))}
        </div>
    );
}
