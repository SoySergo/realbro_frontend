'use client';

import { useTranslations } from 'next-intl';
import { RealtimeDemo } from './demos/realtime-demo';
import { BackgroundDemo } from './demos/background-demo';
import { TabsDemo } from './demos/tabs-demo';
import { LocationDemo } from './demos/location-demo';
import { StatusDemo } from './demos/status-demo';

export function DemoSection() {
    const t = useTranslations('landing.demo');

    return (
        <section className="bg-background py-20 lg:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="space-y-24">
                    {/* Real-time demo */}
                    <DemoBlock
                        title={t('realtimeTitle')}
                        demo={<RealtimeDemo />}
                        reverse={false}
                    />

                    {/* Background agent demo */}
                    <DemoBlock
                        title={t('backgroundTitle')}
                        demo={<BackgroundDemo />}
                        reverse={true}
                    />

                    {/* Multiple tabs demo */}
                    <DemoBlock
                        title={t('tabsTitle')}
                        demo={<TabsDemo />}
                        reverse={false}
                    />

                    {/* Location settings demo */}
                    <DemoBlock
                        title={t('locationTitle')}
                        demo={<LocationDemo />}
                        reverse={true}
                    />

                    {/* Status filtering demo */}
                    <DemoBlock
                        title={t('statusTitle')}
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
    demo,
    reverse,
}: {
    title: string;
    demo: React.ReactNode;
    reverse: boolean;
}) {
    return (
        <div
            className={`flex flex-col items-center gap-12 lg:flex-row ${
                reverse ? 'lg:flex-row-reverse' : ''
            }`}
        >
            <div className="flex-1">
                <h2 className="text-3xl font-bold text-text-primary lg:text-4xl">
                    {title}
                </h2>
            </div>
            <div className="flex-1 w-full">{demo}</div>
        </div>
    );
}
