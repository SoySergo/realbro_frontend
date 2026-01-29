'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, MessageCircle, User, Settings, LogIn } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ChatNotificationBadge } from '@/shared/ui/chat-notification-badge';
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
    const [isAnimating, setIsAnimating] = useState(false);
    const prevUnreadRef = useRef(chatUnread);

    // Отслеживаем монтирование компонента для предотвращения hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Trigger animation when new messages arrive
    useEffect(() => {
        if (chatUnread > prevUnreadRef.current) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 600);
            return () => clearTimeout(timer);
        }
        prevUnreadRef.current = chatUnread;
    }, [chatUnread]);

    // Скрываем навигацию когда активен режим локации
    if (activeLocationMode) {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background-secondary border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]">
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
                    const isChatIcon = item.id === 'chat';

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
                            <div className={cn(
                                'relative',
                                isChatIcon && isAnimating && 'animate-chat-wiggle'
                            )}>
                                <Icon className={cn(
                                    'w-6 h-6',
                                    isChatIcon && isAnimating && 'animate-chat-pulse'
                                )} />
                                {/* Badge для уведомлений */}
                                {isChatIcon && isMounted && chatUnread > 0 && (
                                    <div className="absolute -top-1.5 -right-2">
                                        <ChatNotificationBadge count={chatUnread} />
                                    </div>
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
