'use client';

import { Button } from '@/shared/ui/button';
import { Link } from '@/shared/config/routing';
import { useTranslations } from 'next-intl';
import { Search, Bot, Layers } from 'lucide-react';

export function HeroSection() {
    const t = useTranslations('landing.hero');

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-primary-light to-background py-20 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center">
                    <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-6xl">
                        {t('title')}
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-text-secondary md:text-xl">
                        {t('subtitle')}
                    </p>
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                        <Button asChild size="lg" className="gap-2 bg-brand-primary hover:bg-brand-primary-hover">
                            <Link href="/search">
                                <Search className="h-5 w-5" />
                                {t('cta')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="gap-2">
                            <Link href="/search">
                                <Bot className="h-5 w-5" />
                                {t('ctaAgent')}
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="lg" className="gap-2">
                            <Link href="/search">
                                <Layers className="h-5 w-5" />
                                {t('ctaTabs')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-primary/5 blur-3xl" />
        </section>
    );
}
