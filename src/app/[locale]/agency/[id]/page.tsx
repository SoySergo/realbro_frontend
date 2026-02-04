import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AgencyDetailPage } from '@/screens/agency-detail-page';
import { getAgencyById, getAgencyProperties } from '@/shared/api';

interface AgencyPageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

// ISR: revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({ params }: AgencyPageProps): Promise<Metadata> {
    const { locale, id } = await params;
    const agency = await getAgencyById(id, locale);

    if (!agency) {
        return {
            title: 'Agency Not Found',
        };
    }

    return {
        title: agency.name,
        description: agency.descriptionShort || agency.description.substring(0, 160),
        openGraph: {
            title: agency.name,
            description: agency.descriptionShort || agency.description.substring(0, 160),
            images: agency.logo ? [agency.logo] : [],
            type: 'website',
        },
    };
}

export default async function Page({ params }: AgencyPageProps) {
    const { locale, id } = await params;

    // Загрузка данных параллельно
    const [agency, propertiesResult] = await Promise.all([
        getAgencyById(id, locale),
        getAgencyProperties(id, 1, 12),
    ]);

    if (!agency) {
        notFound();
    }

    return (
        <AgencyDetailPage
            agency={agency}
            properties={propertiesResult.data}
            locale={locale}
        />
    );
}
