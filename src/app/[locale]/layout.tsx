import { notFound } from 'next/navigation';
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthErrorHandler, ThemeProvider, AuthProvider, WebSocketProvider, GlobalToastProvider, ComparisonBarProvider } from "@/app/providers";
import { ToastProvider } from "@/shared/ui/toast";
import { setRequestLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/shared/config/routing';
import '../globals.css';
import { SidebarWrapper as Sidebar } from '@/widgets/sidebar';
import { AppHeader } from '@/widgets/app-header';
import { AuthModals } from '@/widgets/auth-modals';
import { Toaster } from '@/shared/ui/sonner';

// Основной шрифт - Inter (чистый, профессиональный)
const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "cyrillic"],
    display: "swap",
});

// Моноширинный шрифт - JetBrains Mono (для цен, ID)
const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin", "cyrillic"],
    display: "swap",
});

import type { Viewport } from 'next';

/**
 * Viewport с поддержкой safe-area для телефонов с вырезом (notch)
 */
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
};

/**
 * Генерация статических параметров для всех поддерживаемых локалей
 */
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
    // В Next.js 15 params это Promise
    const { locale } = await params;

    // Проверяем, что локаль поддерживается
    const isValidLocale = routing.locales.some((l) => l === locale);
    if (!isValidLocale) {
        notFound();
    }

    // Устанавливаем локаль для этого запроса (для статической генерации)
    setRequestLocale(locale);

    // Загружаем переводы для локали
    const messages = await getMessages({ locale });

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages}>
                        <AuthProvider>
                            <WebSocketProvider>
                                <ToastProvider>
                                    <AuthErrorHandler />
                                    {/* Sidebar (Desktop + Mobile) */}
                                    <Sidebar />
                                    {/* AppHeader — общий хедер для десктопа (md+) */}
                                    <div className="hidden md:block">
                                        <AppHeader />
                                    </div>
                                    {children}
                                    {/* Auth Modals */}
                                    <AuthModals />
                                    {/* Comparison Floating Bar */}
                                    <ComparisonBarProvider />
                                    {/* Global Toast Notifications */}
                                    <GlobalToastProvider />
                                    {/* Sonner Toaster для пользовательских действий */}
                                    <Toaster position="top-center" closeButton richColors />
                                </ToastProvider>
                            </WebSocketProvider>
                        </AuthProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
