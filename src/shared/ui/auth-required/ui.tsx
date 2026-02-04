'use client';

import { useTranslations } from 'next-intl';
import { LogIn, Lock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Link } from '@/shared/config/routing';
import { cn } from '@/shared/lib/utils';

/**
 * Типы контекста для разных страниц
 */
export type AuthRequiredContext = 'chat' | 'profile' | 'favorites';

interface AuthRequiredProps {
    /** Контекст страницы для выбора соответствующего текста */
    context: AuthRequiredContext;
    /** Дополнительные классы для контейнера */
    className?: string;
}

/**
 * Компонент-заглушка для страниц, требующих авторизации
 * Отображается когда пользователь не авторизован
 */
export function AuthRequired({ context, className }: AuthRequiredProps) {
    const t = useTranslations('authRequired');
    const tAuth = useTranslations('auth');

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center min-h-[60vh] p-6 text-center',
                className
            )}
        >
            {/* Иконка */}
            <div className="w-20 h-20 rounded-full bg-background-tertiary flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-text-secondary" />
            </div>

            {/* Заголовок */}
            <h1 className="text-2xl font-bold text-text-primary mb-2">
                {t('title')}
            </h1>

            {/* Описание, зависящее от контекста */}
            <p className="text-text-secondary mb-8 max-w-sm">
                {t(`${context}.description`)}
            </p>

            {/* Кнопка входа */}
            <Link href="?modal=login">
                <Button size="lg" className="gap-2">
                    <LogIn className="w-5 h-5" />
                    {tAuth('signIn')}
                </Button>
            </Link>
        </div>
    );
}
