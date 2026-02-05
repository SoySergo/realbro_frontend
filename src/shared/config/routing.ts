import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Конфигурация поддерживаемых языков
 */
export const routing = defineRouting({
    // Все поддерживаемые локали
    locales: ['ru', 'en', 'fr'],

    // Локаль по умолчанию
    defaultLocale: 'ru',

    // Стратегия определения локали
    localeDetection: true,

    // Префикс для маршрутов (always - всегда добавлять /locale/)
    localePrefix: 'always',
});

// Типизированные навигационные функции
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
