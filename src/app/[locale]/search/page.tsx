import { redirect } from 'next/navigation';

/**
 * /search → /search/properties/map по умолчанию
 */
export default function Page() {
    redirect('./search/properties/map');
}
