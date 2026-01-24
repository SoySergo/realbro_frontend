import env from '@/shared/config/env';
import type {
    LoginRequest,
    RegisterRequest,
    ChangePasswordRequest,
    ResetPasswordRequest,
    UserInfo,
    SessionsResponse,
    GoogleOAuthURLResponse,
} from '@/entities/user';

const API_BASE = `${env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

/**
 * Кастомная ошибка авторизации
 */
export class AuthError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

/**
 * Обработка ответа API
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Бекенд возвращает формат: { success: false, error: { code, message, details } }
        if (errorData.error) {
            throw new AuthError(
                errorData.error.message || 'Request failed',
                response.status,
                errorData.error.code
            );
        }

        // Fallback для старого формата
        throw new AuthError(
            errorData.message || 'Request failed',
            response.status,
            errorData.code
        );
    }
    return response.json();
}

/**
 * Класс для работы с Auth API
 */
class AuthApiService {
    // Прямые запросы к бекенду
    private baseUrl = `${API_BASE}/auth`;

    /**
     * Регистрация нового пользователя
     */
    async register(data: RegisterRequest): Promise<UserInfo> {
        console.log('[Auth API] Registering user:', data.email);

        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return handleResponse<UserInfo>(response);
    }

    /**
     * Вход в систему
     */
    async login(data: LoginRequest): Promise<UserInfo> {
        console.log('[Auth API] Logging in user:', data.email);

        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return handleResponse<UserInfo>(response);
    }

    /**
     * Обновление токена (токен берется из cookies автоматически)
     */
    async refresh(): Promise<UserInfo> {
        console.log('[Auth API] Refreshing tokens');

        const response = await fetch(`${this.baseUrl}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        return handleResponse<UserInfo>(response);
    }

    /**
     * Инициация Google OAuth flow - получение URL для редиректа
     */
    async getGoogleAuthUrl(returnUrl?: string): Promise<GoogleOAuthURLResponse> {
        console.log('[Auth API] Getting Google OAuth URL');

        const url = returnUrl
            ? `${this.baseUrl}/google/login?return_url=${encodeURIComponent(returnUrl)}`
            : `${this.baseUrl}/google/login`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        return handleResponse<GoogleOAuthURLResponse>(response);
    }

    /**
     * Выход из системы (токен берется из cookies автоматически)
     */
    async logout(): Promise<void> {
        console.log('[Auth API] Logging out');

        await fetch(`${this.baseUrl}/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    }

    /**
     * Выход со всех устройств (токен берется из cookies автоматически)
     */
    async logoutAll(): Promise<void> {
        console.log('[Auth API] Logging out from all devices');

        await fetch(`${this.baseUrl}/logout-all`, {
            method: 'POST',
            credentials: 'include',
        });
    }

    /**
     * Запрос на сброс пароля
     */
    async requestPasswordReset(email: string): Promise<void> {
        console.log('[Auth API] Requesting password reset for:', email);

        const response = await fetch(`${this.baseUrl}/password/reset-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new AuthError(
                error.message || 'Password reset request failed',
                response.status
            );
        }
    }

    /**
     * Сброс пароля с токеном
     */
    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        console.log('[Auth API] Resetting password');

        const response = await fetch(`${this.baseUrl}/password/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new AuthError(
                error.message || 'Password reset failed',
                response.status
            );
        }
    }

    /**
     * Смена пароля (токен берется из cookies автоматически)
     */
    async changePassword(data: ChangePasswordRequest): Promise<void> {
        console.log('[Auth API] Changing password');

        const response = await fetch(`${this.baseUrl}/password/change`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new AuthError(
                error.message || 'Password change failed',
                response.status
            );
        }
    }

    /**
     * Получить информацию о текущем пользователе (токен берется из cookies автоматически)
     */
    async getMeFromCookies(): Promise<UserInfo> {
        console.log('[Auth API] Getting current user info from cookies');

        const response = await fetch(`${this.baseUrl}/me`, {
            credentials: 'include',
        });

        return handleResponse<UserInfo>(response);
    }

    /**
     * Получить количество активных сессий (токен берется из cookies автоматически)
     */
    async getSessions(): Promise<SessionsResponse> {
        console.log('[Auth API] Getting active sessions');

        const response = await fetch(`${this.baseUrl}/sessions`, {
            credentials: 'include',
        });

        return handleResponse<SessionsResponse>(response);
    }
}

export const authApi = new AuthApiService();
