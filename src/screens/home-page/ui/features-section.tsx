'use client';

import { useTranslations } from 'next-intl';
import { Zap, Bot, Layers, MapPin, Eye } from 'lucide-react';

const features = [
    { key: 'realtime', icon: Zap },
    { key: 'background', icon: Bot },
    { key: 'multipleTabs', icon: Layers },
    { key: 'location', icon: MapPin },
    { key: 'status', icon: Eye },
] as const;

export function FeaturesSection() {
    const t = useTranslations('landing.features');

    return (
        <section className="bg-background-secondary py-20 lg:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ key, icon: Icon }) => (
                        <div
                            key={key}
                            className="group rounded-2xl border border-border bg-background p-6 transition-all hover:border-brand-primary hover:shadow-lg"
                        >
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                                <Icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-text-primary">
                                {t(`${key}.title`)}
                            </h3>
                            <p className="text-text-secondary">
                                {t(`${key}.description`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
