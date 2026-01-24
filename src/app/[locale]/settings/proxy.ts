import { type NextRequest, NextResponse } from 'next/server';

/**
 * Proxy для защиты роута /settings
 * Проверяет наличие токена авторизации
 */
export async function GET(request: NextRequest) {
    // Проверяем наличие auth-storage в cookie
    const authStorage = request.cookies.get('auth-storage');

    if (!authStorage) {
        // Редирект на login с сохранением пути возврата
        const locale = request.nextUrl.pathname.split('/')[1];
        const returnUrl = encodeURIComponent(request.nextUrl.pathname);
        return NextResponse.redirect(
            new URL(`/${locale}/login?from=${returnUrl}`, request.url)
        );
    }

    try {
        // Парсим auth-storage и проверяем наличие accessToken
        const storage = JSON.parse(authStorage.value);
        const state = storage?.state;

        if (!state?.accessToken || !state?.user) {
            throw new Error('No auth data');
        }

        // Пропускаем запрос дальше
        return NextResponse.next();
    } catch {
        // Если не удалось распарсить или нет токена - редирект
        const locale = request.nextUrl.pathname.split('/')[1];
        const returnUrl = encodeURIComponent(request.nextUrl.pathname);
        return NextResponse.redirect(
            new URL(`/${locale}/login?from=${returnUrl}`, request.url)
        );
    }
}
