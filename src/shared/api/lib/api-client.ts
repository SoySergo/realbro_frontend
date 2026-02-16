/**
 * Единый HTTP-клиент для работы с Backend API
 * 
 * - Base URL из NEXT_PUBLIC_API_BASE_URL
 * - Подстановка Authorization: Bearer {access_token}
 * - Авто-retry при 401 → вызов /auth/refresh → повтор запроса
 * - Обработка ошибок по ErrorResponse ({ error, message })
 * - Данные проходят as-is в snake_case (без конвертаций)
 */

import type { ErrorResponse } from '../types';

const API_BASE_URL = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
    : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080');

const API_PREFIX = '/api/v1';

/**
 * Кастомная ошибка API
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public errorCode?: string,
        public response?: ErrorResponse
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Стор для access_token (in-memory, не persist для безопасности)
let accessToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Установить access_token (вызывается из auth store при логине/refresh)
 */
export function setAccessToken(token: string | null): void {
    accessToken = token;
}

/**
 * Получить текущий access_token
 */
export function getAccessToken(): string | null {
    return accessToken;
}

/**
 * Обновить access_token через /auth/refresh
 * Использует refresh_token из httpOnly cookie
 */
async function refreshAccessToken(): Promise<string | null> {
    // Предотвращаем параллельные refresh запросы
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) {
                // Refresh не удался — сбрасываем токен
                accessToken = null;
                return null;
            }

            const data = await response.json();
            accessToken = data.access_token || null;
            return accessToken;
        } catch {
            accessToken = null;
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Выполнить HTTP-запрос к API
 */
async function request<T>(
    method: string,
    path: string,
    options?: {
        body?: unknown;
        params?: Record<string, string | number | boolean | undefined>;
        signal?: AbortSignal;
        headers?: Record<string, string>;
        skipAuth?: boolean;
    }
): Promise<T> {
    const { body, params, signal, headers: customHeaders, skipAuth } = options || {};

    // Формируем URL с query-параметрами
    let url = `${API_BASE_URL}${API_PREFIX}${path}`;
    if (params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, String(value));
            }
        }
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    // Заголовки
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };

    // Подстановка Authorization если есть токен
    if (!skipAuth && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Выполняем запрос
    const fetchOptions: RequestInit = {
        method,
        headers,
        credentials: 'include',
        signal,
    };

    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(body);
    }

    let response = await fetch(url, fetchOptions);

    // Авто-retry при 401 (не авторизован) — пробуем refresh
    if (response.status === 401 && !skipAuth) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, { ...fetchOptions, headers });
        } else {
            // Refresh не удался — пробрасываем 401
            const errorData = await response.json().catch(() => ({
                error: 'unauthorized',
                message: 'Session expired',
            }));
            throw new ApiError(
                errorData.message || 'Unauthorized',
                401,
                errorData.error,
                errorData as ErrorResponse
            );
        }
    }

    // Обработка ошибок
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            error: 'unknown_error',
            message: `HTTP error ${response.status}`,
        }));
        throw new ApiError(
            errorData.message || `HTTP error ${response.status}`,
            response.status,
            errorData.error,
            errorData as ErrorResponse
        );
    }

    // 204 No Content — возвращаем пустой объект
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

/**
 * API-клиент с типизированными методами
 */
export const apiClient = {
    get<T>(path: string, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        signal?: AbortSignal;
        headers?: Record<string, string>;
        skipAuth?: boolean;
    }): Promise<T> {
        return request<T>('GET', path, options);
    },

    post<T>(path: string, body?: unknown, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        signal?: AbortSignal;
        headers?: Record<string, string>;
        skipAuth?: boolean;
    }): Promise<T> {
        return request<T>('POST', path, { ...options, body });
    },

    put<T>(path: string, body?: unknown, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        signal?: AbortSignal;
        headers?: Record<string, string>;
        skipAuth?: boolean;
    }): Promise<T> {
        return request<T>('PUT', path, { ...options, body });
    },

    patch<T>(path: string, body?: unknown, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        signal?: AbortSignal;
        headers?: Record<string, string>;
        skipAuth?: boolean;
    }): Promise<T> {
        return request<T>('PATCH', path, { ...options, body });
    },

    delete<T>(path: string, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        signal?: AbortSignal;
        headers?: Record<string, string>;
        skipAuth?: boolean;
    }): Promise<T> {
        return request<T>('DELETE', path, options);
    },
};
