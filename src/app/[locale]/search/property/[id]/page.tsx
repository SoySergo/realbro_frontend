import { setRequestLocale } from 'next-intl/server';

type Props = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function PropertyDetailPage({ params }: Props) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    return (
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 md:ml-14 pb-16 md:pb-0 md:pt-[52px]">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-text-primary mb-4">
                        🏠 Property Details #{id}
                    </h1>
                    <div className="space-y-4">
                        <div className="p-6 bg-background-secondary rounded-lg border border-border">
                            <h2 className="text-xl font-semibold text-text-primary mb-2">
                                Luxury Apartment
                            </h2>
                            <p className="text-text-secondary mb-4">
                                Описание недвижимости. Детальная информация об объекте.
                            </p>
                            <div className="flex items-center gap-4">
                                <span className="text-brand-primary font-bold font-mono text-2xl">
                                    €350,000
                                </span>
                                <span className="text-text-tertiary">
                                    120m² • 3 bed • 2 bath
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                            <p className="text-sm text-text-secondary">
                                ⚠️ <strong>Важно:</strong> На этой странице верхнее меню с QueriesSelect
                                НЕ должно отображаться на мобильных устройствах.
                            </p>
                            <p className="text-sm text-text-tertiary mt-2">
                                Только нижняя навигация должна быть видна.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
