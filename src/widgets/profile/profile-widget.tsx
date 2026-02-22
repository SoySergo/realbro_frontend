'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { AuthRequired } from '@/shared/ui/auth-required';
import { getProfilePageData } from '@/shared/api/mocks/user-profile';
import type { ProfilePageData } from '@/entities/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/shared/lib/utils';

import { ProfileGeneralTab } from './tabs/profile-general-tab';
import { ProfileSubscriptionTab } from './tabs/profile-subscription-tab';
import { ProfileNotificationsTab } from './tabs/profile-notifications-tab';
import { ProfileSecurityTab } from './tabs/profile-security-tab';
import { ProfileAppearanceTab } from './tabs/profile-appearance-tab';

/**
 * Скелетон профиля для неавторизованных пользователей
 */
function ProfileSkeleton() {
    const t = useTranslations('profile');

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
                {t('title')}
            </h1>
            {/* Скелетон табов */}
            <div className="flex gap-2 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-24 bg-background-secondary rounded-md animate-pulse" />
                ))}
            </div>
            {/* Скелетон контента */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-background-secondary animate-pulse" />
                    <div className="space-y-2 flex-1">
                        <div className="h-5 bg-background-secondary rounded animate-pulse w-48" />
                        <div className="h-4 bg-background-secondary rounded animate-pulse w-32" />
                    </div>
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-background-secondary rounded animate-pulse" />
                ))}
            </div>
            {/* Призыв к авторизации поверх скелетона */}
            <div className="mt-8">
                <AuthRequired context="profile" />
            </div>
        </div>
    );
}

/**
 * Основной виджет профиля пользователя с табами
 * Загружает данные профиля и отображает разные секции настроек
 */
export function ProfileWidget() {
    const t = useTranslations('profile');
    const { user, isAuthenticated, isInitialized, isLoading: isAuthLoading } = useAuth();

    const [profileData, setProfileData] = useState<ProfilePageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('general');

    // Загрузка данных профиля — только после инициализации auth и для авторизованных
    useEffect(() => {
        async function loadProfileData() {
            if (!isInitialized || !isAuthenticated || !user) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await getProfilePageData();
                setProfileData(data);
            } catch (err) {
                console.error('Failed to load profile data:', err);
                setError('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        }

        loadProfileData();
    }, [user, isInitialized, isAuthenticated]);

    // Обновление данных после изменений
    const refreshProfileData = async () => {
        try {
            const data = await getProfilePageData();
            setProfileData(data);
        } catch (err) {
            console.error('Failed to refresh profile data:', err);
        }
    };

    if (!isInitialized || isAuthLoading || (isAuthenticated && isLoading)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    // Не авторизован — показываем скелетон профиля с призывом к авторизации
    if (!isAuthenticated) {
        return <ProfileSkeleton />;
    }

    if (error || !profileData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary">
                <p>{error || 'Failed to load profile'}</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
                {t('title')}
            </h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Табы - горизонтальный скролл на мобильных */}
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2">
                    <TabsList className={cn(
                        "inline-flex w-auto min-w-full md:min-w-0 h-auto p-1",
                        "bg-background-secondary rounded-lg"
                    )}>
                        <TabsTrigger
                            value="general"
                            className="flex-shrink-0 px-3 py-2 text-sm"
                        >
                            {t('tabs.general')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="subscription"
                            className="flex-shrink-0 px-3 py-2 text-sm"
                        >
                            {t('tabs.subscription')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex-shrink-0 px-3 py-2 text-sm"
                        >
                            {t('tabs.notifications')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="flex-shrink-0 px-3 py-2 text-sm"
                        >
                            {t('tabs.security')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="appearance"
                            className="flex-shrink-0 px-3 py-2 text-sm"
                        >
                            {t('tabs.appearance')}
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Контент табов */}
                <div className="mt-6">
                    <TabsContent value="general" className="mt-0">
                        <ProfileGeneralTab
                            profile={profileData.profile}
                            onUpdate={refreshProfileData}
                        />
                    </TabsContent>

                    <TabsContent value="subscription" className="mt-0">
                        <ProfileSubscriptionTab
                            subscription={profileData.subscription}
                            plans={profileData.plans}
                            paymentHistory={profileData.paymentHistory}
                            paymentMethods={profileData.paymentMethods}
                            onUpdate={refreshProfileData}
                        />
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0">
                        <ProfileNotificationsTab
                            settings={profileData.profile.settings.notifications}
                            onUpdate={refreshProfileData}
                        />
                    </TabsContent>

                    <TabsContent value="security" className="mt-0">
                        <ProfileSecurityTab
                            activeSessions={profileData.activeSessions}
                            onUpdate={refreshProfileData}
                        />
                    </TabsContent>

                    <TabsContent value="appearance" className="mt-0">
                        <ProfileAppearanceTab
                            settings={profileData.profile.settings}
                            onUpdate={refreshProfileData}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
