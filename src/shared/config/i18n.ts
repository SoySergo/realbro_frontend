/**
 * Типы для переводов приложения
 * Автоматически генерируется из структуры messages/ru.json
 */

export type Messages = typeof import('../../../messages/ru.json');

/**
 * Поддерживаемые локали
 */
export type Locale = 'ru' | 'en' | 'es' | 'ca' | 'uk' | 'pt' | 'it' | 'de' | 'fr';

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
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];
