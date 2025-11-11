'use client';

import { useState, useEffect } from 'react';
import { useSidebarStore } from '@/store/sidebarStore';
import { ChevronDown, Plus, X } from 'lucide-react';
import { QueryItem } from './QueryItem';
import { useTranslations } from 'next-intl';

export function QueriesSelect() {
    const {
        queries,
        activeQueryId,
        setActiveQuery,
        addQuery,
        removeQuery,
    } = useSidebarStore();

    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('sidebar');

    // Получаем активный query
    const activeQuery = queries.find(q => q.id === activeQueryId) || queries[0];

    // Блокировка прокрутки страницы при открытом меню
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Обработчик добавления нового запроса
    const handleAddQuery = () => {
        const currentLength = queries.length;
        const title = `${t('search')} ${currentLength + 1}`;

        addQuery({
            title,
            filters: {},
            isLoading: true,
        });

        // Имитация загрузки данных
        const loadingTime = Math.random() * 100 + 200;
        setTimeout(() => {
            const currentQueries = useSidebarStore.getState().queries;
            const query = currentQueries.find(q => q.title === title && q.isLoading);

            if (query) {
                const resultsCount = Math.floor(Math.random() * 9900) + 100;
                const newResultsCount = 0;

                useSidebarStore.getState().updateQuery(query.id, {
                    resultsCount,
                    newResultsCount,
                    isLoading: false,
                });
            }
        }, loadingTime);

        setIsOpen(false);
    };

    // Обработчик выбора query
    const handleSelectQuery = (queryId: string) => {
        setActiveQuery(queryId);
        setIsOpen(false);
    };

    return (
        <>
            {/* Простая кнопка с заголовком */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-tertiary transition-colors"
            >
                <span className="text-sm font-medium truncate">
                    {activeQuery?.title || t('selectSearch')}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-text-secondary" />
            </button>

            {/* Полноэкранный оверлей */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-background">
                    {/* Заголовок с кнопкой закрытия */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h2 className="text-lg font-semibold">{t('selectSearch')}</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
                            aria-label={t('close')}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Список queries с прокруткой */}
                    <div className="overflow-y-auto" style={{ height: 'calc(100vh - 56px - 64px - 80px)' }}>
                        <div className="p-4 space-y-2">
                            {queries.map((query) => (
                                <QueryItem
                                    key={query.id}
                                    query={query}
                                    isActive={activeQueryId === query.id}
                                    canDelete={queries.length > 1}
                                    variant="full"
                                    onSelect={() => handleSelectQuery(query.id)}
                                    onDelete={() => removeQuery(query.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Кнопка добавления нового запроса - зафиксирована внизу */}
                    <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border">
                        <button
                            onClick={handleAddQuery}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors duration-150"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-base font-medium">{t('newSearch')}</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
