'use client';

import { useEffect } from 'react';

/**
 * Компонент для отображения ошибок авторизации
 * TODO: В будущем интегрировать с реальной системой авторизации
 */
export function AuthErrorHandler() {
    useEffect(() => {
        // Слушаем события ошибок авторизации
        const handleAuthError = (event: Event) => {
            const customEvent = event as CustomEvent<{ message: string; code?: string }>;
            const { message, code } = customEvent.detail;

            console.error('❌ [Auth Error Handler]', { message, code });

            // TODO: Показать красивый alert или toast
            // Временно используем стандартный alert
            alert(`Ошибка авторизации: ${message}`);
        };

        window.addEventListener('auth-error', handleAuthError);

        return () => {
            window.removeEventListener('auth-error', handleAuthError);
        };
    }, []);

    return null; // Этот компонент не рендерит UI
}

/**
 * Утилита для триггера ошибки авторизации на клиенте
 */
export function triggerAuthError(message: string, code?: string) {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('auth-error', {
            detail: { message, code },
        });
        window.dispatchEvent(event);
    }
}
