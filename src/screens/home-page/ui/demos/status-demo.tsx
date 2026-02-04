'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { EyeOff, Heart, X, Layers, ThumbsUp, ThumbsDown } from 'lucide-react';

// Статусы фильтрации
const getStatusFilters = (t: ReturnType<typeof useTranslations>) => [
    { id: 'all', labelKey: 'all', icon: Layers, count: 45 },
    { id: 'new', labelKey: 'notViewed', icon: EyeOff, count: 12 },
    { id: 'liked', labelKey: 'liked', icon: Heart, count: 8 },
    { id: 'disliked', labelKey: 'rejected', icon: X, count: 25 },
];

// Моковые объекты
const mockProperties = [
    { id: 1, status: 'new', price: 850, district: 'Eixample', rooms: 2 },
    { id: 2, status: 'liked', price: 920, district: 'Gràcia', rooms: 3 },
    { id: 3, status: 'new', price: 780, district: 'Sants', rooms: 1 },
    { id: 4, status: 'disliked', price: 1100, district: 'Sarrià', rooms: 4 },
    { id: 5, status: 'liked', price: 950, district: 'Poblenou', rooms: 2 },
];

export function StatusDemo() {
    const t = useTranslations('landing.demo');
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    const statusFilters = getStatusFilters(t);

    const filteredProperties =
        activeFilter === 'all'
            ? mockProperties
            : mockProperties.filter((p) => p.status === activeFilter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-info/10 text-info border-info/20';
            case 'liked':
                return 'bg-success/10 text-success border-success/20';
            case 'disliked':
                return 'bg-error/10 text-error border-error/20';
            default:
                return 'bg-background-tertiary text-text-secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'new':
                return <EyeOff className="h-3 w-3" />;
            case 'liked':
                return <Heart className="h-3 w-3 fill-current" />;
            case 'disliked':
                return <X className="h-3 w-3" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new':
                return t('new');
            case 'liked':
                return t('likedStatus');
            case 'disliked':
                return t('rejectedStatus');
            default:
                return '';
        }
    };

    const getFilterLabel = (key: string) => {
        return t(key as 'all' | 'notViewed' | 'liked' | 'rejected');
    };

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-4 md:p-6">
            {/* Кнопки фильтрации */}
            <div className="mb-4 flex flex-wrap gap-2">
                {statusFilters.map(({ id, labelKey, icon: Icon, count }) => (
                    <button
                        key={id}
                        onClick={() => setActiveFilter(id)}
                        className={`flex items-center gap-2 rounded-lg px-3 md:px-4 py-2 text-sm font-medium transition-all ${
                            activeFilter === id
                                ? 'bg-brand-primary text-white shadow-md'
                                : 'bg-background text-text-secondary hover:bg-background-tertiary border border-transparent hover:border-border'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{getFilterLabel(labelKey)}</span>
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

            {/* Список объектов */}
            <div className="space-y-2">
                {filteredProperties.map((property) => (
                    <Card
                        key={property.id}
                        className={`border-border py-3 transition-all cursor-pointer ${
                            hoveredCard === property.id
                                ? 'border-brand-primary shadow-md'
                                : ''
                        }`}
                        onMouseEnter={() => setHoveredCard(property.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <CardContent className="flex items-center justify-between py-0 px-4">
                            <div className="flex items-center gap-3">
                                {/* Превью объекта */}
                                <div className="relative h-12 w-12 rounded-lg bg-gradient-to-br from-brand-primary-light to-background-tertiary shrink-0 flex items-center justify-center text-lg">
                                    🏠
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-brand-primary">
                                        {property.price}€
                                        <span className="text-text-secondary font-normal text-sm">
                                            {t('perMonth')}
                                        </span>
                                    </p>
                                    <p className="text-sm text-text-secondary truncate">
                                        {property.district} • {property.rooms} {t('rooms')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Кнопки действий при наведении */}
                                <div
                                    className={`flex gap-1 transition-opacity ${
                                        hoveredCard === property.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    }`}
                                >
                                    <button className="p-1.5 rounded-full hover:bg-success/10 text-text-secondary hover:text-success transition-colors">
                                        <ThumbsUp className="h-4 w-4" />
                                    </button>
                                    <button className="p-1.5 rounded-full hover:bg-error/10 text-text-secondary hover:text-error transition-colors">
                                        <ThumbsDown className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Статус */}
                                <div
                                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                        property.status
                                    )}`}
                                >
                                    {getStatusIcon(property.status)}
                                    <span className="hidden sm:inline">
                                        {getStatusLabel(property.status)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Счётчик результатов */}
            <div className="mt-4 flex items-center justify-center">
                <Badge variant="secondary" className="bg-background-tertiary text-text-secondary">
                    {filteredProperties.length} / {mockProperties.length}
                </Badge>
            </div>
        </div>
    );
}
