'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from './store';
import { ensureLocalePrefix, getLocaleFromPathname } from '@/shared/lib/locale-utils';

/**
 * Хук для доступа к auth состоянию
 */
export function useAuth() {
    const store = useAuthStore();

    return {
        user: store.user,
        isAuthenticated: store.isAuthenticated(),
        isLoading: store.isLoading,
        isInitialized: store.isInitialized,
        error: store.error,
        login: store.login,
        register: store.register,
        logout: store.logout,
        logoutAll: store.logoutAll,
        clearError: store.clearError,
        initiateGoogleOAuth: store.initiateGoogleOAuth,
    };
}

/**
 * Хук для инициализации auth при загрузке приложения
 */
export function useAuthInit() {
    const { initialize, isInitialized } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) {
            initialize();
        }
    }, [initialize, isInitialized]);
}

/**
 * Хук для защищенных страниц - редирект на login
 */
export function useRequireAuth(redirectTo = '/login') {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isInitialized, isLoading } = useAuth();

    useEffect(() => {
        if (isInitialized && !isLoading && !isAuthenticated) {
            // Сохраняем текущий путь для редиректа после логина
            const locale = getLocaleFromPathname(pathname);
            const loginPath = ensureLocalePrefix(redirectTo, locale);
            const returnUrl = encodeURIComponent(pathname);
            router.push(`${loginPath}?from=${returnUrl}`);
        }
    }, [isAuthenticated, isInitialized, isLoading, redirectTo, router, pathname]);

    return { isAuthenticated, isLoading: !isInitialized || isLoading };
}

/**
 * Хук для гостевых страниц (login/register) - редирект если уже авторизован
 */
export function useGuestOnly(redirectTo = '/search') {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isInitialized, isLoading } = useAuth();

    useEffect(() => {
        if (isInitialized && !isLoading && isAuthenticated) {
            const locale = getLocaleFromPathname(pathname);
            router.push(ensureLocalePrefix(redirectTo, locale));
        }
    }, [isAuthenticated, isInitialized, isLoading, redirectTo, router, pathname]);

    return { isLoading: !isInitialized || isLoading };
}
