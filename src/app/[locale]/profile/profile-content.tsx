'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Trash2, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { UserAvatar } from '@/entities/user';
import { usersApi } from '@/shared/api/users';
import { authApi } from '@/shared/api/auth';
import type { UserResponse } from '@/entities/user';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { AuthRequired } from '@/shared/ui/auth-required';

export function ProfileContent() {
    const t = useTranslations('profile');
    const tAuth = useTranslations('auth');
    const router = useRouter();
    const { user, logout, logoutAll, isAuthenticated, isInitialized } = useAuth();

    const [profile, setProfile] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeSessions, setActiveSessions] = useState<number>(0);

    // Форма настроек
    const [displayName, setDisplayName] = useState('');
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);

    // Загрузка профиля
    useEffect(() => {
        async function loadProfile() {
            if (!user) return;

            try {
                setIsLoading(true);
                const [profileData, sessionsData] = await Promise.all([
                    usersApi.getMe(),
                    authApi.getSessions(),
                ]);

                setProfile(profileData);
                setActiveSessions(sessionsData.active_sessions);

                // Заполняем форму
                setDisplayName(profileData.settings?.display_name || '');
                setEmailNotifications(
                    profileData.settings?.notifications_email || false
                );
                setPushNotifications(
                    profileData.settings?.notifications_push || false
                );
            } catch (err) {
                console.error('Failed to load profile:', err);
                setError('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        }

        loadProfile();
    }, [user]);

    // Сохранение настроек
    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedProfile = await usersApi.updateMe({
                settings: {
                    display_name: displayName || undefined,
                    notifications_email: emailNotifications,
                    notifications_push: pushNotifications,
                },
            });

            setProfile(updatedProfile);
            setSuccess(t('saved'));

            // Скрыть сообщение через 3 секунды
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setError('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    // Выход
    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Выход со всех устройств
    const handleLogoutAll = async () => {
        await logoutAll();
        router.push('/login');
    };

    // Удаление аккаунта
    const handleDeleteAccount = async () => {
        if (!user) return;

        try {
            await usersApi.deleteMe();
            await logout();
            router.push('/');
        } catch (err) {
            console.error('Failed to delete account:', err);
            setError('Failed to delete account');
        }
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    // Не авторизован - показываем заглушку
    if (!isAuthenticated) {
        return <AuthRequired context="profile" />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">
                {t('title')}
            </h1>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert className="mb-4 bg-success/10 border-success text-success">
                    {success}
                </Alert>
            )}

            <div className="space-y-6">
                {/* Основная информация */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {t('personalInfo')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <UserAvatar
                                email={user?.email}
                                displayName={displayName}
                                size="lg"
                            />
                            <div>
                                <p className="font-medium text-text-primary">
                                    {displayName || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">
                                {t('displayName')}
                            </Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder={t('displayNamePlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('email')}</Label>
                            <Input value={user?.email || ''} disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Уведомления */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {t('notifications')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-text-primary">
                                {t('emailNotifications')}
                            </span>
                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(e) =>
                                    setEmailNotifications(e.target.checked)
                                }
                                className="w-5 h-5 rounded border-border text-brand-primary focus:ring-brand-primary"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-text-primary">
                                {t('pushNotifications')}
                            </span>
                            <input
                                type="checkbox"
                                checked={pushNotifications}
                                onChange={(e) =>
                                    setPushNotifications(e.target.checked)
                                }
                                className="w-5 h-5 rounded border-border text-brand-primary focus:ring-brand-primary"
                            />
                        </label>
                    </CardContent>
                </Card>

                {/* Безопасность */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            {t('security')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-primary">
                                    {t('activeSessions')}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {activeSessions}{' '}
                                    {activeSessions === 1
                                        ? 'session'
                                        : 'sessions'}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogoutAll}
                            >
                                {t('logoutAll')}
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {tAuth('signOut')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Опасная зона */}
                <Card className="border-error/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-error">
                            {t('dangerZone')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-text-secondary mb-4">
                            {t('deleteAccountWarning')}
                        </p>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('deleteAccount')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {t('confirmDeleteTitle')}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('confirmDeleteDescription')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        {t('cancel')}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        className="bg-error hover:bg-error/90"
                                    >
                                        {t('confirmDelete')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* Кнопка сохранения */}
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {t('saveChanges')}
                </Button>
            </div>
        </div>
    );
}
