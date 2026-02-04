'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Home, Users, Filter, StickyNote, LogIn, Lock } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Link } from '@/shared/config/routing';
import { cn } from '@/shared/lib/utils';
import type { FavoritesTab } from '@/entities/favorites/model/types';
import {
    FavoritesPropertiesTab,
    FavoritesProfessionalsTab,
    FavoritesFiltersTab,
    FavoritesNotesTab,
} from '@/features/favorites';
import {
    generateMockFavoriteProperties,
    generateMockFavoriteProfessionals,
    generateMockSavedFilters,
    generateMockNotes,
} from '@/shared/api/mocks';

/**
 * Компонент призыва к авторизации внутри таба
 */
function AuthPrompt() {
    const t = useTranslations('favorites');
    const tAuth = useTranslations('auth');

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-background-tertiary flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-text-secondary" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
                {t('authPrompt.title')}
            </h2>
            <p className="text-text-secondary mb-8 max-w-sm">
                {t('authPrompt.description')}
            </p>
            <Link href="?modal=login">
                <Button size="lg" className="gap-2">
                    <LogIn className="w-5 h-5" />
                    {tAuth('signIn')}
                </Button>
            </Link>
        </div>
    );
}

/**
 * Контент страницы избранного
 * Показывает табы для всех пользователей, но контент только для авторизованных
 */
export function FavoritesContent() {
    const t = useTranslations('favorites');
    const { isAuthenticated, isInitialized } = useAuth();
    const [activeTab, setActiveTab] = useState<FavoritesTab>('properties');

    // Моковые данные
    const favoriteProperties = useMemo(() => generateMockFavoriteProperties(6), []);
    const favoriteProfessionals = useMemo(() => generateMockFavoriteProfessionals(5), []);
    const savedFilters = useMemo(() => generateMockSavedFilters(4), []);
    const notes = useMemo(() => generateMockNotes(5), []);

    // Пока инициализируемся - показываем скелетон
    if (!isInitialized) {
        return (
            <div className="p-4 md:p-6" aria-busy="true" aria-label={t('title')}>
                <div className="animate-pulse">
                    <div className="h-8 bg-background-secondary rounded w-48 mb-6" />
                    <div className="h-10 bg-background-secondary rounded w-full max-w-md mb-6" />
                    <div className="h-32 bg-background-secondary rounded mb-4" />
                    <div className="h-32 bg-background-secondary rounded" />
                </div>
            </div>
        );
    }

    // Обработчики для профессионалов
    const handleRemoveProfessional = (id: string) => {
        console.log('Remove professional:', id);
    };

    const handleContactProfessional = (id: string) => {
        console.log('Contact professional:', id);
    };

    // Обработчики для фильтров
    const handleApplyFilter = (id: string) => {
        console.log('Apply filter:', id);
    };

    const handleDeleteFilter = (id: string) => {
        console.log('Delete filter:', id);
    };

    const handleEditFilter = (id: string) => {
        console.log('Edit filter:', id);
    };

    // Обработчики для заметок
    const handleDeleteNote = (id: string) => {
        console.log('Delete note:', id);
    };

    const handleEditNote = (id: string) => {
        console.log('Edit note:', id);
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Заголовок */}
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
                {t('title')}
            </h1>

            {/* Табы - видны всем */}
            <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as FavoritesTab)}
                className="w-full"
            >
                <TabsList className="w-full md:w-auto mb-6 grid grid-cols-4 md:flex md:flex-row gap-1 bg-background-secondary p-1 rounded-lg">
                    <TabsTrigger 
                        value="properties" 
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            "data-[state=active]:bg-background data-[state=active]:text-text-primary data-[state=active]:shadow-sm",
                            "data-[state=inactive]:text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('tabs.properties')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="professionals"
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            "data-[state=active]:bg-background data-[state=active]:text-text-primary data-[state=active]:shadow-sm",
                            "data-[state=inactive]:text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('tabs.professionals')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="filters"
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            "data-[state=active]:bg-background data-[state=active]:text-text-primary data-[state=active]:shadow-sm",
                            "data-[state=inactive]:text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('tabs.filters')}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="notes"
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            "data-[state=active]:bg-background data-[state=active]:text-text-primary data-[state=active]:shadow-sm",
                            "data-[state=inactive]:text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <StickyNote className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('tabs.notes')}</span>
                    </TabsTrigger>
                </TabsList>

                {/* Контент табов */}
                <TabsContent value="properties">
                    {isAuthenticated ? (
                        <FavoritesPropertiesTab 
                            properties={favoriteProperties}
                            isEmpty={favoriteProperties.length === 0}
                        />
                    ) : (
                        <AuthPrompt />
                    )}
                </TabsContent>

                <TabsContent value="professionals">
                    {isAuthenticated ? (
                        <FavoritesProfessionalsTab 
                            professionals={favoriteProfessionals}
                            isEmpty={favoriteProfessionals.length === 0}
                            onRemove={handleRemoveProfessional}
                            onContact={handleContactProfessional}
                        />
                    ) : (
                        <AuthPrompt />
                    )}
                </TabsContent>

                <TabsContent value="filters">
                    {isAuthenticated ? (
                        <FavoritesFiltersTab 
                            filters={savedFilters}
                            isEmpty={savedFilters.length === 0}
                            onApply={handleApplyFilter}
                            onDelete={handleDeleteFilter}
                            onEdit={handleEditFilter}
                        />
                    ) : (
                        <AuthPrompt />
                    )}
                </TabsContent>

                <TabsContent value="notes">
                    {isAuthenticated ? (
                        <FavoritesNotesTab 
                            notes={notes}
                            isEmpty={notes.length === 0}
                            onDelete={handleDeleteNote}
                            onEdit={handleEditNote}
                        />
                    ) : (
                        <AuthPrompt />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
