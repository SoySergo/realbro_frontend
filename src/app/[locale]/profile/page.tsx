import { SidebarWrapper as Sidebar } from '@/widgets/sidebar';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { ProfileContent } from './profile-content';

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
            <Sidebar />

            <main className="flex-1 md:ml-16 pb-16 md:pb-0">
                <ProfileContent />
            </main>
        </div>
    );
}
