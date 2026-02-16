/**
 * Feature flags для управления функциональностью приложения
 * 
 * Помодульные флаги — каждый модуль переключается на реальный API независимо.
 * При false → работают моки, при true → реальный бекенд.
 */

export const FEATURES = {
    // === Legacy флаги (обратная совместимость) ===

    // Использовать моки для недвижимости когда включен флаг
    USE_MOCK_PROPERTIES:
        process.env.NEXT_PUBLIC_USE_MOCK_PROPERTIES === 'true' ||
        process.env.NEXT_PUBLIC_USE_MOCKS === 'true',
    
    /**
     * Мок авторизации для тестирования UI
     * Установите NEXT_PUBLIC_MOCK_AUTH_ENABLED=true для имитации авторизованного пользователя
     */
    MOCK_AUTH_ENABLED:
        process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED === 'true',

    // === Помодульные флаги для переключения на реальный API ===

    /** Properties listing, detail, count */
    USE_REAL_PROPERTIES:
        process.env.NEXT_PUBLIC_USE_REAL_PROPERTIES === 'true',

    /** Auth + user profile */
    USE_REAL_AUTH:
        process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'true',

    /** Search tabs CRUD */
    USE_REAL_TABS:
        process.env.NEXT_PUBLIC_USE_REAL_TABS === 'true',

    /** Markers (like, dislike, saved, hidden...) */
    USE_REAL_MARKERS:
        process.env.NEXT_PUBLIC_USE_REAL_MARKERS === 'true',

    /** Autosearch + WS notifications */
    USE_REAL_AUTOSEARCH:
        process.env.NEXT_PUBLIC_USE_REAL_AUTOSEARCH === 'true',

    /** Saved filters + geometries */
    USE_REAL_FILTERS:
        process.env.NEXT_PUBLIC_USE_REAL_FILTERS === 'true',

    /** Notes, professionals */
    USE_REAL_FAVORITES:
        process.env.NEXT_PUBLIC_USE_REAL_FAVORITES === 'true',

    /** Subscriptions, payment methods */
    USE_REAL_PAYMENTS:
        process.env.NEXT_PUBLIC_USE_REAL_PAYMENTS === 'true',
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
