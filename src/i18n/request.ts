import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/shared/config/routing';

/**
 * Конфигурация для загрузки переводов на основе локали
 * Этот файл требуется next-intl для работы с App Router
 */
export default getRequestConfig(async ({ requestLocale }) => {
    // Получаем локаль из запроса
    let locale = await requestLocale;

    // Проверяем, что локаль поддерживается
    if (!locale || !routing.locales.includes(locale as 'ru' | 'en' | 'fr' | 'uk' | 'de' | 'pt' | 'es' | 'ca' | 'it')) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
