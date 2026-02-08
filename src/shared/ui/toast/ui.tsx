'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// ============================================================================
// Типы
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    dismissToast: (id: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// ============================================================================
// Иконки и стили
// ============================================================================

const toastIcons = {
    success: <Check className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
};

const toastStyles = {
    success: 'bg-card border-border text-card-foreground',
    error: 'bg-card border-border text-card-foreground',
    warning: 'bg-card border-border text-card-foreground',
    info: 'bg-card border-border text-card-foreground',
};

const toastIconStyles = {
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
};

// ============================================================================
// Toast Item компонент
// ============================================================================

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    // Анимация появления
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // Автоматическое скрытие
    useEffect(() => {
        const duration = toast.duration ?? 3000;
        const timer = setTimeout(() => {
            handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration]);

    const handleDismiss = useCallback(() => {
        setIsLeaving(true);
        setTimeout(() => onDismiss(toast.id), 200);
    }, [toast.id, onDismiss]);

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
                'transition-all duration-200 ease-out',
                isVisible && !isLeaving
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-2 scale-95',
                toastStyles[toast.type]
            )}
        >
            <div className={cn('shrink-0', toastIconStyles[toast.type])}>
                {toastIcons[toast.type]}
            </div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={handleDismiss}
                className="shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// ============================================================================
// Toast Container
// ============================================================================

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// Provider
// ============================================================================

interface ToastProviderProps {
    children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newToast: Toast = { id, message, type, duration };
        
        // Оставляем последние 4 тоста + добавляем новый = максимум 5
        setToasts((prev) => [...prev.slice(-4), newToast]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}
