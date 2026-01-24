/**
 * Ответ API при аутентификации
 */
export type AuthResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: UserInfo;
};

/**
 * Базовая информация о пользователе (из /auth/me)
 */
export type UserInfo = {
    id: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
};

/**
 * Полная информация о пользователе (из /users/me)
 */
export type UserResponse = {
    id: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    settings: UserSettings;
    created_at: string;
    updated_at: string;
};

/**
 * Настройки пользователя
 */
export type UserSettings = {
    language?: string;
    notifications_email?: boolean;
    notifications_push?: boolean;
    theme?: 'light' | 'dark' | 'system';
    display_name?: string;
};

/**
 * Роли пользователей
 */
export type UserRole = 'user' | 'admin' | 'moderator';

/**
 * Запрос на обновление пользователя
 */
export type UpdateUserRequest = {
    email?: string;
    settings?: Partial<UserSettings>;
};

/**
 * Запрос на регистрацию
 */
export type RegisterRequest = {
    email: string;
    password: string;
};

/**
 * Запрос на логин
 */
export type LoginRequest = {
    email: string;
    password: string;
};

/**
 * Запрос на смену пароля
 */
export type ChangePasswordRequest = {
    old_password: string;
    new_password: string;
};

/**
 * Запрос на сброс пароля (отправка email)
 */
export type PasswordResetRequest = {
    email: string;
};

/**
 * Запрос на установку нового пароля
 */
export type ResetPasswordRequest = {
    token: string;
    new_password: string;
};

/**
 * Ответ с количеством активных сессий
 */
export type SessionsResponse = {
    active_sessions: number;
};

/**
 * Общий ответ с сообщением
 */
export type MessageResponse = {
    message: string;
};

/**
 * Ответ с URL для Google OAuth
 */
export type GoogleOAuthURLResponse = {
    url: string;
};
