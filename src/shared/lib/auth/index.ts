// Утилиты для работы с авторизацией

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

/**
 * Проверяет наличие токенов (заглушка)
 * TODO: В будущем добавить запрос к API для валидации
 */
export function checkAuthTokens(tokens: AuthTokens): boolean {
    const hasTokens = !!(tokens.refreshToken || tokens.accessToken);

    if (hasTokens) {
        console.log('🔐 [Auth] Tokens found:', {
            hasRefresh: !!tokens.refreshToken,
            hasAccess: !!tokens.accessToken,
        });
    }

    return hasTokens;
}

/**
 * Валидация токенов на сервере (заглушка)
 * TODO: Реализовать реальную проверку через API
 */
export async function validateAuthTokens(
    tokens: AuthTokens
): Promise<{ valid: boolean; userId?: string }> {
    // Заглушка: считаем что токены валидны если они есть
    if (!tokens.refreshToken && !tokens.accessToken) {
        return { valid: false };
    }

    // TODO: Здесь будет реальный запрос к API
    // const response = await fetch('/api/auth/validate', {
    //   method: 'POST',
    //   body: JSON.stringify(tokens),
    // });
    // return response.json();

    console.log('✅ [Auth] Tokens validation (stub) - считаем валидными');

    return {
        valid: true,
        userId: 'stub-user-id', // Заглушка
    };
}

/**
 * Логирование попыток доступа с невалидными токенами
 */
export function logAuthError(path: string, reason: string): void {
    console.error('❌ [Auth Error]', {
        path,
        reason,
        timestamp: new Date().toISOString(),
    });

    // TODO: В будущем отправлять в систему мониторинга (Sentry, etc.)
}
