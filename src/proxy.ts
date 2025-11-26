import createMiddleware from 'next-intl/middleware';
import { routing } from '@/shared/config/routing';

/**
 * Middleware для автоматического определения и переключения языка
 * Использует заголовки Accept-Language для определения предпочитаемого языка
 */
export default createMiddleware(routing);

export const config = {
    // Применяется ко всем маршрутам, кроме API, static файлов и изображений
    matcher: ['/', '/(ru|en|fr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
