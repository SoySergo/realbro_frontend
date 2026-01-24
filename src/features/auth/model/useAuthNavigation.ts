'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { saveReturnUrl, isAuthRoute } from './navigation';

/**
 * Хук для автоматического сохранения return URL
 * при переходе на auth страницы
 *
 * Использование: вызвать в auth модалках (login, register, forgot-password)
 */
export function useAuthNavigation() {
    const pathname = usePathname();

    useEffect(() => {
        // Получаем referrer из document (страница, с которой пришел пользователь)
        const referrer = document.referrer;

        // Если referrer есть и это не auth-роут - сохраняем его
        if (referrer) {
            try {
                const referrerUrl = new URL(referrer);
                const referrerPath = referrerUrl.pathname;

                // Сохраняем только если это не auth роут
                if (!isAuthRoute(referrerPath)) {
                    saveReturnUrl(referrerPath);
                }
            } catch (error) {
                // Игнорируем ошибки парсинга URL
                console.warn('Failed to parse referrer:', error);
            }
        }
    }, [pathname]);
}
