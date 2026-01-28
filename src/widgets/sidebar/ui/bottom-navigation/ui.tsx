'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Search, MessageCircle, User, Settings, LogIn } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { useTranslations } from 'next-intl';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { useAuth } from '@/features/auth';
import { useChatStore } from '@/features/chat-messages';
import { Link } from '@/shared/config/routing';

// Навигационные элементы для мобильного меню
const navigationItems = [
    { id: 'search', icon: Search, label: 'search', href: '/search', badge: undefined },
    { id: 'chat', icon: MessageCircle, label: 'chat', href: '/chat', badge: undefined },
    { id: 'profile', icon: User, label: 'profile', href: '/profile', badge: undefined },
    { id: 'settings', icon: Settings, label: 'settings', href: '/settings', badge: undefined },
] as const;

export function BottomNavigation() {
    const pathname = usePathname();
    const t = useTranslations('sidebar');
    const tAuth = useTranslations('auth');
    const { activeLocationMode } = useFilterStore();
    const { isAuthenticated } = useAuth();
    const chatUnread = useChatStore((s) => s.totalUnread());
    const [isMounted, setIsMounted] = useState(false);

    // Отслеживаем монтирование компонента для предотвращения hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Скрываем навигацию когда активен режим локации
    if (activeLocationMode) {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-secondary border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16 px-2">
                {navigationItems.map((item) => {
                    // Условная навигация для профиля
                    // Показываем "Войти" если не смонтировано (для SSR) или если не авторизован
                    if (item.id === 'profile' && (!isMounted || !isAuthenticated)) {
                        return (
                            <Link
                                key="login"
                                href="?modal=login"
                                className={cn(
                                    'relative flex flex-col items-center justify-center',
                                    'w-full h-full gap-1 rounded-lg transition-colors',
                                    'text-text-secondary hover:text-text-primary active:text-brand-primary'
                                )}
                            >
                                <div className="relative">
                                    <LogIn className="w-6 h-6" />
                                </div>
                                <span className="text-[11px] font-medium">
                                    {tAuth('signIn')}
                                </span>
                            </Link>
                        );
                    }

                    // Определяем активность по началу пути
                    const isActive = pathname?.includes(item.href) ?? false;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                'relative flex flex-col items-center justify-center',
                                'w-full h-full gap-1 rounded-lg transition-colors',
                                isActive
                                    ? 'text-brand-primary'
                                    : 'text-text-secondary hover:text-text-primary active:text-brand-primary'
                            )}
                        >
                            <div className="relative">
                                <Icon className="w-6 h-6" />
                                {/* Badge для уведомлений */}
                                {item.id === 'chat' && isMounted && chatUnread > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] font-bold"
                                    >
                                        {chatUnread > 9 ? '9+' : chatUnread}
                                    </Badge>
                                )}
                            </div>
                            <span className="text-[11px] font-medium">
                                {t(item.label)}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
