import { getTranslations } from 'next-intl/server';
import { PricingCards } from './pricing-cards';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function PricingPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'pricing' });

    return (
        <div className="min-h-screen bg-background py-16 lg:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
                        {t('title')}
                    </h1>
                    <p className="mt-4 text-lg text-text-secondary">
                        {t('subtitle')}
                    </p>
                </div>
                <PricingCards />
            </div>
        </div>
    );
}
