'use client';

import Image from 'next/image';
import { Search, MessageCircle, Heart, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Link, usePathname } from '@/shared/config/routing';
import { ThemeSwitcher } from '@/features/theme-switcher';
import { LanguageSwitcher } from '@/features/language-switcher';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { useTranslations } from 'next-intl';

const navItems = [
    { id: 'search', icon: Search, labelKey: 'search', href: '/search' },
    { id: 'chat', icon: MessageCircle, labelKey: 'chat', href: '/chat' },
    { id: 'favorites', icon: Heart, labelKey: 'favorites', href: '/favorites' },
    { id: 'profile', icon: User, labelKey: 'profile', href: '/profile' },
] as const;

/**
 * SearchPageHeader — горизонтальный хедер для страницы поиска.
 *
 * Отображается только для экранов >= 900px (tailwind: hidden slug-desktop:flex).
 * - 900–1300px (slug-desktop до slug-wide): только иконки с тултипами, без текста
 * - > 1300px (slug-wide): иконки + текстовые подписи
 */
interface SearchPageHeaderProps {
    floating?: boolean;
}

export function SearchPageHeader({ floating = false }: SearchPageHeaderProps) {
    const t = useTranslations('sidebar');
    const pathname = usePathname();

    return (
        <TooltipProvider delayDuration={200}>
            <header
                className={cn(
                    'flex h-[52px] items-center justify-between',
                    'bg-background',
                    floating && 'rounded-[9px]',
                    'px-3'
                )}
            >
                {/* Левая часть — лого */}
                <Link href="/" className="flex items-center gap-2 shrink-0 px-2">
                    <Image
                        src="/Logo keys.svg"
                        alt="RealBro"
                        width={28}
                        height={28}
                        className="shrink-0 w-7 h-7"
                    />
                    <span className="hidden slug-wide:inline font-bold text-lg text-text-primary whitespace-nowrap">
                        RealBro
                    </span>
                </Link>

                {/* Центральная навигация */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname?.startsWith(item.href);
                        const label = t(item.labelKey);

                        return (
                            <Tooltip key={item.id}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150',
                                            'text-text-secondary hover:text-brand-primary hover:bg-background-secondary',
                                            isActive && 'text-brand-primary bg-brand-primary/10'
                                        )}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        <span className="hidden slug-wide:inline text-sm font-medium whitespace-nowrap">
                                            {label}
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                {/* Тултип только в compact-режиме (до 1300px) */}
                                <TooltipContent className="slug-wide:hidden">
                                    {label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </nav>

                {/* Правая часть — тема, язык */}
                <div className="flex items-center gap-1 shrink-0">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
            </header>
        </TooltipProvider>
    );
}
