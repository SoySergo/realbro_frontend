'use client';

import { useAuth } from '@/features/auth';
import { Link } from '@/shared/config/routing';
import { useTranslations } from 'next-intl';
import { LogIn } from 'lucide-react';

/**
 * Кнопка для входа - показывается только неавторизованным пользователям
 */
export function LoginButton() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const t = useTranslations('auth');

    // Не показываем пока грузится
    if (isLoading) {
        return null;
    }

    // Если авторизован - показываем приветствие
    if (isAuthenticated && user) {
        return (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>Welcome, {user.email}</span>
            </div>
        );
    }

    // Если не авторизован - показываем кнопку логина
    return (
        <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-brand-primary px-5 text-brand-primary transition-colors hover:bg-brand-primary hover:text-white md:w-auto md:min-w-[158px]"
        >
            <LogIn className="h-4 w-4" />
            {t('signIn')}
        </Link>
    );
}
