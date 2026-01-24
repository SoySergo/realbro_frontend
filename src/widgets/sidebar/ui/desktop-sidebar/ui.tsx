'use client';

import { useState, useRef, useEffect } from 'react';
import { useSidebarStore } from '@/widgets/sidebar/model';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { Search, MessageCircle, User, Settings, Plus, LogIn } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Separator } from '@/shared/ui/separator';
import { LanguageSwitcher } from '@/features/language-switcher';
import { ThemeSwitcher } from '@/features/theme-switcher';
import { useAuth } from '@/features/auth';
import { DesktopQueryItem } from '../desktop-query-item';
import { useTranslations } from 'next-intl';
import { Link } from '@/shared/config/routing';
import Image from 'next/image';

// Навигационные элементы
const navigationItems = [
    { id: 'search', icon: Search, labelKey: 'search', href: '/search' },
    { id: 'chat', icon: MessageCircle, labelKey: 'chat', href: '/chat', badge: 3 },
    { id: 'profile', icon: User, labelKey: 'profile', href: '/profile' },
    { id: 'settings', icon: Settings, labelKey: 'settings', href: '/settings' },
] as const;

export function DesktopSidebar() {
    const t = useTranslations('sidebar');
    const tAuth = useTranslations('auth');
    const { isAuthenticated } = useAuth();
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
    const handleAddQuery = () => {
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
        <aside
            className={cn(
                'fixed left-0 top-0 h-screen bg-background-secondary border-r border-border',
                'transition-all duration-300 ease-in-out z-60',
                isExpanded ? 'w-80' : 'w-16'
            )}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            <div className="flex flex-col h-full">
                {/* Логотип */}
                <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <Image
                            src="/logo.svg"
                            alt="RealBro"
                            width={32}
                            height={32}
                            className="w-full h-full"
                        />
                    </div>
                    {isExpanded && (
                        <span className="ml-3 font-bold text-xl text-text-primary whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                            RealBro
                        </span>
                    )}
                </div>

                {/* Поисковые запросы - карточки */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    {/* Кнопка добавления нового запроса - всегда сверху */}
                    <div className="px-2 pt-2 pb-1 shrink-0 bg-background-secondary relative z-20">
                        <button
                            onClick={handleAddQuery}
                            className={cn(
                                'w-full flex items-center gap-3 rounded-lg cursor-pointer',
                                'text-text-secondary hover:text-brand-primary hover:bg-brand-primary-light',
                                'border border-brand-primary/10 hover:border-brand-primary',
                                'transition-colors duration-150',
                                isExpanded ? 'px-3 py-3' : 'h-12 justify-center'
                            )}
                        >
                            <Plus className="w-5 h-5 shrink-0" />
                            {isExpanded && (
                                <span className="text-sm font-medium">
                                    {t('newSearch')}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Контейнер со скроллом для списка запросов */}
                    <div className="flex-1 min-h-0 relative">
                        {/* Верхний градиент */}
                        <div
                            className={cn(
                                'absolute top-0 left-0 right-0 h-8 pointer-events-none transition-opacity duration-300 z-10',
                                'bg-linear-to-b from-background-secondary to-transparent',
                                showTopFade ? 'opacity-100' : 'opacity-0'
                            )}
                        />

                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide queries-scroll-container"
                        >
                            <div className="px-2 pt-1 pb-2 space-y-1">
                                {/* Список запросов - десктопная версия */}
                                {queries.map((query) => {
                                    const isActive = activeQueryId === query.id;

                                    return (
                                        <DesktopQueryItem
                                            key={query.id}
                                            query={query}
                                            isActive={isActive}
                                            canDelete={queries.length > 1}
                                            isExpanded={isExpanded}
                                            onSelect={() => setActiveQuery(query.id)}
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
                                'bg-linear-to-t from-background-secondary to-transparent',
                                showBottomFade ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    </div>
                </div>

                {/* Нижняя навигация */}
                <div className="border-t border-border p-2 space-y-1 shrink-0">
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
                                        'text-text-secondary hover:text-text-primary hover:bg-background-tertiary',
                                        'transition-colors duration-150 relative',
                                        isExpanded ? 'px-3 py-2.5' : 'h-12 justify-center'
                                    )}
                                >
                                    <LogIn className="w-5 h-5 shrink-0" />
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
                                    'text-text-secondary hover:text-text-primary hover:bg-background-tertiary',
                                    'transition-colors duration-150 relative',
                                    isExpanded ? 'px-3 py-2.5' : 'h-12 justify-center'
                                )}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {isExpanded && (
                                    <span className="text-sm font-medium">
                                        {t(item.labelKey)}
                                    </span>
                                )}
                                {'badge' in item && item.badge && (
                                    <span
                                        className={cn(
                                            'absolute w-5 h-5 rounded-full',
                                            'bg-error text-white text-xs font-bold',
                                            'flex items-center justify-center',
                                            isExpanded ? 'top-2 right-2' : 'top-1.5 left-8'
                                        )}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Переключатели темы и языка */}
                    {isExpanded && (
                        <>
                            <Separator className="my-2" />
                            <div className="flex items-center gap-2 px-2">
                                <ThemeSwitcher />
                                <LanguageSwitcher />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
