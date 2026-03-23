'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Хук для подписки на CSS media-query.
 * Возвращает `true`, когда переданный запрос совпадает.
 *
 * @example
 * const isWide = useMediaQuery('(min-width: 1366px)');
 */
export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (callback: () => void) => {
            const mql = window.matchMedia(query);
            mql.addEventListener('change', callback);
            return () => mql.removeEventListener('change', callback);
        },
        [query]
    );

    const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
    const getServerSnapshot = useCallback(() => false, []);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
