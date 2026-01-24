'use client';

import { useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

const searchTabs = [
    {
        id: 1,
        name: 'Рядом с работой',
        filters: 'до 1000€ • 2+ комн.',
        results: 12,
        active: true,
    },
    {
        id: 2,
        name: '40 мин на транспорте',
        filters: 'до 800€ • 2+ комн.',
        results: 28,
        active: false,
    },
    {
        id: 3,
        name: 'Eixample район',
        filters: 'до 1200€ • 3 комн.',
        results: 8,
        active: false,
    },
];

export function TabsDemo() {
    const [activeTab, setActiveTab] = useState(1);

    return (
        <div className="rounded-2xl border border-border bg-background-secondary p-6">
            {/* Tabs sidebar simulation */}
            <div className="flex flex-col gap-2">
                {searchTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-between rounded-xl p-4 text-left transition-all ${
                            activeTab === tab.id
                                ? 'bg-brand-primary text-white'
                                : 'bg-background hover:bg-background-tertiary'
                        }`}
                    >
                        <div>
                            <p
                                className={`font-medium ${
                                    activeTab === tab.id
                                        ? 'text-white'
                                        : 'text-text-primary'
                                }`}
                            >
                                {tab.name}
                            </p>
                            <p
                                className={`text-sm ${
                                    activeTab === tab.id
                                        ? 'text-white/80'
                                        : 'text-text-secondary'
                                }`}
                            >
                                {tab.filters}
                            </p>
                        </div>
                        <Badge
                            variant={activeTab === tab.id ? 'outline' : 'secondary'}
                            className={
                                activeTab === tab.id
                                    ? 'border-white/50 text-white'
                                    : ''
                            }
                        >
                            {tab.results}
                        </Badge>
                    </button>
                ))}
            </div>

            {/* Code block showing filter config */}
            <div className="mt-4 rounded-lg bg-background-tertiary p-4 font-mono text-sm">
                <pre className="text-text-secondary overflow-x-auto">
                    <code>{`{
  "tab": "${searchTabs.find((t) => t.id === activeTab)?.name}",
  "maxPrice": ${activeTab === 1 ? 1000 : activeTab === 2 ? 800 : 1200},
  "minRooms": ${activeTab === 3 ? 3 : 2},
  "location": ${activeTab === 1 ? '"5 km от офиса"' : activeTab === 2 ? '"40 мин транспортом"' : '"Eixample"'}
}`}</code>
                </pre>
            </div>
        </div>
    );
}
