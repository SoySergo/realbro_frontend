import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/features/auth';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'auth' });

    return {
        title: t('signIn'),
    };
}

export default async function LoginPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const t = await getTranslations('auth');

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary text-white font-bold text-xl">
                            R
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {t('welcomeBack')}
                    </CardTitle>
                    <CardDescription>{t('enterCredentials')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    );
}
