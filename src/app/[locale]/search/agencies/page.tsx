import { redirect } from 'next/navigation';

/**
 * /search/agencies → /search/agencies/list по умолчанию
 */
export default function Page() {
    redirect('./agencies/list');
}
