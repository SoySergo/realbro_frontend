/**
 * Поддерживаемые локали приложения
 */
const LOCALES = ['ru', 'en', 'fr', 'uk', 'de', 'pt', 'es', 'ca', 'it'] as const;

export type Locale = typeof LOCALES[number];

/**
 * Проверяет, начинается ли URL с префикса локали
 * @param url - URL для проверки
 * @returns true, если URL начинается с валидной локали
 */
export function hasLocalePrefix(url: string): boolean {
    const parts = url.split('/').filter(Boolean);
    return parts.length > 0 && LOCALES.includes(parts[0] as Locale);
}

/**
 * Добавляет префикс локали к URL, если его нет
 * @param url - URL для обработки
 * @param locale - Локаль для добавления
 * @returns URL с префиксом локали
 */
export function ensureLocalePrefix(url: string, locale: string): string {
    if (hasLocalePrefix(url)) return url;
    return `/${locale}${url.startsWith('/') ? url : '/' + url}`;
}

/**
 * Извлекает локаль из pathname
 * @param pathname - Pathname для обработки
 * @returns Локаль из pathname или 'ru' по умолчанию
 */
export function getLocaleFromPathname(pathname: string): string {
    const parts = pathname.split('/').filter(Boolean);
    return LOCALES.includes(parts[0] as Locale) ? parts[0] : 'ru';
}

/**
 * Удаляет префикс локали из URL
 * @param url - URL для обработки
 * @returns URL без префикса локали
 */
export function removeLocalePrefix(url: string): string {
    if (!hasLocalePrefix(url)) return url;
    const parts = url.split('/').filter(Boolean);
    parts.shift(); // Удаляем первую часть (локаль)
    return '/' + parts.join('/');
}
