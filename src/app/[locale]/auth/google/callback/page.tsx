'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/store';
import { getRedirectAfterAuth } from '@/features/auth/model/navigation';
import { ensureLocalePrefix, getLocaleFromPathname } from '@/shared/lib/locale-utils';
import { Loader2 } from 'lucide-react';

function GoogleCallbackContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { initializeFromCookies, error } = useAuthStore();
    const processedRef = useRef(false);

    useEffect(() => {
        // Предотвращаем повторную обработку в StrictMode
        if (processedRef.current) return;
        processedRef.current = true;

        // Получаем return_url: 1) query param от бекенда, 2) sessionStorage, 3) fallback /search/properties/map
        const backendReturnUrl = searchParams.get('return_url');
        const returnUrl = backendReturnUrl || getRedirectAfterAuth(null, '/search/properties/map');
        const locale = getLocaleFromPathname(pathname);

        // Токены уже установлены в cookies бекендом
        // Просто загружаем данные пользователя
        initializeFromCookies()
            .then(() => {
                router.replace(ensureLocalePrefix(returnUrl, locale));
            })
            .catch(() => {
                router.replace(ensureLocalePrefix('/login?error=oauth_failed', locale));
            });
    }, [initializeFromCookies, router, searchParams, pathname]);

    if (error) {
        const pathname = usePathname();
        const locale = getLocaleFromPathname(pathname);
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-error mb-4">{error}</p>
                    <button
                        onClick={() => router.replace(ensureLocalePrefix('/login', locale))}
                        className="text-brand-primary hover:underline"
                    >
                        Back to login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-primary" />
                <p className="text-text-secondary">Completing sign in...</p>
            </div>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-primary" />
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}
