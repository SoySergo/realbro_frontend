import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { ProfileWidget } from '@/widgets/profile';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'profile' });

    return {
        title: t('title'),
    };
}

export default async function ProfilePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-14 pb-16 md:pb-0 md:pt-[52px]">
                <ProfileWidget />
            </main>
        </div>
    );
}
