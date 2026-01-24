import { SearchPage } from '@/screens/search-page';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchPage />
        </Suspense>
    );
}
