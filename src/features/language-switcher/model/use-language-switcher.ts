'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useRouter, usePathname } from '@/shared/config/routing';
import type { Locale } from '@/shared/config/i18n';

/**
 * Hook для управления переключением языка
 * 
 * @returns Объект с методами и состоянием переключателя языка
 */
export function useLanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [isPending, startTransition] = useTransition();

    const currentLocale = (params?.locale ?? 'ru') as Locale;

    /**
     * Меняет язык интерфейса
     */
    const changeLanguage = (locale: Locale) => {
        startTransition(() => {
            router.replace(pathname, { locale });
        });
    };

    return {
        currentLocale,
        changeLanguage,
        isPending,
    };
}
