import { getTranslations } from 'next-intl/server';
import { HeroSection } from './hero-section';
import { FeaturesSection } from './features-section';
import { DemoSection } from './demo-section';
import { CtaSection } from './cta-section';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function HomePage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'landing' });

    return (
        <div className="min-h-screen bg-background">
            <main className="flex flex-col">
                <HeroSection />
                <FeaturesSection />
                <DemoSection />
                <CtaSection />
            </main>
        </div>
    );
}
