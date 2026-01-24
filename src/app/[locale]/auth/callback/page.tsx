'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Резервный callback route для Google OAuth
 * Редиректит на правильный путь /auth/google/callback
 *
 * Этот роут нужен для обратной совместимости, если бекенд
 * настроен на редирект на /auth/callback вместо /auth/google/callback
 */
function AuthCallbackRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Получаем все query параметры
        const params = new URLSearchParams(searchParams.toString());

        // Редиректим на правильный Google callback с сохранением параметров
        const targetUrl = `/auth/google/callback${params.toString() ? `?${params.toString()}` : ''}`;

        router.replace(targetUrl);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-primary" />
                <p className="text-text-secondary">Redirecting...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackRedirect() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-primary" />
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        }>
            <AuthCallbackRedirectContent />
        </Suspense>
    );
}
