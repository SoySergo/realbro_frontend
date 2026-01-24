import { type NextRequest, NextResponse } from 'next/server';

/**
 * Proxy для гостевого роута /register
 * Редиректит авторизованных пользователей на search
 */
export async function GET(request: NextRequest) {
    // Проверяем наличие auth-storage в cookie
    const authStorage = request.cookies.get('auth-storage');

    if (authStorage) {
        try {
            // Парсим auth-storage и проверяем наличие accessToken
            const storage = JSON.parse(authStorage.value);
            const state = storage?.state;

            if (state?.accessToken && state?.user) {
                // Пользователь авторизован - редирект на search
                const locale = request.nextUrl.pathname.split('/')[1];
                return NextResponse.redirect(new URL(`/${locale}/search`, request.url));
            }
        } catch {
            // Если не удалось распарсить - пропускаем дальше
        }
    }

    // Пропускаем запрос дальше
    return NextResponse.next();
}
