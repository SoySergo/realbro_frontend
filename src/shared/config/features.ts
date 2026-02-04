/**
 * Feature flags для управления функциональностью приложения
 */

export const FEATURES = {
    // Использовать моки для недвижимости в development или когда включен флаг
    USE_MOCK_PROPERTIES: 
        process.env.NEXT_PUBLIC_USE_MOCK_PROPERTIES === 'true' || 
        process.env.NODE_ENV === 'development',
    
    // Другие feature flags могут быть добавлены здесь
    // Например:
    // ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
    // ENABLE_FAVORITES: process.env.NEXT_PUBLIC_ENABLE_FAVORITES === 'true',
} as const;
