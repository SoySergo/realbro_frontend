'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/shared/config/routing';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert } from '@/shared/ui/alert';
import { useAuth, useGuestOnly } from '../../model/hooks';
import { registerSchema, type RegisterFormData } from '../../lib/validation';
import { SocialButtons } from '../social-buttons';
import { getRedirectAfterAuth } from '../../model/navigation';
import { ensureLocalePrefix, getLocaleFromPathname } from '@/shared/lib/locale-utils';
import { Loader2 } from 'lucide-react';

type RegisterFormProps = {
    className?: string;
};

function RegisterFormContent({ className }: RegisterFormProps) {
    const t = useTranslations('auth');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { register: registerUser, isLoading, error } = useAuth();

    // Редирект если уже авторизован
    useGuestOnly();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data.email, data.password);

            // Получаем URL для редиректа (из query params, sessionStorage или default)
            const redirectUrl = getRedirectAfterAuth(searchParams, '/search');

            // Добавляем locale если путь не содержит его
            const locale = getLocaleFromPathname(pathname);
            const finalUrl = ensureLocalePrefix(redirectUrl, locale);

            // Закрываем модалку и редиректим
            router.push(finalUrl);
        } catch {
            // Ошибка обработана в store
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn('flex flex-col gap-6', className)}
        >
            {error && (
                <Alert variant="destructive">
                    {error}
                </Alert>
            )}

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className="text-sm text-error">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...register('password')}
                    />
                    {errors.password && (
                        <p className="text-sm text-error">
                            {errors.password.message}
                        </p>
                    )}
                    <p className="text-xs text-text-tertiary">
                        {t('passwordRequirements')}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                        <p className="text-sm text-error">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? t('loading') : t('signUp')}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-text-secondary">
                        {t('orContinueWith')}
                    </span>
                </div>
            </div>

            <SocialButtons disabled={isLoading} />

            <p className="text-center text-sm text-text-secondary">
                {t('hasAccount')}{' '}
                <Link
                    href="?modal=login"
                    className="text-brand-primary hover:underline"
                >
                    {t('signIn')}
                </Link>
            </p>
        </form>
    );
}

export function RegisterForm({ className }: RegisterFormProps) {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
            </div>
        }>
            <RegisterFormContent className={className} />
        </Suspense>
    );
}
