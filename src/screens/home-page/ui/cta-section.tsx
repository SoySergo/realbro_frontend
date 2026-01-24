'use client';

import { Button } from '@/shared/ui/button';
import { Link } from '@/shared/config/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
    const t = useTranslations('landing.cta');

    return (
        <section className="bg-gradient-to-b from-background to-brand-primary-light py-20 lg:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-text-primary lg:text-4xl">
                        {t('title')}
                    </h2>
                    <p className="mt-4 text-lg text-text-secondary">
                        {t('subtitle')}
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="gap-2 bg-brand-primary hover:bg-brand-primary-hover"
                        >
                            <Link href="/search">
                                {t('startFree')}
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/pricing">{t('viewPricing')}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
