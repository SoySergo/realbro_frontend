'use client';

import React from 'react';
import { useSidebarStore } from '@/store/sidebarStore';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export default function SidebarDemoPage() {
    const { queries, addQuery } = useSidebarStore();

    // Инициализация тестовых данных при первом рендере
    React.useEffect(() => {
        if (queries.length === 0) {
            addQuery({
                title: 'Apartments in Downtown',
                filters: {
                    location: 'City Center',
                    priceMin: 300000,
                    priceMax: 600000,
                    bedrooms: 2,
                },
                resultsCount: Math.floor(Math.random() * 9900) + 100,
                newResultsCount: Math.floor(Math.random() * 20) + 1,
            });
            addQuery({
                title: 'Luxury Villas',
                filters: {
                    location: 'Suburbs',
                    priceMin: 800000,
                    bedrooms: 4,
                    propertyType: 'Villa',
                },
                resultsCount: Math.floor(Math.random() * 9900) + 100,
                newResultsCount: Math.floor(Math.random() * 15) + 1,
            });
            addQuery({
                title: 'Studio Apartments',
                filters: {
                    location: 'University District',
                    priceMax: 200000,
                    bedrooms: 1,
                },
                resultsCount: Math.floor(Math.random() * 9900) + 100,
                newResultsCount: Math.floor(Math.random() * 30) + 1,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Добавляем тестовые запросы если их нет
    const initializeTestData = () => {
        if (queries.length < 3) {
            addQuery({
                title: 'Apartments in Downtown',
                filters: {
                    location: 'City Center',
                    priceMin: 300000,
                    priceMax: 600000,
                    bedrooms: 2,
                },
                resultsCount: Math.floor(Math.random() * 9900) + 100,
                newResultsCount: Math.floor(Math.random() * 20) + 1,
            });
            addQuery({
                title: 'Luxury Villas',
                filters: {
                    location: 'Suburbs',
                    priceMin: 800000,
                    bedrooms: 4,
                    propertyType: 'Villa',
                },
                resultsCount: Math.floor(Math.random() * 9900) + 100,
                newResultsCount: Math.floor(Math.random() * 15) + 1,
            });
            addQuery({
                title: 'Studio Apartments',
                filters: {
                    location: 'University District',
                    priceMax: 200000,
                    bedrooms: 1,
                },
                resultsCount: Math.floor(Math.random() * 9900) + 100,
                newResultsCount: Math.floor(Math.random() * 30) + 1,
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Сайдбар */}
            <Sidebar />

            {/* Контент с отступом для сайдбара */}
            <div className="pl-16">
                {/* Хедер */}
                <div className="sticky top-0 z-40 bg-background-secondary border-b border-border">
                    <div className="max-w-7xl mx-auto px-8 py-6">
                        <h1 className="text-3xl font-bold text-text-primary mb-2">
                            Sidebar Variants Demo
                        </h1>
                        <p className="text-text-secondary">
                            Выберите вариант сайдбара и наведите мышкой для раскрытия
                        </p>
                    </div>
                </div>

                {/* Основной контент */}
                <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
                    {/* Предупреждение */}
                    <div className="bg-brand-primary-light border border-brand-primary rounded-lg p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                        <div>
                            <div className="font-semibold text-brand-primary mb-1">
                                Как использовать
                            </div>
                            <div className="text-sm text-text-secondary">
                                Наведите мышкой на левый сайдбар (узкая полоска) чтобы он раскрылся.
                                Попробуйте добавить новые запросы, переключаться между ними, и удалять.
                            </div>
                        </div>
                    </div>

                    {/* Информация о сайдбаре */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-text-primary">
                                Sidebar Demo
                            </h2>
                            <Badge variant="secondary" className="font-mono">
                                {queries.length} {queries.length === 1 ? 'search' : 'searches'}
                            </Badge>
                        </div>
                    </div>

                    {/* Функции */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-text-primary">
                            Тестовые действия
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={initializeTestData}
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-start gap-2"
                            >
                                <span className="font-semibold">Добавить тестовые данные</span>
                                <span className="text-xs text-text-secondary font-normal">
                                    Заполнит сайдбар примерами поисковых запросов
                                </span>
                            </Button>

                            <Button
                                onClick={() => {
                                    const title = `New Search ${queries.length + 1}`;
                                    // Создаем запрос с флагом загрузки
                                    addQuery({
                                        title,
                                        filters: {
                                            location: 'Custom Location',
                                            bedrooms: Math.floor(Math.random() * 4) + 1,
                                        },
                                        isLoading: true,
                                    });

                                    // Имитация загрузки данных (1-2 секунды)
                                    const loadingTime = Math.random() * 1000 + 1000;
                                    setTimeout(() => {
                                        const { queries: currentQueries, updateQuery } = useSidebarStore.getState();
                                        const query = currentQueries.find(q => q.title === title && q.isLoading);

                                        if (query) {
                                            updateQuery(query.id, {
                                                resultsCount: Math.floor(Math.random() * 9900) + 100,
                                                newResultsCount: 0,
                                                isLoading: false,
                                            });
                                        }
                                    }, loadingTime);
                                }}
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-start gap-2"
                            >
                                <span className="font-semibold">Добавить случайный запрос</span>
                                <span className="text-xs text-text-secondary font-normal">
                                    Создаст новый запрос со случайными параметрами (100-10000 результатов) с анимацией загрузки
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* Характеристики сайдбара */}
                    <div className="bg-background-secondary rounded-lg border border-border p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-text-primary">
                            Характеристики сайдбара
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-sm font-medium text-text-secondary mb-2">
                                    Ширина (свернут)
                                </div>
                                <div className="text-2xl font-bold text-text-primary font-mono">
                                    64px
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-text-secondary mb-2">
                                    Ширина (развернут)
                                </div>
                                <div className="text-2xl font-bold text-text-primary font-mono">
                                    320px
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-text-secondary mb-2">
                                    Анимация
                                </div>
                                <div className="text-2xl font-bold text-text-primary font-mono">
                                    300ms
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Пояснение особенностей */}
                    <div className="bg-background-secondary rounded-lg border border-border p-6">
                        <h3 className="font-semibold text-text-primary mb-3">
                            Особенности:
                        </h3>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-brand-primary mt-1">•</span>
                                <span>
                                    <strong>Карточный дизайн:</strong> Визуальные карточки с превью и детальной информацией
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-primary mt-1">•</span>
                                <span>
                                    <strong>Badges для фильтров:</strong> Показывает активные фильтры поиска как badges
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-primary mt-1">•</span>
                                <span>
                                    <strong>Счетчики результатов:</strong> Отображает количество найденных объектов и новых результатов
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-primary mt-1">•</span>
                                <span>
                                    <strong>Анимация загрузки:</strong> Красивый skeleton loader при загрузке данных
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
