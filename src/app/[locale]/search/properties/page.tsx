import { redirect } from 'next/navigation';

/**
 * /search/properties → /search/properties/map по умолчанию
 */
export default function Page() {
    redirect('./properties/map');
}
