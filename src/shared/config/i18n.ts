/**
 * Типы для переводов приложения
 * Автоматически генерируется из структуры messages/ru.json
 */

export type Messages = typeof import('../../../messages/ru.json');

/**
 * Поддерживаемые локали
 */
export type Locale = 'ru' | 'en' | 'fr';

/**
 * Метаданные языка
 */
export type LanguageMetadata = {
    code: Locale;
    name: string;
    nativeName: string;
    flag: string;
};

/**
 * Доступные языки с их метаданными
 */
export const LANGUAGES: LanguageMetadata[] = [
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];
