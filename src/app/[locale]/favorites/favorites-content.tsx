'use client';

import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { AuthRequired } from '@/shared/ui/auth-required';

/**
 * Контент страницы избранного
 * Показывает заглушку для неавторизованных пользователей
 */
export function FavoritesContent() {
    const t = useTranslations('favorites');
    const { isAuthenticated, isInitialized } = useAuth();

    // Пока инициализируемся - показываем скелетон
    if (!isInitialized) {
        return (
            <div className="p-4 md:p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-background-secondary rounded w-48 mb-6" />
                    <div className="h-32 bg-background-secondary rounded mb-4" />
                    <div className="h-32 bg-background-secondary rounded" />
                </div>
            </div>
        );
    }

    // Не авторизован - показываем заглушку
    if (!isAuthenticated) {
        return <AuthRequired context="favorites" />;
    }

    // Авторизован - показываем контент избранного
    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
                {t('title')}
            </h1>

            {/* Пустое состояние - пока нет данных с бекенда */}
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-text-secondary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    {t('empty.title')}
                </h2>
                <p className="text-text-secondary max-w-sm">
                    {t('empty.description')}
                </p>
            </div>
        </div>
    );
}
