import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AgenciesPage } from '@/screens/agencies-page';
import { getAgenciesList } from '@/shared/api';

interface AgenciesPageProps {
    params: Promise<{
        locale: string;
    }>;
}

// ISR: revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({ params }: AgenciesPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'agency' });

    return {
        title: t('agencies'),
        description: t('searchAgencies'),
    };
}

export default async function Page({ params }: AgenciesPageProps) {
    const { locale } = await params;

    // Загрузка начальных данных на сервере
    const { data: initialAgencies } = await getAgenciesList({}, 1, 12, locale);

    return (
        <AgenciesPage
            locale={locale}
            initialAgencies={initialAgencies}
        />
    );
}
