'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

const mockProperties = [
    { id: 1, price: '850€', rooms: 2, area: '65m²', district: 'Eixample' },
    { id: 2, price: '1,200€', rooms: 3, area: '90m²', district: 'Gràcia' },
    { id: 3, price: '950€', rooms: 2, area: '70m²', district: 'Sant Martí' },
    { id: 4, price: '750€', rooms: 1, area: '45m²', district: 'Sants' },
    { id: 5, price: '1,100€', rooms: 3, area: '85m²', district: 'Horta' },
];

export function RealtimeDemo() {
    const [visibleCards, setVisibleCards] = useState<number[]>([]);

    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];

        mockProperties.forEach((property, index) => {
            const timeout = setTimeout(() => {
                setVisibleCards((prev) => [...prev, property.id]);
            }, (index + 1) * 800);
            timeouts.push(timeout);
        });

        const resetTimeout = setTimeout(() => {
            setVisibleCards([]);
            // Restart animation
            mockProperties.forEach((property, index) => {
                const timeout = setTimeout(() => {
                    setVisibleCards((prev) => [...prev, property.id]);
                }, (index + 1) * 800);
                timeouts.push(timeout);
            });
        }, 6000);
        timeouts.push(resetTimeout);

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-6">
            <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-success" />
                <span className="text-sm font-medium text-text-secondary">
                    Агент ищет...
                </span>
            </div>

            <div className="grid gap-3">
                {mockProperties.map((property) => (
                    <div
                        key={property.id}
                        className={`transform transition-all duration-500 ${
                            visibleCards.includes(property.id)
                                ? 'translate-x-0 opacity-100'
                                : 'translate-x-8 opacity-0'
                        }`}
                    >
                        <Card className="border-border py-3">
                            <CardContent className="flex items-center justify-between py-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-background-tertiary" />
                                    <div>
                                        <p className="font-semibold text-text-primary">
                                            {property.price}/мес
                                        </p>
                                        <p className="text-sm text-text-secondary">
                                            {property.district}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="secondary">
                                        {property.rooms} комн.
                                    </Badge>
                                    <Badge variant="secondary">
                                        {property.area}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
