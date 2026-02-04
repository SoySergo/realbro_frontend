'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, MessageCircle, User, Heart } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ChatNotificationBadge } from '@/shared/ui/chat-notification-badge';
import { useTranslations } from 'next-intl';
import { useFilterStore } from '@/widgets/search-filters-bar';
import { useChatStore, useChatUIStore } from '@/features/chat-messages';
import { Link } from '@/shared/config/routing';

/**
 * Навигационные элементы для мобильного меню
 * Меню не зависит от авторизации - кнопки всегда одинаковые
 * Проверка авторизации происходит на самих страницах
 */
const navigationItems = [
    { id: 'search', icon: Search, label: 'search', href: '/search' },
    { id: 'favorites', icon: Heart, label: 'favorites', href: '/favorites' },
    { id: 'chat', icon: MessageCircle, label: 'chat', href: '/chat' },
    { id: 'profile', icon: User, label: 'profile', href: '/profile' },
] as const;

/**
 * Пути, на которых мобильная навигация должна быть скрыта
 * Например: детальная страница объекта, открытый диалог чата
 */
const HIDDEN_NAVIGATION_PATTERNS = [
    /\/search\/property\/[^/]+$/, // /[locale]/search/property/[id]
    /\/property\/[^/]+$/,          // /[locale]/property/[id]
];

/**
 * Проверяет, нужно ли скрывать навигацию на текущей странице
 */
function shouldHideNavigation(pathname: string | null): boolean {
    if (!pathname) return false;
    return HIDDEN_NAVIGATION_PATTERNS.some(pattern => pattern.test(pathname));
}

export function BottomNavigation() {
    const pathname = usePathname();
    const t = useTranslations('sidebar');
    const { activeLocationMode } = useFilterStore();
    const chatUnread = useChatStore((s) => s.totalUnread());
    const isChatOpen = useChatUIStore((s) => s.isChatOpen);
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

    // Скрываем навигацию когда:
    // 1. Активен режим локации (рисование на карте)
    // 2. Открыт диалог чата
    // 3. На определённых страницах (property detail и т.д.)
    if (activeLocationMode || isChatOpen || shouldHideNavigation(pathname)) {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background-secondary border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16 px-2">
                {navigationItems.map((item) => {
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
                                {/* Badge для уведомлений чата */}
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
