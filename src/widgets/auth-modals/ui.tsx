'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/shared/ui/dialog';
import { LoginForm, RegisterForm, ForgotPasswordForm } from '@/features/auth';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

/**
 * Компонент для управления модальными окнами аутентификации
 * Открывается через URL параметр ?modal=login|register|forgot-password
 */
function AuthModalsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations('auth');

    const modal = searchParams.get('modal');
    const isOpen = modal === 'login' || modal === 'register' || modal === 'forgot-password';

    const handleClose = () => {
        // Убираем параметр modal из URL
        const params = new URLSearchParams(searchParams);
        params.delete('modal');

        // Формируем новый URL без параметра modal
        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

        router.push(newUrl);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary text-white font-bold text-xl">
                            R
                        </div>
                    </div>
                    {modal === 'login' && (
                        <>
                            <DialogTitle className="text-center">{t('welcomeBack')}</DialogTitle>
                            <DialogDescription className="text-center">
                                {t('enterCredentials')}
                            </DialogDescription>
                        </>
                    )}
                    {modal === 'register' && (
                        <>
                            <DialogTitle className="text-center">{t('createAccount')}</DialogTitle>
                            <DialogDescription className="text-center">
                                {t('enterDetails')}
                            </DialogDescription>
                        </>
                    )}
                    {modal === 'forgot-password' && (
                        <>
                            <DialogTitle className="text-center">{t('resetPassword')}</DialogTitle>
                            <DialogDescription className="text-center">
                                {t('resetPasswordDescription')}
                            </DialogDescription>
                        </>
                    )}
                </DialogHeader>

                {modal === 'login' && <LoginForm />}
                {modal === 'register' && <RegisterForm />}
                {modal === 'forgot-password' && <ForgotPasswordForm />}
            </DialogContent>
        </Dialog>
    );
}

export function AuthModals() {
    return (
        <Suspense fallback={null}>
            <AuthModalsContent />
        </Suspense>
    );
}
