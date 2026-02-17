import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    ChangePasswordRequest,
    ResetPasswordRequest,
    UserInfo,
    SessionsResponse,
    GoogleOAuthURLResponse,
} from '@/entities/user';
import { apiClient, ApiError } from '@/shared/api/lib/api-client';

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
 * Класс для работы с Auth API
 * Централизовано на Bearer token:
 * - access_token хранится in-memory (Zustand, не persist)
 * - refresh_token — httpOnly cookie (бекенд устанавливает)
 * - API-client подставляет Authorization: Bearer {access_token}
 * - При 401 → api-client вызывает /auth/refresh → повтор запроса
 */
class AuthApiService {
    /**
     * Регистрация нового пользователя
     * Возвращает AuthResponse с access_token + user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        console.log('[Auth API] Registering user:', data.email);
        try {
            return await apiClient.post<AuthResponse>('/auth/register', data, { skipAuth: true });
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }

    /**
     * Вход в систему
     * Возвращает AuthResponse с access_token + user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        console.log('[Auth API] Logging in user:', data.email);
        try {
            return await apiClient.post<AuthResponse>('/auth/login', data, { skipAuth: true });
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }

    /**
     * Обновление токена (refresh_token из httpOnly cookie)
     * Возвращает AuthResponse с новым access_token + user
     */
    async refresh(): Promise<AuthResponse> {
        console.log('[Auth API] Refreshing tokens');
        try {
            return await apiClient.post<AuthResponse>('/auth/refresh', undefined, { skipAuth: true });
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }

    /**
     * Инициация Google OAuth flow — GET /auth/google/login?return_url=...
     */
    async getGoogleAuthUrl(returnUrl?: string): Promise<GoogleOAuthURLResponse> {
        console.log('[Auth API] Getting Google OAuth URL');
        try {
            return await apiClient.get<GoogleOAuthURLResponse>('/auth/google/login', {
                params: returnUrl ? { return_url: returnUrl } : undefined,
                skipAuth: true,
            });
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }

    /**
     * Выход из системы
     */
    async logout(): Promise<void> {
        console.log('[Auth API] Logging out');
        try {
            await apiClient.post<void>('/auth/logout');
        } catch {
            // Игнорируем ошибки при logout
        }
    }

    /**
     * Выход со всех устройств
     */
    async logoutAll(): Promise<void> {
        console.log('[Auth API] Logging out from all devices');
        try {
            await apiClient.post<void>('/auth/logout-all');
        } catch {
            // Игнорируем ошибки при logout
        }
    }

    /**
     * Запрос на сброс пароля
     */
    async requestPasswordReset(email: string): Promise<void> {
        console.log('[Auth API] Requesting password reset for:', email);
        try {
            await apiClient.post<void>('/auth/password/reset-request', { email }, { skipAuth: true });
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }

    /**
     * Сброс пароля с токеном
     */
    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        console.log('[Auth API] Resetting password');
        try {
            await apiClient.post<void>('/auth/password/reset', data, { skipAuth: true });
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }

    /**
     * Смена пароля
     */
    async changePassword(data: ChangePasswordRequest): Promise<void> {
        console.log('[Auth API] Changing password');
        try {
            await apiClient.post<void>('/auth/password/change', data);
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }

    /**
     * Получить информацию о текущем пользователе (GET /auth/me)
     */
    async getMeFromCookies(): Promise<UserInfo> {
        console.log('[Auth API] Getting current user info');
        try {
            return await apiClient.get<UserInfo>('/auth/me');
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }

    /**
     * Получить количество активных сессий
     */
    async getSessions(): Promise<SessionsResponse> {
        console.log('[Auth API] Getting active sessions');
        try {
            return await apiClient.get<SessionsResponse>('/auth/sessions');
        } catch (error) {
            if (error instanceof ApiError) {
                throw new AuthError(error.message, error.statusCode, error.errorCode);
            }
            throw error;
        }
    }
}

export const authApi = new AuthApiService();
