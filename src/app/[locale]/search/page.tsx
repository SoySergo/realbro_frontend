import { SearchPage } from '@/screens/search-page';
import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchPage />
        </Suspense>
    );
}
