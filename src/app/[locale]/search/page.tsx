import { Sidebar } from '@/components/layout/sidebar';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

type Props = {
    params: Promise<{ locale: string }>;
};

// Компонент для демонстрации содержимого страницы поиска
function SearchContent() {
    const t = useTranslations('common');

    return (
        <div className="flex-1 p-6 space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">
                {t('search')} - Demo Page
            </h1>

            <div className="space-y-4">
                <div className="p-4 bg-background-secondary rounded-lg border border-border">
                    <h2 className="text-xl font-semibold mb-2 text-text-primary">
                        🎉 Мобильная навигация активна!
                    </h2>
                    <p className="text-text-secondary">
                        На мобильных устройствах (&lt; 768px) вы увидите:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-text-secondary">
                        <li><strong>Верхнее меню</strong>: Селектор поисковых запросов с переключателями темы/языка</li>
                        <li><strong>Нижнее меню</strong>: 4 вкладки навигации (Search, Chat, Profile, Settings)</li>
                    </ul>
                </div>

                <div className="p-4 bg-background-secondary rounded-lg border border-border">
                    <h2 className="text-xl font-semibold mb-2 text-text-primary">
                        💻 Desktop версия
                    </h2>
                    <p className="text-text-secondary">
                        На больших экранах (≥ 768px) показывается боковой сайдбар с:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-text-secondary">
                        <li>Логотипом RealBro</li>
                        <li>Списком сохранённых поисковых запросов</li>
                        <li>Hover-эффектом расширения</li>
                        <li>Нижней навигацией</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { id: 1, price: 250000, area: 85 },
                        { id: 2, price: 380000, area: 120 },
                        { id: 3, price: 195000, area: 65 },
                        { id: 4, price: 450000, area: 145 },
                        { id: 5, price: 320000, area: 95 },
                        { id: 6, price: 520000, area: 180 },
                    ].map((property) => (
                        <div
                            key={property.id}
                            className="p-6 bg-background-tertiary rounded-lg border border-border hover:border-brand-primary transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                                Property Card {property.id}
                            </h3>
                            <p className="text-text-secondary text-sm">
                                Демо карточка недвижимости для тестирования скролла и адаптивности
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-brand-primary font-bold font-mono">
                                    €{property.price.toLocaleString()}
                                </span>
                                <span className="text-text-tertiary text-sm">
                                    {property.area}m²
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-info/10 border border-info rounded-lg">
                    <h3 className="font-semibold text-info mb-2">💡 Как тестировать:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-text-secondary text-sm">
                        <li>Откройте DevTools (F12)</li>
                        <li>Переключите в режим мобильного устройства (Ctrl+Shift+M)</li>
                        <li>Попробуйте разные размеры экрана</li>
                        <li>Протестируйте навигацию между вкладками</li>
                        <li>Попробуйте селектор queries вверху</li>
                        <li>Переключите тему (светлая/тёмная)</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default async function SearchPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar (Desktop + Mobile) */}
            <Sidebar />

            {/* Основной контент с отступами */}
            <main className="flex-1 md:ml-16 pb-16 md:pb-0">
                {/* Отступ сверху для мобильного верхнего меню */}
                <div className="h-20 md:hidden" />

                <SearchContent />
            </main>
        </div>
    );
}
