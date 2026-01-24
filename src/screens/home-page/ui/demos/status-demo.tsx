'use client';

import { useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Eye, EyeOff, Heart, X, Layers } from 'lucide-react';

const statusFilters = [
    { id: 'all', label: 'Все', icon: Layers, count: 45 },
    { id: 'new', label: 'Не видел', icon: EyeOff, count: 12 },
    { id: 'liked', label: 'Понравились', icon: Heart, count: 8 },
    { id: 'disliked', label: 'Не подошли', icon: X, count: 25 },
] as const;

const mockProperties = [
    { id: 1, status: 'new', price: '850€', district: 'Eixample' },
    { id: 2, status: 'liked', price: '920€', district: 'Gràcia' },
    { id: 3, status: 'new', price: '780€', district: 'Sants' },
    { id: 4, status: 'disliked', price: '1100€', district: 'Sarrià' },
    { id: 5, status: 'liked', price: '950€', district: 'Poblenou' },
];

export function StatusDemo() {
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const filteredProperties =
        activeFilter === 'all'
            ? mockProperties
            : mockProperties.filter((p) => p.status === activeFilter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-info/10 text-info';
            case 'liked':
                return 'bg-success/10 text-success';
            case 'disliked':
                return 'bg-error/10 text-error';
            default:
                return 'bg-background-tertiary text-text-secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'new':
                return <EyeOff className="h-3 w-3" />;
            case 'liked':
                return <Heart className="h-3 w-3" />;
            case 'disliked':
                return <X className="h-3 w-3" />;
            default:
                return null;
        }
    };

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-6">
            {/* Filter buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
                {statusFilters.map(({ id, label, icon: Icon, count }) => (
                    <button
                        key={id}
                        onClick={() => setActiveFilter(id)}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                            activeFilter === id
                                ? 'bg-brand-primary text-white'
                                : 'bg-background text-text-secondary hover:bg-background-tertiary'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                                activeFilter === id
                                    ? 'bg-white/20'
                                    : 'bg-background-tertiary'
                            }`}
                        >
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Properties list */}
            <div className="space-y-2">
                {filteredProperties.map((property) => (
                    <Card key={property.id} className="border-border py-3">
                        <CardContent className="flex items-center justify-between py-0">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-background-tertiary" />
                                <div>
                                    <p className="font-medium text-text-primary">
                                        {property.price}/мес
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                        {property.district}
                                    </p>
                                </div>
                            </div>
                            <div
                                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                    property.status
                                )}`}
                            >
                                {getStatusIcon(property.status)}
                                {property.status === 'new' && 'Новый'}
                                {property.status === 'liked' && 'Нравится'}
                                {property.status === 'disliked' && 'Не подошёл'}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Code block */}
            <div className="mt-4 rounded-lg bg-background-tertiary p-4 font-mono text-sm">
                <pre className="text-text-secondary overflow-x-auto">
                    <code>{`{
  "filter": "${activeFilter}",
  "results": ${filteredProperties.length}
}`}</code>
                </pre>
            </div>
        </div>
    );
}
