import { Sidebar } from '@/components/layout/sidebar';
import { setRequestLocale } from 'next-intl/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 md:ml-16 pb-16 md:pb-0">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-text-primary mb-4">
                        👤 Profile Page
                    </h1>
                    <div className="p-6 bg-background-secondary rounded-lg border border-border">
                        <p className="text-text-secondary">
                            Страница профиля пользователя.
                        </p>
                        <p className="text-text-tertiary text-sm mt-2">
                            Проверьте нижнее меню - вкладка Profile должна быть активной
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
