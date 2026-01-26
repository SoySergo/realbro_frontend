import { redirect } from 'next/navigation';

/**
 * /search редиректит на /search/map по умолчанию
 *
 * Структура страниц поиска:
 * - /search/list - листинг списком (ISR, Server Components для SEO)
 * - /search/map - карта (клиентская, интерактивная)
 */
export default function Page() {
    redirect('./search/map');
}
