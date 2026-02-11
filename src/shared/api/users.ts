import env from '@/shared/config/env';
import type { UserResponse, UpdateUserRequest } from '@/entities/user';
import { updateUserRequestSchema } from '@/entities/user';

const API_BASE = `${env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

/**
 * Кастомная ошибка API пользователей
 */
export class UsersApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public errors?: Record<string, string[]>
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
        const errorData = await response.json().catch(() => ({}));
        throw new UsersApiError(
            errorData.message || errorData.error || 'Request failed',
            response.status,
            errorData.errors
        );
    }
    
    // Для DELETE запросов может не быть тела ответа
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
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

        // Валидация данных перед отправкой
        const validatedData = updateUserRequestSchema.parse(data);

        const response = await fetch(`${this.baseUrl}/me`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(validatedData),
        });

        return handleResponse<UserResponse>(response);
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
