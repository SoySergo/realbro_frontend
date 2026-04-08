'use client';

import { usePathname } from '@/shared/config/routing';
import { SearchPageHeader } from '@/app/[locale]/[type]/_header/ui';

/**
 * Сегменты, у которых есть собственный хедер или хедер не нужен.
 * [type]/* обрабатывается в _layout-client.tsx,
 * auth-страницы не показывают хедер.
 */
const SEGMENTS_WITHOUT_ROOT_HEADER = new Set([
    'login',
    'register',
    'forgot-password',
    'auth',
    'demo',
]);

/**
 * Явные сегменты, определённые как отдельные папки маршрутов.
 * Всё, что не входит в этот список, считается [type] и пропускается.
 */
const NAMED_ROUTE_SEGMENTS = new Set([
    'favorites',
    'profile',
    'chat',
    'compare',
    'pricing',
    'settings',
    'search',
    'agency',
    'property',
    ...SEGMENTS_WITHOUT_ROOT_HEADER,
]);

/**
 * RootHeader — глобальный хедер, рендерится в корневом layout.
 *
 * Не отображается:
 * - На [type]/* страницах (у них свой хедер в _layout-client.tsx)
 * - На auth-страницах (login, register и т.д.)
 *
 * На остальных страницах показывает full-width SearchPageHeader.
 */
export function RootHeader() {
    const pathname = usePathname();
    const firstSegment = pathname?.split('/').filter(Boolean)[0] || '';

    // Главная страница (/) — показываем хедер
    if (!firstSegment) {
        return (
            <div className="hidden md:block">
                <SearchPageHeader />
            </div>
        );
    }

    // Auth и demo страницы — без хедера
    if (SEGMENTS_WITHOUT_ROOT_HEADER.has(firstSegment)) {
        return null;
    }

    // [type] маршруты — у них свой хедер, пропускаем
    if (!NAMED_ROUTE_SEGMENTS.has(firstSegment)) {
        return null;
    }

    return (
        <div className="hidden md:block">
            <SearchPageHeader />
        </div>
    );
}
