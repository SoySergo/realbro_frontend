import { notFound } from 'next/navigation';
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthErrorHandler } from "@/components/layout/AuthErrorHandler";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '../globals.css';

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
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages}>
                        <AuthErrorHandler />
                        {children}
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
