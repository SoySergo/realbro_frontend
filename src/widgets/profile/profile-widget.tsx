'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useAuth, useRequireAuth } from '@/features/auth';
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
 * Основной виджет профиля пользователя с табами
 * Загружает данные профиля и отображает разные секции настроек
 */
export function ProfileWidget() {
    const t = useTranslations('profile');
    const { user } = useAuth();
    const { isLoading: isAuthLoading } = useRequireAuth();

    const [profileData, setProfileData] = useState<ProfilePageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('general');

    // Загрузка данных профиля
    useEffect(() => {
        async function loadProfileData() {
            if (!user) return;

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
    }, [user]);

    // Обновление данных после изменений
    const refreshProfileData = async () => {
        try {
            const data = await getProfilePageData();
            setProfileData(data);
        } catch (err) {
            console.error('Failed to refresh profile data:', err);
        }
    };

    if (isAuthLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
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
