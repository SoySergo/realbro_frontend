import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
    await getTranslations('common');
    return {
        title: 'Demo Components',
        description: 'Development and testing page for components',
    };
}

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Заголовок страницы */}
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🧪 Demo Components
                    </h1>
                    <p className="text-gray-600">
                        Страница для разработки и тестирования компонентов
                    </p>
                </header>

                {/* Сетка для компонентов */}
                <div className="space-y-12">
                    {/* Секция 1: UI компоненты */}
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            UI Components
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Здесь будем добавлять компоненты для тестирования */}
                            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 text-center">
                                    Место для компонента
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Секция 2: Feature компоненты */}
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Feature Components
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Здесь будем тестировать фичи */}
                            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 text-center">
                                    Место для feature компонента
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Секция 3: Layout тесты */}
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Layout Tests
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500 text-center">
                                    Место для layout тестов
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
