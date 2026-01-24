'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserInfo } from '@/entities/user';
import { authApi, AuthError } from '@/shared/api/auth';

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

            // Инициализация - проверка сессии через бекенд
            initialize: async () => {
                set({ isLoading: true });

                try {
                    // Всегда проверяем сессию через бекенд (токен в cookies)
                    const user = await authApi.getMeFromCookies();
                    set({ user, isInitialized: true });
                } catch {
                    // Нет валидной сессии - это нормально
                    set({ user: null, isInitialized: true });
                } finally {
                    set({ isLoading: false });
                }
            },

            // Логин
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

            // Регистрация
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

            // Выход
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

            // OAuth Google - инициация flow
            initiateGoogleOAuth: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { url } = await authApi.getGoogleAuthUrl();
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
                    const user = await authApi.getMeFromCookies();
                    set({ user, isInitialized: true });
                } catch (error) {
                    const message =
                        error instanceof AuthError
                            ? error.message
                            : 'Failed to initialize session';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
            }),
        }
    )
);
