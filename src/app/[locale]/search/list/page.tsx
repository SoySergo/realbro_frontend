import { redirect } from 'next/navigation';

/**
 * Обратная совместимость: /search/list → /search/properties/list
 */
export default async function Page({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedSearchParams = await searchParams;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
        if (value) params.set(key, String(value));
    }
    const qs = params.toString();
    redirect(`./properties/list${qs ? `?${qs}` : ''}`);
}
