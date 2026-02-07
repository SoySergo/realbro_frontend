'use client';

import { useTranslations } from 'next-intl';
import { RealtimeDemo } from './demos/realtime-demo';
import { BackgroundDemo } from './demos/background-demo';
import { TabsDemo } from './demos/tabs-demo';
import { LocationDemo } from './demos/location-demo';
import { StatusDemo } from './demos/status-demo';
import { Zap, Bot, Layers, MapPin, Eye } from 'lucide-react';

export function DemoSection() {
    const t = useTranslations('landing');

    return (
        <section className="bg-background py-16 lg:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="space-y-16 lg:space-y-24">
                    {/* Real-time demo */}
                    <DemoBlock
                        title={t('demo.realtimeTitle')}
                        description={t('features.realtime.description')}
                        icon={<Zap className="h-6 w-6" />}
                        demo={<RealtimeDemo />}
                        reverse={false}
                    />

                    {/* Background agent demo */}
                    <DemoBlock
                        title={t('demo.backgroundTitle')}
                        description={t('features.background.description')}
                        icon={<Bot className="h-6 w-6" />}
                        demo={<BackgroundDemo />}
                        reverse={true}
                    />

                    {/* Multiple tabs demo */}
                    <DemoBlock
                        title={t('demo.tabsTitle')}
                        description={t('features.multipleTabs.description')}
                        icon={<Layers className="h-6 w-6" />}
                        demo={<TabsDemo />}
                        reverse={false}
                    />

                    {/* Location settings demo */}
                    <DemoBlock
                        title={t('demo.locationTitle')}
                        description={t('features.location.description')}
                        icon={<MapPin className="h-6 w-6" />}
                        demo={<LocationDemo />}
                        reverse={true}
                    />

                    {/* Status filtering demo */}
                    <DemoBlock
                        title={t('demo.statusTitle')}
                        description={t('features.status.description')}
                        icon={<Eye className="h-6 w-6" />}
                        demo={<StatusDemo />}
                        reverse={false}
                    />
                </div>
            </div>
        </section>
    );
}

function DemoBlock({
    title,
    description,
    icon,
    demo,
    reverse,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    demo: React.ReactNode;
    reverse: boolean;
}) {
    return (
        <div
            className={`flex flex-col items-center gap-8 lg:gap-12 lg:flex-row ${
                reverse ? 'lg:flex-row-reverse' : ''
            }`}
        >
            {/* Текстовый блок */}
            <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary mb-4">
                    {icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary lg:text-4xl mb-4">
                    {title}
                </h2>
                <p className="text-text-secondary text-lg max-w-md mx-auto lg:mx-0">
                    {description}
                </p>
            </div>
            {/* Демо-блок */}
            <div className="flex-1 w-full max-w-xl lg:max-w-none">{demo}</div>
        </div>
    );
}
