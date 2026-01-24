import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/shared/config/routing';

// Создаем middleware для интернационализации
const intlMiddleware = createMiddleware(routing);

// Гостевые роуты (доступны только неавторизованным)
// Защищенные роуты проверяются на клиенте через useRequireAuth
const guestRoutes = ['/login', '/register', '/forgot-password'];

/**
 * Проверка авторизации через localStorage данные в cookie
 */
function checkAuth(request: NextRequest): boolean {
    const authCookie = request.cookies.get('auth-storage');

    if (!authCookie?.value) {
        return false;
    }

    try {
        const parsed = JSON.parse(authCookie.value);
        // Проверяем наличие user объекта (согласно persist config в store.ts)
        return !!(parsed?.state?.user);
    } catch {
        return false;
    }
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Специальная обработка для OAuth callback без locale
    // Бекенд редиректит на /auth/google/callback, но Next.js требует /[locale]/auth/google/callback
    if (pathname.startsWith('/auth/google/callback')) {
        // Определяем locale из cookies или используем default
        const locale = request.cookies.get('NEXT_LOCALE')?.value || routing.defaultLocale;

        // Создаем новый URL с locale
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}${pathname}`;

        // Сохраняем все query параметры (return_url и т.д.)
        return NextResponse.redirect(url);
    }

    // Извлекаем locale из пути
    const locale = routing.locales.find(
        (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
    );

    // Путь без locale
    const pathnameWithoutLocale = locale
        ? pathname.replace(`/${locale}`, '') || '/'
        : pathname;

    // Проверка авторизации
    const isAuthenticated = checkAuth(request);

    // Проверка гостевых роутов
    const isGuestRoute = guestRoutes.some((route) =>
        pathnameWithoutLocale.startsWith(route)
    );

    // Редирект авторизованных с гостевых страниц (login/register)
    // Защищенные роуты НЕ проверяем в middleware - это делает useRequireAuth на клиенте
    // Это позволяет избежать двойного редиректа
    if (isGuestRoute && isAuthenticated) {
        const searchUrl = new URL(
            `/${locale || routing.defaultLocale}/search`,
            request.url
        );
        return NextResponse.redirect(searchUrl);
    }

    // Применяем intl middleware
    return intlMiddleware(request);
}

export const config = {
    matcher: ['/', '/(ru|en|fr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
