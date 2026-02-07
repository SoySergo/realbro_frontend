'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Plus, MapPin, Clock, Briefcase } from 'lucide-react';

// Вкладки поиска
const searchTabs = [
    {
        id: 1,
        nameKey: 'nearWork',
        icon: Briefcase,
        maxPrice: 1000,
        rooms: 2,
        results: 127,
        color: 'bg-success',
    },
    {
        id: 2,
        nameKey: 'byTransport',
        icon: Clock,
        maxPrice: 800,
        rooms: 2,
        minutes: 40,
        results: 284,
        color: 'bg-warning',
    },
    {
        id: 3,
        nameKey: 'district',
        icon: MapPin,
        maxPrice: 1200,
        rooms: 3,
        districtName: 'Eixample',
        results: 56,
        color: 'bg-info',
    },
];

export function TabsDemo() {
    const t = useTranslations('landing.demo');
    const [activeTab, setActiveTab] = useState(1);

    const getTabName = (tab: typeof searchTabs[0]) => {
        if (tab.nameKey === 'nearWork') return t('nearWork');
        if (tab.nameKey === 'byTransport') return t('byTransport', { min: tab.minutes });
        if (tab.nameKey === 'district') return t('district', { name: tab.districtName });
        return '';
    };

    const getFiltersText = (tab: typeof searchTabs[0]) => {
        return `${t('upTo')} ${tab.maxPrice}€ • ${t('minRooms', { count: tab.rooms })}`;
    };

    const activeTabData = searchTabs.find((tab) => tab.id === activeTab);

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-4 md:p-6">
            {/* Вкладки поиска */}
            <div className="flex flex-col gap-2">
                {searchTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-between rounded-xl p-4 text-left transition-all duration-300 ${
                                isActive
                                    ? 'bg-brand-primary text-white shadow-lg scale-[1.02]'
                                    : 'bg-background hover:bg-background-tertiary border border-transparent hover:border-border'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                        isActive
                                            ? 'bg-white/20'
                                            : tab.color + '/10'
                                    }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${
                                            isActive ? 'text-white' : 'text-text-primary'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <p
                                        className={`font-medium ${
                                            isActive ? 'text-white' : 'text-text-primary'
                                        }`}
                                    >
                                        {getTabName(tab)}
                                    </p>
                                    <p
                                        className={`text-sm ${
                                            isActive ? 'text-white/80' : 'text-text-secondary'
                                        }`}
                                    >
                                        {getFiltersText(tab)}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant={isActive ? 'outline' : 'secondary'}
                                className={`${
                                    isActive
                                        ? 'border-white/50 text-white bg-white/20'
                                        : 'bg-background-tertiary'
                                } transition-all`}
                            >
                                {tab.results}
                            </Badge>
                        </button>
                    );
                })}

                {/* Кнопка добавления вкладки */}
                <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors">
                    <Plus className="h-5 w-5" />
                    <span className="text-sm font-medium">
                        {t('showVariants', { count: activeTabData?.results || 0 })}
                    </span>
                </button>
            </div>

            {/* Итог по активной вкладке */}
            <div className="mt-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {activeTabData && (
                            <>
                                <activeTabData.icon className="h-5 w-5 text-brand-primary" />
                                <span className="font-medium text-text-primary">
                                    {getTabName(activeTabData)}
                                </span>
                            </>
                        )}
                    </div>
                    <Button size="sm" className="bg-brand-primary hover:bg-brand-primary-hover">
                        {t('showVariants', { count: activeTabData?.results || 0 })}
                    </Button>
                </div>
            </div>
        </div>
    );
}
