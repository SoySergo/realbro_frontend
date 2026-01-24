import env from '@/shared/config/env';
import type { UserResponse, UpdateUserRequest } from '@/entities/user';

const API_BASE = `${env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

/**
 * Кастомная ошибка API пользователей
 */
export class UsersApiError extends Error {
    constructor(
        message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = 'UsersApiError';
    }
}

/**
 * Обработка ответа API
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new UsersApiError(
            error.message || error.error || 'Request failed',
            response.status
        );
    }
    return response.json();
}

/**
 * Класс для работы с Users API
 */
class UsersApiService {
    private baseUrl = `${API_BASE}/users`;

    /**
     * Получить профиль текущего пользователя (токен берется из cookies автоматически)
     */
    async getMe(): Promise<UserResponse> {
        console.log('[Users API] Getting current user profile');

        const response = await fetch(`${this.baseUrl}/me`, {
            credentials: 'include',
        });

        return handleResponse<UserResponse>(response);
    }

    /**
     * Обновить профиль текущего пользователя (токен берется из cookies автоматически)
     */
    async updateMe(data: UpdateUserRequest): Promise<UserResponse> {
        console.log('[Users API] Updating current user profile');

        const response = await fetch(`${this.baseUrl}/me`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return handleResponse<UserResponse>(response);
    }

    /**
     * Удалить аккаунт текущего пользователя (токен берется из cookies автоматически)
     */
    async deleteMe(): Promise<void> {
        console.log('[Users API] Deleting current user account');

        const response = await fetch(`${this.baseUrl}/me`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new UsersApiError(
                error.message || 'Failed to delete account',
                response.status
            );
        }
    }

    /**
     * Получить публичный профиль пользователя по ID (токен берется из cookies автоматически)
     */
    async getById(userId: string): Promise<UserResponse> {
        console.log('[Users API] Getting user by ID:', userId);

        const response = await fetch(`${this.baseUrl}/${userId}`, {
            credentials: 'include',
        });

        return handleResponse<UserResponse>(response);
    }
}

export const usersApi = new UsersApiService();
