import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ComparisonPage } from '@/screens/comparison-page';

interface ComparePageProps {
    params: Promise<{
        locale: string;
    }>;
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'comparison' });

    return {
        title: t('title'),
        description: t('subtitle'),
    };
}

export default async function ComparePage({ params }: ComparePageProps) {
    const { locale } = await params;

    return <ComparisonPage locale={locale} />;
}
