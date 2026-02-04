'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Bed, Maximize } from 'lucide-react';

// Моковые данные объектов недвижимости для демо
const mockProperties = [
    { id: 1, price: 850, rooms: 2, area: 65, district: 'Eixample', image: '🏠' },
    { id: 2, price: 1200, rooms: 3, area: 90, district: 'Gràcia', image: '🏢' },
    { id: 3, price: 950, rooms: 2, area: 70, district: 'Sant Martí', image: '🏡' },
    { id: 4, price: 750, rooms: 1, area: 45, district: 'Sants', image: '🏘️' },
    { id: 5, price: 1100, rooms: 3, area: 85, district: 'Horta', image: '🏛️' },
];

export function RealtimeDemo() {
    const t = useTranslations('landing.demo');
    const [visibleCards, setVisibleCards] = useState<number[]>([]);
    const [cycle, setCycle] = useState(0);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    // Запуск анимации при изменении цикла
    useEffect(() => {
        // Очистка предыдущих таймаутов
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        setVisibleCards([]);

        // Показываем карточки по очереди
        mockProperties.forEach((property, index) => {
            const timeout = setTimeout(() => {
                setVisibleCards((prev) => [...prev, property.id]);
            }, (index + 1) * 700);
            timeoutsRef.current.push(timeout);
        });

        // Перезапуск цикла через 7 секунд
        const resetTimeout = setTimeout(() => {
            setCycle((prev) => prev + 1);
        }, 7000);
        timeoutsRef.current.push(resetTimeout);

        return () => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
        };
    }, [cycle]);

    // Форматирование цены
    const formatPrice = (price: number) => {
        return price.toLocaleString('ru-RU') + '€';
    };

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-4 md:p-6 overflow-hidden">
            {/* Заголовок с индикатором поиска */}
            <div className="mb-4 flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
                </div>
                <span className="text-sm font-medium text-text-secondary">
                    {t('agentSearching')}
                </span>
            </div>

            {/* Карточки недвижимости */}
            <div className="grid gap-3">
                {mockProperties.map((property) => {
                    const isVisible = visibleCards.includes(property.id);
                    const isNewest = isVisible && visibleCards.indexOf(property.id) === visibleCards.length - 1;

                    return (
                        <div
                            key={property.id}
                            className={`transform transition-all duration-500 ease-out ${
                                isVisible
                                    ? 'translate-x-0 opacity-100 scale-100'
                                    : 'translate-x-8 opacity-0 scale-95'
                            }`}
                        >
                            <Card className="border-border py-3 hover:border-brand-primary hover:shadow-md transition-all cursor-pointer group">
                                <CardContent className="flex items-center justify-between py-0 px-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        {/* Иконка/превью объекта */}
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-light text-2xl shrink-0">
                                            {property.image}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-brand-primary">
                                                {formatPrice(property.price)}
                                                <span className="text-text-secondary font-normal text-sm">
                                                    {t('perMonth')}
                                                </span>
                                            </p>
                                            <p className="text-sm text-text-secondary truncate">
                                                {property.district}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Badge 
                                            variant="secondary" 
                                            className="hidden sm:flex items-center gap-1 bg-background-tertiary"
                                        >
                                            <Bed className="h-3 w-3" />
                                            {property.rooms} {t('rooms')}
                                        </Badge>
                                        <Badge 
                                            variant="secondary"
                                            className="hidden md:flex items-center gap-1 bg-background-tertiary"
                                        >
                                            <Maximize className="h-3 w-3" />
                                            {property.area}m²
                                        </Badge>
                                        {/* Бейдж NEW для последней карточки */}
                                        {isNewest && (
                                            <Badge className="bg-success text-white animate-pulse">
                                                NEW
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
