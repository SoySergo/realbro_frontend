import { redirect } from 'next/navigation';

/**
 * Обратная совместимость: /agencies → /search/agencies/list
 */
export default function Page() {
    redirect('../search/agencies/list');
}
