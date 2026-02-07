'use client';

import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import Image from 'next/image';
import { X, ThumbsUp, ThumbsDown, MapPin, User2 } from 'lucide-react';
import { cn, safeImageSrc } from '@/shared/lib/utils';
import type { Property } from '@/entities/property';

// ============================================================================
// Types
// ============================================================================

interface PropertyToast {
    id: string;
    property: Property;
    message: string;
    duration?: number;
}

interface PropertyToastContextValue {
    showPropertyToast: (property: Property, message: string, duration?: number) => void;
    dismissPropertyToast: (id: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const PropertyToastContext = createContext<PropertyToastContextValue | null>(null);

export function usePropertyToast() {
    const context = useContext(PropertyToastContext);
    if (!context) {
        throw new Error('usePropertyToast must be used within a PropertyToastProvider');
    }
    return context;
}

// ============================================================================
// Toast Item
// ============================================================================

interface PropertyToastItemProps {
    toast: PropertyToast;
    onDismiss: (id: string) => void;
    onLike?: (propertyId: string) => void;
    onDislike?: (propertyId: string) => void;
    onOpen?: (property: Property) => void;
}

function PropertyToastItem({ toast, onDismiss, onLike, onDislike, onOpen }: PropertyToastItemProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [progress, setProgress] = useState(100);
    const duration = toast.duration ?? 8000;
    const intervalRef = useRef<number | undefined>(undefined);
    const dismissedRef = useRef(false);

    const handleDismiss = useCallback(() => {
        if (dismissedRef.current) return;
        dismissedRef.current = true;
        
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
        }
        setIsLeaving(true);
        setTimeout(() => onDismiss(toast.id), 200);
    }, [toast.id, onDismiss]);

    // Появление
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // Прогресс-бар
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

        intervalRef.current = window.setInterval(updateProgress, 50);
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [duration, handleDismiss]);

    const handleLike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onLike?.(toast.property.id);
        handleDismiss();
    }, [toast.property.id, onLike, handleDismiss]);

    const handleDislike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDislike?.(toast.property.id);
        handleDismiss();
    }, [toast.property.id, onDislike, handleDismiss]);

    const handleClick = useCallback(() => {
        onOpen?.(toast.property);
        handleDismiss();
    }, [toast.property, onOpen, handleDismiss]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    const property = toast.property;

    return (
        <div
            onClick={handleClick}
            className={cn(
                'relative overflow-hidden rounded-xl border bg-white dark:bg-gray-900 shadow-lg cursor-pointer',
                'transition-all duration-200 ease-out',
                isVisible && !isLeaving
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-4 scale-95'
            )}
        >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
                <div 
                    className="h-full bg-brand-primary transition-all duration-50 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="p-3 pt-4">
                {/* Agent message header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <User2 className="w-4 h-4 text-brand-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">{toast.message}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss();
                        }}
                        className="ml-auto p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Property preview */}
                <div className="flex gap-3">
                    {/* Image */}
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                        {property.images[0] ? (
                            <Image
                                src={safeImageSrc(property.images[0])}
                                alt={property.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                            {formatPrice(property.price)} €
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {property.rooms} комн · {property.area} м²
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {property.address}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-1 shrink-0">
                        <button
                            onClick={handleLike}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-success hover:bg-success/10 transition-colors"
                            title="Нравится"
                        >
                            <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDislike}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                            title="Не нравится"
                        >
                            <ThumbsDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Container
// ============================================================================

interface PropertyToastContainerProps {
    toasts: PropertyToast[];
    onDismiss: (id: string) => void;
    onLike?: (propertyId: string) => void;
    onDislike?: (propertyId: string) => void;
    onOpen?: (property: Property) => void;
}

function PropertyToastContainer({ 
    toasts, 
    onDismiss, 
    onLike, 
    onDislike, 
    onOpen 
}: PropertyToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <PropertyToastItem 
                        toast={toast} 
                        onDismiss={onDismiss}
                        onLike={onLike}
                        onDislike={onDislike}
                        onOpen={onOpen}
                    />
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// Provider
// ============================================================================

interface PropertyToastProviderProps {
    children: React.ReactNode;
    onLike?: (propertyId: string) => void;
    onDislike?: (propertyId: string) => void;
    onOpen?: (property: Property) => void;
}

export function PropertyToastProvider({ 
    children, 
    onLike,
    onDislike,
    onOpen
}: PropertyToastProviderProps) {
    const [toasts, setToasts] = useState<PropertyToast[]>([]);

    const showPropertyToast = useCallback((property: Property, message: string, duration?: number) => {
        const id = `property-toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newToast: PropertyToast = { id, property, message, duration };
        
        // Максимум 3 тоста
        setToasts((prev) => [...prev.slice(-2), newToast]);
    }, []);

    const dismissPropertyToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <PropertyToastContext.Provider value={{ showPropertyToast, dismissPropertyToast }}>
            {children}
            <PropertyToastContainer 
                toasts={toasts} 
                onDismiss={dismissPropertyToast}
                onLike={onLike}
                onDislike={onDislike}
                onOpen={onOpen}
            />
        </PropertyToastContext.Provider>
    );
}
