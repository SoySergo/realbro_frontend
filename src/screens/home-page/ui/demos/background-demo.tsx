'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/shared/ui/card';
import { Bell, Bot, Send } from 'lucide-react';

// Данные чата с агентом
const chatMessages = [
    { id: 1, type: 'agent' as const, properties: [
        { rooms: 2, district: 'Eixample', price: 950 },
        { rooms: 3, district: 'Gràcia', price: 1100 },
        { rooms: 2, district: 'Sant Martí', price: 890 },
    ]},
];

// Уведомления
const notifications = [
    { id: 1, district: 'Eixample', price: 950, minutes: 2 },
    { id: 2, district: 'Gràcia', price: 1100, minutes: 5 },
    { id: 3, district: 'Sants', price: 780, minutes: 10 },
];

export function BackgroundDemo() {
    const t = useTranslations('landing.demo');
    const [activeNotification, setActiveNotification] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [typingDots, setTypingDots] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Анимация уведомлений
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setActiveNotification((prev) => (prev + 1) % notifications.length);
        }, 3000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Анимация чата
    useEffect(() => {
        const chatTimeout = setTimeout(() => {
            setShowChat(true);
        }, 1000);

        return () => clearTimeout(chatTimeout);
    }, []);

    // Анимация печатания
    useEffect(() => {
        const dotsInterval = setInterval(() => {
            setTypingDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 400);
        return () => clearInterval(dotsInterval);
    }, []);

    const currentNotification = notifications[activeNotification];

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-4 md:p-6">
            <div className="flex flex-col gap-4">
                {/* Симуляция чата */}
                <div className="rounded-xl border border-border bg-background p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-text-primary">
                            {t('aiAgent')}
                        </span>
                        <div className="ml-auto flex h-2 w-2">
                            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                        </div>
                    </div>

                    {/* Сообщение агента */}
                    <div
                        className={`transform transition-all duration-500 ${
                            showChat
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-4 opacity-0'
                        }`}
                    >
                        <div className="rounded-2xl rounded-tl-sm bg-background-tertiary p-3">
                            <p className="text-sm text-text-primary mb-2">
                                {t('foundNewProperties', { count: 3 })}
                            </p>
                            <div className="space-y-1.5">
                                {chatMessages[0].properties.map((prop, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary cursor-pointer transition-colors"
                                    >
                                        <span className="text-brand-primary">•</span>
                                        <span>{prop.rooms} {t('rooms')}, {prop.district}</span>
                                        <span className="text-brand-primary font-medium ml-auto">
                                            {prop.price}€
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Поле ввода */}
                    <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-background-tertiary px-4 py-2">
                        <span className="text-sm text-text-tertiary flex-1">
                            {typingDots || '...'}
                        </span>
                        <Send className="h-4 w-4 text-brand-primary" />
                    </div>
                </div>

                {/* Push-уведомление */}
                <div className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-error text-white text-xs font-bold animate-bounce">
                            {notifications.length}
                        </div>
                    </div>
                    <Card className="border-brand-primary py-3 shadow-lg transition-all">
                        <CardContent className="flex items-center gap-3 py-0 px-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-light shrink-0">
                                <Bell className="h-5 w-5 text-brand-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-text-primary truncate">
                                    {t('newProperty')} {currentNotification.district}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    <span className="font-medium text-brand-primary mr-2">
                                        {currentNotification.price}€
                                    </span>
                                    {t('minutesAgo', { count: currentNotification.minutes })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
