'use client';

import { ToastProvider } from '@/shared/ui/toast';

/**
 * Провайдер для простых тостов (успех, ошибка, предупреждение, инфо)
 */
export function SimpleToastProvider({ children }: { children: React.ReactNode }) {
    return <ToastProvider>{children}</ToastProvider>;
}
