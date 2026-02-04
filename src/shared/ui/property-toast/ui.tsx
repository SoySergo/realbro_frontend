'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Home, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Link } from '@/shared/config/routing';
import type { Property } from '@/entities/property';

export interface PropertyToast {
    id: string;
    property: Property;
    filterName?: string;
    timestamp: number;
}

interface PropertyToastItemProps {
    toast: PropertyToast;
    onDismiss: (id: string) => void;
    labels: {
        newProperty: string;
        view: string;
    };
}

/**
 * Компонент одного тоста с информацией о новом объекте
 */
function PropertyToastItem({ toast, onDismiss, labels }: PropertyToastItemProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    // Анимация появления
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Автоматическое скрытие через 5 секунд
    useEffect(() => {
        const timer = setTimeout(() => {
            handleDismiss();
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast.id]);

    const handleDismiss = useCallback(() => {
        setIsLeaving(true);
        setTimeout(() => onDismiss(toast.id), 300);
    }, [toast.id, onDismiss]);

    const { property, filterName } = toast;
    const mainImage = property.images?.[0];

    return (
        <div
            className={cn(
                'relative flex gap-3 p-3 bg-card border border-border rounded-xl shadow-lg',
                'max-w-[340px] w-full',
                'transition-all duration-300 ease-out',
                isVisible && !isLeaving 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-full'
            )}
        >
            {/* Изображение */}
            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-background-secondary">
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

            {/* Контент */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-xs text-text-tertiary">{labels.newProperty}</p>
                        <p className="text-sm font-semibold text-text-primary truncate">
                            {property.price.toLocaleString()} €
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 p-1 rounded-full hover:bg-background-secondary transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4 text-text-tertiary" />
                    </button>
                </div>

                <p className="text-xs text-text-secondary truncate mt-0.5">
                    {property.rooms > 0 && `${property.rooms} комн. • `}
                    {property.area} m²
                    {filterName && ` • ${filterName}`}
                </p>

                <Link
                    href={`/chat`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:text-brand-primary-hover mt-1.5 transition-colors"
                >
                    {labels.view}
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}

interface PropertyToastContainerProps {
    toasts: PropertyToast[];
    onDismiss: (id: string) => void;
    labels: {
        newProperty: string;
        view: string;
    };
}

/**
 * Контейнер для отображения тостов
 */
export function PropertyToastContainer({
    toasts,
    onDismiss,
    labels,
}: PropertyToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.slice(0, 3).map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <PropertyToastItem
                        toast={toast}
                        onDismiss={onDismiss}
                        labels={labels}
                    />
                </div>
            ))}
        </div>
    );
}
