'use client';

import { removeLocalePrefix } from '@/shared/lib/locale-utils';

/**
 * Утилиты для навигации после авторизации
 *
 * Решает проблему: пользователь переходит по модалкам авторизации
 * (login -> register -> forgot-password), и при успешном входе
 * нужно вернуть его на страницу ДО начала auth flow, а не просто router.back()
 */

const RETURN_URL_KEY = 'auth_return_url';

/**
 * Сохранить URL для возврата после авторизации
 */
export function saveReturnUrl(url: string): void {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(RETURN_URL_KEY, url);
    }
}

/**
 * Получить сохраненный URL для возврата
 */
export function getReturnUrl(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return sessionStorage.getItem(RETURN_URL_KEY);
}

/**
 * Очистить сохраненный URL
 */
export function clearReturnUrl(): void {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(RETURN_URL_KEY);
    }
}

/**
 * Получить URL для редиректа после успешной авторизации
 * @param searchParams - query параметры (для from параметра)
 * @param defaultUrl - URL по умолчанию если нет сохраненного
 */
export function getRedirectAfterAuth(
    searchParams: URLSearchParams | null,
    defaultUrl: string = '/search'
): string {
    // 1. Проверяем query параметр 'from' (приоритет)
    if (searchParams) {
        const from = searchParams.get('from');
        if (from) {
            return decodeURIComponent(from);
        }
    }

    // 2. Проверяем sessionStorage
    const savedUrl = getReturnUrl();
    if (savedUrl) {
        clearReturnUrl();
        return savedUrl;
    }

    // 3. Возвращаем default
    return defaultUrl;
}

/**
 * Проверяет, является ли путь auth-роутом
 */
export function isAuthRoute(pathname: string): boolean {
    const authRoutes = ['/login', '/register', '/forgot-password'];
    // Убираем locale из пути для проверки
    const pathWithoutLocale = removeLocalePrefix(pathname);
    return authRoutes.some((route) => pathWithoutLocale.startsWith(route));
}
