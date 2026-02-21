
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

interface FooterProps {
    className?: string;
}

export function Footer({ className }: FooterProps) {
    const t = useTranslations('footer');

    const menuItems = [
        { label: t('aboutService'), href: '/' },
        { label: t('tariffs'), href: '/tariffs' },
        { label: t('profile'), href: '/profile' },
        { label: t('mapSearch'), href: '/search/properties/map' },
        { label: t('listSearch'), href: '/search/properties/list' },
        { label: t('agenciesSearch'), href: '/search/agencies/list' },
    ];

    const supportItems = [
        { label: t('support'), href: '/support' },
        { label: t('terms'), href: '/terms' },
        { label: t('privacy'), href: '/privacy' },
        { label: t('cookies'), href: '/cookies' },
    ];

    return (
        <footer className={cn("bg-background border-t border-border pt-16 pb-8", className)}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-4 md:col-span-1">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/logo.svg"
                                alt="Realbro"
                                width={32}
                                height={32}
                                className="h-8 w-8 text-primary"
                            />
                            <span className="text-xl font-bold text-foreground">
                                Realbro
                            </span>
                        </Link>
                        <div className="text-sm text-muted-foreground mt-2 space-y-2">
                            <p>© {new Date().getFullYear()} Realbro. {t('allRightsReserved')}</p>
                            <p className="text-xs opacity-70 max-w-[250px]">{t('agreement')}</p>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Main Menu */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-foreground">{t('aboutService')}</h4>
                            <nav className="flex flex-col gap-3">
                                {menuItems.slice(0, 3).map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Search */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-foreground">{t('search')}</h4>
                            <nav className="flex flex-col gap-3">
                                {menuItems.slice(3).map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Support & Legal (No Title) */}
                        <div className="flex flex-col gap-4">
                            {/* Spacer removed to align with headers */}
                            <nav className="flex flex-col gap-3">
                                {supportItems.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
