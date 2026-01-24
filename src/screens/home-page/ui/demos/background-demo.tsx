'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Bell, MessageSquare, Bot } from 'lucide-react';

const notifications = [
    { id: 1, title: 'Новый объект в Eixample', price: '950€', time: '2 мин назад' },
    { id: 2, title: 'Подходящая квартира в Gràcia', price: '1,100€', time: '5 мин назад' },
    { id: 3, title: 'Агент нашёл 3 варианта', price: '', time: '10 мин назад' },
];

export function BackgroundDemo() {
    const [activeNotification, setActiveNotification] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNotification((prev) => (prev + 1) % notifications.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-6">
            <div className="flex flex-col gap-4">
                {/* Chat simulation */}
                <div className="rounded-xl border border-border bg-background p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-text-primary">
                            ИИ Агент
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="rounded-lg bg-background-tertiary p-3">
                            <p className="text-sm text-text-secondary">
                                Нашёл 3 новых объекта по вашим критериям:
                            </p>
                            <p className="text-sm text-text-secondary">
                                • 2 комнаты, Eixample — 950€
                            </p>
                            <p className="text-sm text-text-secondary">
                                • 3 комнаты, Gràcia — 1,100€
                            </p>
                            <p className="text-sm text-text-secondary">
                                • 2 комнаты, Sant Martí — 890€
                            </p>
                        </div>
                    </div>
                </div>

                {/* Push notification */}
                <div className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-error text-white text-xs font-bold">
                            3
                        </div>
                    </div>
                    <Card className="border-brand-primary py-3">
                        <CardContent className="flex items-center gap-3 py-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-light">
                                <Bell className="h-5 w-5 text-brand-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-text-primary">
                                    {notifications[activeNotification].title}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {notifications[activeNotification].price && (
                                        <span className="font-medium text-brand-primary mr-2">
                                            {notifications[activeNotification].price}
                                        </span>
                                    )}
                                    {notifications[activeNotification].time}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
