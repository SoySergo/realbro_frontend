'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/shared/config/routing';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert } from '@/shared/ui/alert';
import { authApi, AuthError } from '@/shared/api/auth';
import {
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from '../../lib/validation';
import { Loader2 } from 'lucide-react';

type ForgotPasswordFormProps = {
    className?: string;
};

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
    const t = useTranslations('auth');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            await authApi.requestPasswordReset(data.email);
            setIsSuccess(true);
        } catch (err) {
            const message =
                err instanceof AuthError
                    ? err.message
                    : 'Failed to send reset link';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={cn('flex flex-col gap-6 text-center', className)}>
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-text-primary">
                        {t('checkEmail')}
                    </h2>
                    <p className="text-sm text-text-secondary">
                        {t('resetLinkSent')}
                    </p>
                </div>

                <Link href="?modal=login">
                    <Button variant="outline" className="w-full">
                        {t('backToLogin')}
                    </Button>
                </Link>
            </div>
        );
    }

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
                    <p className="text-sm text-error">{errors.email.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? t('loading') : t('sendResetLink')}
            </Button>

            <p className="text-center text-sm text-text-secondary">
                <Link
                    href="?modal=login"
                    className="text-brand-primary hover:underline"
                >
                    {t('backToLogin')}
                </Link>
            </p>
        </form>
    );
}
