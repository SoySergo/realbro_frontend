'use client';

import { useState, useRef, useEffect } from 'react';
import { useSidebarStore, DEFAULT_SEARCH_QUERY_ID } from '@/widgets/sidebar/model';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { MessageCircle, User, Heart, Plus, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { LanguageSwitcher } from '@/features/language-switcher';
import { ThemeSwitcher } from '@/features/theme-switcher';
import { useAuth } from '@/features/auth';
import { useChatStore } from '@/features/chat-messages';
import { DesktopQueryItem } from '../desktop-query-item';
import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/shared/config/routing';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog';

// Навигационные элементы (без поиска — он в дефолтной вкладке)
const navigationItems = [
    { id: 'favorites', icon: Heart, labelKey: 'favorites', href: '/favorites' },
    { id: 'chat', icon: MessageCircle, labelKey: 'chat', href: '/chat' },
    { id: 'profile', icon: User, labelKey: 'profile', href: '/profile' },
] as const;

export function DesktopSidebar() {
    const t = useTranslations('sidebar');
    const tAuth = useTranslations('auth');
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showLimitDialog, setShowLimitDialog] = useState(false);
    const [tabLimit, setTabLimit] = useState({ max: 1, current: 0 });
    const chatUnread = useChatStore((s) => s.totalUnread());
    const [isMounted, setIsMounted] = useState(false);
    const {
        isExpanded,
        setExpanded,
        queries,
        activeQueryId,
        setActiveQuery,
        addQuery,
        removeQuery,
    } = useSidebarStore();

    const {
        loadFiltersFromQuery,
        syncWithQuery,
        setActiveQueryId,
        activeQueryId: filterActiveQueryId,
    } = useFilterStore();

    const [showTopFade, setShowTopFade] = useState(false);
    const [showBottomFade, setShowBottomFade] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const previousQueriesLengthRef = useRef(queries.length);

    // Отслеживаем монтирование компонента для предотвращения hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Синхронизация фильтров при смене активной вкладки
    useEffect(() => {
        if (activeQueryId && activeQueryId !== filterActiveQueryId) {
            // Сохраняем фильтры из предыдущей вкладки
            if (filterActiveQueryId) {
                syncWithQuery(filterActiveQueryId);
                console.log('[SYNC] Saved filters from previous tab:', filterActiveQueryId);
            }

            // Загружаем фильтры новой вкладки
            const query = queries.find((q) => q.id === activeQueryId);
            if (query) {
                loadFiltersFromQuery(query.filters);
                setActiveQueryId(activeQueryId);
                console.log('[SYNC] Loaded filters for new tab:', activeQueryId);
            }
        }
    }, [activeQueryId, filterActiveQueryId, syncWithQuery, loadFiltersFromQuery, setActiveQueryId, queries]);

    // Инициализация при первом монтировании
    useEffect(() => {
        // При монтировании загружаем фильтры активной вкладки
        if (activeQueryId && !filterActiveQueryId) {
            const query = queries.find((q) => q.id === activeQueryId);
            if (query) {
                loadFiltersFromQuery(query.filters);
                setActiveQueryId(activeQueryId);
                console.log('[SYNC] Initialized filters from active tab:', activeQueryId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Автоматический скролл вверх при добавлении нового элемента
    useEffect(() => {
        if (queries.length > previousQueriesLengthRef.current) {
            // Новый элемент добавлен
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
            }
        }
        previousQueriesLengthRef.current = queries.length;
    }, [queries.length]);

    // Обработчик скролла для индикаторов затемнения
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const scrollTop = target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;

        setShowTopFade(scrollTop > 10);
        setShowBottomFade(scrollTop + clientHeight < scrollHeight - 10);
    };

    // Проверка индикаторов при изменении списка
    useEffect(() => {
        if (scrollContainerRef.current) {
            const target = scrollContainerRef.current;
            const scrollTop = target.scrollTop;
            const scrollHeight = target.scrollHeight;
            const clientHeight = target.clientHeight;

            setShowTopFade(scrollTop > 10);
            setShowBottomFade(scrollTop + clientHeight < scrollHeight - 10);
        }
    }, [queries.length, isExpanded]);

    // Обработчик добавления нового запроса с имитацией загрузки
    const handleAddQuery = async () => {
        // Проверка авторизации
        if (!isAuthenticated) {
            router.push(`${pathname ?? '/search'}?modal=login`);
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

        // Создаем запрос с флагом загрузки
        addQuery({
            title,
            filters: {},
            isLoading: true,
        });

        // Имитация загрузки данных (100-200 мс)
        const loadingTime = Math.random() * 100 + 200;
        setTimeout(() => {
            // Получаем актуальное состояние из store
            const currentQueries = useSidebarStore.getState().queries;
            const query = currentQueries.find(q => q.title === title && q.isLoading);

            if (query) {
                const resultsCount = Math.floor(Math.random() * 9900) + 100;
                const newResultsCount = 0;

                // Обновляем запрос с реальными данными
                useSidebarStore.getState().updateQuery(query.id, {
                    resultsCount,
                    newResultsCount,
                    isLoading: false,
                });
            }
        }, loadingTime);
    };

    return (
        <>
        <aside
            className={cn(
                'fixed left-0 top-0 h-screen bg-background border-r border-border',
                'transition-all duration-300 ease-in-out z-60',
                isExpanded ? 'w-72' : 'w-14'
            )}
        >
            {/* Кнопка переключения сайдбара */}
            <button
                onClick={() => setExpanded(!isExpanded)}
                className={cn(
                    'absolute top-5 -right-3 z-10 w-6 h-6',
                    'flex items-center justify-center rounded-full',
                    'bg-background border border-border shadow-sm',
                    'text-text-secondary hover:text-brand-primary hover:border-brand-primary',
                    'transition-colors duration-150 cursor-pointer'
                )}
                aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isExpanded ? (
                    <ChevronLeft className="w-3.5 h-3.5" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                )}
            </button>

            <div className="flex flex-col h-full">
                {/* Логотип с градиентным фоном */}
                <div className="px-4 py-4 shrink-0 bg-gradient-to-r from-brand-primary/10 to-transparent">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.svg"
                            alt="RealBro"
                            width={28}
                            height={28}
                            className="shrink-0"
                        />
                        {isExpanded && (
                            <span className="font-bold text-xl text-text-primary whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                                RealBro
                            </span>
                        )}
                    </div>
                </div>

                {/* Градиентный разделитель */}
                <div className="h-px bg-gradient-to-r from-brand-primary/30 via-brand-primary/10 to-transparent" />

                {/* Поисковые запросы */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    {/* Заголовок секции поиска и кнопка добавления */}
                    <div className="px-3 pt-3 pb-1 shrink-0 bg-background relative z-20">
                        {isExpanded ? (
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-text-secondary">
                                    {t('search')}
                                </span>
                                <button
                                    onClick={handleAddQuery}
                                    className={cn(
                                        'p-1 rounded-md cursor-pointer',
                                        'text-brand-primary hover:bg-brand-primary/10 transition-colors duration-150'
                                    )}
                                    aria-label={t('newSearch')}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleAddQuery}
                                className={cn(
                                    'w-full flex items-center justify-center p-2 rounded-lg cursor-pointer',
                                    'text-brand-primary hover:bg-brand-primary/10 transition-colors duration-150'
                                )}
                                aria-label={t('newSearch')}
                            >
                                <Plus className="w-[18px] h-[18px] shrink-0" />
                            </button>
                        )}
                    </div>

                    {/* Контейнер со скроллом для списка запросов */}
                    <div className="flex-1 min-h-0 relative">
                        {/* Верхний градиент */}
                        <div
                            className={cn(
                                'absolute top-0 left-0 right-0 h-8 pointer-events-none transition-opacity duration-300 z-10',
                                'bg-linear-to-b from-background to-transparent',
                                showTopFade ? 'opacity-100' : 'opacity-0'
                            )}
                        />

                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide queries-scroll-container"
                        >
                            <div className={cn('px-3 pt-1 pb-2', isExpanded ? 'space-y-1.5' : 'space-y-1 flex flex-col items-center')}>
                                {/* Список запросов - десктопная версия */}
                                {queries.map((query) => {
                                    const isActive = activeQueryId === query.id;
                                    const isDefaultQuery = query.id === DEFAULT_SEARCH_QUERY_ID;

                                    return (
                                        <DesktopQueryItem
                                            key={query.id}
                                            query={isDefaultQuery && !query.title ? { ...query, title: t('search') } : query}
                                            isActive={isActive}
                                            canDelete={!isDefaultQuery}
                                            isExpanded={isExpanded}
                                            onSelect={() => {
                                                setActiveQuery(query.id);
                                                // Навигация на страницу поиска если мы не на ней
                                                if (!pathname?.includes('/search')) {
                                                    router.push('/search/properties/map');
                                                }
                                            }}
                                            onDelete={() => removeQuery(query.id)}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Нижний градиент */}
                        <div
                            className={cn(
                                'absolute bottom-0 left-0 right-0 h-8 pointer-events-none transition-opacity duration-300 z-10',
                                'bg-linear-to-t from-background to-transparent',
                                showBottomFade ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    </div>
                </div>

                {/* Градиентный разделитель */}
                <div className="h-px bg-gradient-to-r from-brand-primary/30 via-brand-primary/10 to-transparent" />

                {/* Нижняя навигация */}
                <div className="px-3 py-2 space-y-0.5 shrink-0">
                    {navigationItems.map((item) => {
                        // Условная навигация для профиля
                        // Показываем "Войти" если не смонтировано (для SSR) или если не авторизован
                        if (item.id === 'profile' && (!isMounted || !isAuthenticated)) {
                            return (
                                <Link
                                    key="login"
                                    href="?modal=login"
                                    className={cn(
                                        'w-full flex items-center gap-3 rounded-lg cursor-pointer',
                                        'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                                        'transition-colors duration-150 relative',
                                        isExpanded ? 'px-3 py-2' : 'justify-center py-2'
                                    )}
                                >
                                    <LogIn className="w-[18px] h-[18px] shrink-0" />
                                    {isExpanded && (
                                        <span className="text-sm font-medium">
                                            {tAuth('signIn')}
                                        </span>
                                    )}
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    'w-full flex items-center gap-3 rounded-lg cursor-pointer',
                                    'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                                    'transition-colors duration-150 relative focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2',
                                    isExpanded ? 'px-3 py-2' : 'justify-center py-2'
                                )}
                            >
                                <item.icon className="w-[18px] h-[18px] shrink-0" />
                                {isExpanded && (
                                    <span className="text-sm font-medium">
                                        {t(item.labelKey)}
                                    </span>
                                )}
                                {item.id === 'chat' && isMounted && chatUnread > 0 && (
                                    <span
                                        className={cn(
                                            'absolute w-4 h-4 rounded-full',
                                            'bg-gradient-to-r from-brand-primary to-brand-primary/70 text-white text-[10px] font-bold',
                                            'flex items-center justify-center',
                                            isExpanded ? 'top-1.5 right-2' : 'top-0.5 right-0.5'
                                        )}
                                    >
                                        {chatUnread > 9 ? '9+' : chatUnread}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Переключатели темы и языка — видны всегда (как в demo-7) */}
                    <div className="h-px bg-gradient-to-r from-brand-primary/20 via-brand-primary/5 to-transparent my-1.5" />
                    <div className={cn(
                        'flex gap-2 justify-center',
                        isExpanded ? 'flex-row items-center px-2' : 'flex-col items-center'
                    )}>
                        <ThemeSwitcher />
                        <LanguageSwitcher />
                        {isExpanded && !isMounted ? null : isExpanded && !isAuthenticated && (
                            <Link
                                href="?modal=login"
                                className="ml-auto text-xs text-brand-primary font-medium hover:underline"
                            >
                                {tAuth('signIn')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </aside>

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
