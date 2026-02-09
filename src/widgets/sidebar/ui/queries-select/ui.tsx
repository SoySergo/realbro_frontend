'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebarStore } from '@/widgets/sidebar/model';
import { ChevronDown, Plus, X } from 'lucide-react';
import { MobileQueryItem } from '../mobile-query-item';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth';
import { Link } from '@/shared/config/routing';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog';

type QueriesSelectProps = {
    /** Дополнительные стили для кнопки-триггера */
    triggerClassName?: string;
};

export function QueriesSelect({ triggerClassName }: QueriesSelectProps = {}) {
    const {
        queries,
        activeQueryId,
        setActiveQuery,
        addQuery,
        removeQuery,
    } = useSidebarStore();

    const [isOpen, setIsOpen] = useState(false);
    const [showLimitDialog, setShowLimitDialog] = useState(false);
    const [tabLimit, setTabLimit] = useState({ max: 1, current: 0 });
    const t = useTranslations('sidebar');
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const activeItemRef = useRef<HTMLDivElement>(null);

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

    // Автоматический скролл к активному элементу при открытии
    useEffect(() => {
        if (isOpen && activeItemRef.current) {
            // Небольшая задержка для корректной работы после рендера
            setTimeout(() => {
                activeItemRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
        }
    }, [isOpen]);

    // Обработчик добавления нового запроса
    const handleAddQuery = async () => {
        // Проверка авторизации
        if (!isAuthenticated) {
            router.push(`${pathname}?modal=login`);
            return;
        }

        // Проверка лимита вкладок
        try {
            const res = await fetch('/api/subscription/check');
            if (res.ok) {
                const data = await res.json();

                if (!data.allowed) {
                    setTabLimit({ max: data.maxCount, current: data.currentCount });
                    setShowLimitDialog(true);
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to check subscription limit', error);
        }

        // Создание вкладки
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
            {/* Кнопка dropdown для выбора подборки */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-tertiary transition-colors",
                    triggerClassName
                )}
            >
                <span className="text-sm font-medium truncate">
                    {activeQuery?.title || t('selectSearch')}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-text-secondary" />
            </button>

            {/* Полноэкранный оверлей */}
            {isOpen && (
                <div className="fixed inset-0 bg-background" style={{ zIndex: 100 }}>
                    {/* Заголовок с кнопкой закрытия */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-primary/10 to-transparent border-b border-transparent" style={{ borderImage: 'linear-gradient(to right, hsl(var(--brand-primary) / 0.3), transparent) 1' }}>
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
                    {/* Высота: 100vh - (заголовок 56px + кнопка Add с padding ~76px + bottom nav 64px) */}
                    <div
                        className="overflow-y-auto overflow-x-hidden"
                        style={{ height: 'calc(100vh - 56px - 76px - 64px)' }}
                    >
                        <div className="p-4 space-y-2">
                            {queries.map((query) => {
                                const isActive = activeQueryId === query.id;
                                return (
                                    <MobileQueryItem
                                        key={query.id}
                                        ref={isActive ? activeItemRef : null}
                                        query={query}
                                        isActive={isActive}
                                        canDelete={queries.length > 1}
                                        onSelect={() => handleSelectQuery(query.id)}
                                        onDelete={() => removeQuery(query.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Кнопка добавления нового запроса - всегда зафиксирована внизу над bottom nav */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 pt-2 pb-3 bg-background border-t border-transparent" style={{ borderImage: 'linear-gradient(to right, hsl(var(--brand-primary) / 0.3), transparent) 1' }}>
                        <button
                            onClick={handleAddQuery}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white active:opacity-90 transition-all duration-150"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-base font-medium">{t('newSearch')}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Диалог лимита вкладок */}
            <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('tabLimit')}</DialogTitle>
                        <DialogDescription>
                            {t('tabLimitDescription', { max: tabLimit.max })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover transition-colors"
                            onClick={() => setShowLimitDialog(false)}
                        >
                            {t('upgradePlan')}
                        </Link>
                        <button
                            onClick={() => setShowLimitDialog(false)}
                            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-background-tertiary transition-colors"
                        >
                            {t('editTab')}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
