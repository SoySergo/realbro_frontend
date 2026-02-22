'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserInfo } from '@/entities/user';
import { authApi, AuthError } from '@/shared/api/auth';
import { setAccessToken } from '@/shared/api/lib/api-client';
import { FEATURES, MOCK_USER } from '@/shared/config/features';
import { saveReturnUrl } from './navigation';

type AuthState = {
    // Состояние
    user: UserInfo | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Действия
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
    setUser: (user: UserInfo | null) => void;
    clearAuth: () => void;
    clearError: () => void;
    initialize: () => Promise<void>;

    // OAuth
    initiateGoogleOAuth: () => Promise<void>;
    initializeFromCookies: () => Promise<void>;

    // Геттеры
    isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Начальное состояние
            user: null,
            isLoading: false,
            isInitialized: false,
            error: null,

            // Установка user
            setUser: (user) => {
                set({ user, error: null });
            },

            // Очистка авторизации
            clearAuth: () => {
                setAccessToken(null);
                set({
                    user: null,
                    error: null,
                });
            },

            // Очистка ошибки
            clearError: () => set({ error: null }),

            // Проверка авторизации
            isAuthenticated: () => {
                const { user } = get();
                return !!user;
            },

            // Инициализация — бекенд как источник правды
            // Всегда пробуем refresh → /me, если есть cookies (httpOnly refresh_token)
            initialize: async () => {
                set({ isLoading: true });

                // Если включен мок авторизации - возвращаем тестового пользователя
                if (FEATURES.MOCK_AUTH_ENABLED) {
                    console.log('Mock auth enabled, using test user');
                    set({ user: MOCK_USER, isInitialized: true, isLoading: false });
                    return;
                }

                try {
                    // Попытка refresh — refresh_token в httpOnly cookie
                    // Бекенд возвращает UserInfo напрямую, токены устанавливаются через httpOnly cookies
                    const user = await authApi.refresh();
                    set({ user, isInitialized: true });
                } catch {
                    // Refresh не удался — пробуем получить user через /me
                    // (access_token мог быть ещё валидным в cookie)
                    try {
                        const user = await authApi.getMeFromCookies();
                        set({ user, isInitialized: true });
                    } catch {
                        // Нет валидной сессии — гость
                        set({ user: null, isInitialized: true });
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            // Логин — бекенд возвращает UserInfo, токены в httpOnly cookies
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const user = await authApi.login({ email, password });
                    set({ user });
                } catch (error) {
                    const message =
                        error instanceof AuthError
                            ? error.message
                            : 'Login failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            // Регистрация — бекенд возвращает UserInfo, токены в httpOnly cookies
            register: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const user = await authApi.register({ email, password });
                    set({ user });
                } catch (error) {
                    const message =
                        error instanceof AuthError
                            ? error.message
                            : 'Registration failed';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            // Выход — очистить access_token, вызвать POST /auth/logout
            logout: async () => {
                const { clearAuth } = get();
                set({ isLoading: true });
                try {
                    await authApi.logout();
                } finally {
                    clearAuth();
                    set({ isLoading: false });
                }
            },

            // Выход со всех устройств
            logoutAll: async () => {
                const { clearAuth } = get();
                set({ isLoading: true });
                try {
                    await authApi.logoutAll();
                } finally {
                    clearAuth();
                    set({ isLoading: false });
                }
            },

            // OAuth Google — GET /auth/google/login?return_url=... → редирект
            initiateGoogleOAuth: async () => {
                set({ isLoading: true, error: null });
                try {
                    // Бекенд ожидает относительный путь, не полный URL
                    const returnUrl = typeof window !== 'undefined'
                        ? window.location.pathname + window.location.search
                        : undefined;
                    // Сохраняем pathname в sessionStorage как fallback (бэкенд может не вернуть return_url)
                    if (typeof window !== 'undefined') {
                        saveReturnUrl(window.location.pathname);
                    }
                    const { url } = await authApi.getGoogleAuthUrl(returnUrl);
                    // Редирект на страницу авторизации Google
                    window.location.href = url;
                } catch (error) {
                    const message =
                        error instanceof AuthError
                            ? error.message
                            : 'Failed to initiate Google login';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            // Инициализация из cookies (после OAuth redirect)
            initializeFromCookies: async () => {
                set({ isLoading: true, error: null });
                try {
                    // После OAuth callback — пробуем refresh
                    // Бекенд возвращает UserInfo напрямую, токены в httpOnly cookies
                    const user = await authApi.refresh();
                    set({ user, isInitialized: true });
                } catch {
                    // Fallback — получаем user из cookies
                    try {
                        const user = await authApi.getMeFromCookies();
                        set({ user, isInitialized: true });
                    } catch (error) {
                        const message =
                            error instanceof AuthError
                                ? error.message
                                : 'Failed to initialize session';
                        set({ error: message });
                        throw error;
                    }
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            // Persist только user в localStorage (access_token хранится in-memory)
            partialize: (state) => ({
                user: state.user,
            }),
        }
    )
);
