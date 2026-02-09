'use client';

import { SidebarDemosShowcase } from '@/widgets/sidebar-demos';
import { Info } from 'lucide-react';

export default function SidebarDemoPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Хедер */}
            <div className="sticky top-0 z-40 bg-background-secondary border-b border-border">
                <div className="max-w-[1800px] mx-auto px-8 py-6">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Sidebar Variants Demo
                    </h1>
                    <p className="text-text-secondary">
                        10 вариантов сайдбара — выберите лучший UX/UI
                    </p>
                </div>
            </div>

            {/* Подсказка */}
            <div className="max-w-[1800px] mx-auto px-8 pt-6">
                <div className="bg-brand-primary-light border border-brand-primary/30 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <div>
                        <div className="font-semibold text-brand-primary mb-1">
                            Как использовать
                        </div>
                        <div className="text-sm text-text-secondary">
                            Каждый вариант — полностью рабочий сайдбар. Можно добавлять/удалять поисковые вкладки,
                            переключаться между ними, сворачивать/разворачивать. Навигация, тема и язык присутствуют в каждом.
                        </div>
                    </div>
                </div>
            </div>

            {/* Витрина всех вариантов */}
            <SidebarDemosShowcase />
        </div>
    );
}
