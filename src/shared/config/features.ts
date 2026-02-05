/**
 * Feature flags для управления функциональностью приложения
 */

export const FEATURES = {
    // Использовать моки для недвижимости когда включен флаг
    USE_MOCK_PROPERTIES:
        process.env.NEXT_PUBLIC_USE_MOCK_PROPERTIES === 'true' ||
        process.env.NEXT_PUBLIC_USE_MOCKS === 'true',
    
    /**
     * Мок авторизации для тестирования UI
     * Установите NEXT_PUBLIC_MOCK_AUTH_ENABLED=true для имитации авторизованного пользователя
     * Полезно для тестирования интерфейса без реального бекенда
     */
    MOCK_AUTH_ENABLED:
        process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED === 'true',
} as const;

/**
 * Тестовый пользователь для мока авторизации
 * Возвращается когда MOCK_AUTH_ENABLED = true
 */
export const MOCK_USER = {
    id: 'test-user-001',
    email: 'test@example.com',
    role: 'user' as const,
    is_active: true,
    created_at: new Date().toISOString(),
};
