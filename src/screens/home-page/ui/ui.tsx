import { HeroSection } from './hero-section';
import { FeaturesSection } from './features-section';
import { DemoSection } from './demo-section';
import { CtaSection } from './cta-section';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function HomePage({ params }: Props) {
    // Дожидаемся params для Next.js 15+
    await params;

    return (
        <div className="min-h-screen bg-background md:ml-14">
            <main className="flex flex-col md:pt-[52px]">
                <HeroSection />
                <FeaturesSection />
                <DemoSection />
                <CtaSection />
            </main>
        </div>
    );
}
