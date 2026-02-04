'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { 
    Shield, 
    Key, 
    LogOut, 
    Trash2, 
    Loader2,
    Monitor,
    Smartphone,
    Laptop,
    Globe,
    X
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { authApi } from '@/shared/api/auth';
import { usersApi } from '@/shared/api/users';
import { getUserSessions, terminateSession } from '@/shared/api/mocks/user-profile';
import type { UserSession } from '@/entities/user';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';
import { Badge } from '@/shared/ui/badge';
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
import { cn } from '@/shared/lib/utils';

type ProfileSecurityTabProps = {
    activeSessions: number;
    onUpdate: () => void;
};

/**
 * Таб безопасности
 * Смена пароля, управление сессиями, удаление аккаунта
 */
export function ProfileSecurityTab({ activeSessions, onUpdate }: ProfileSecurityTabProps) {
    const t = useTranslations('profile');
    const tAuth = useTranslations('auth');
    const router = useRouter();
    const { logout, logoutAll } = useAuth();

    // Состояние для смены пароля
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    // Состояние для сессий
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);

    // Загрузка сессий
    useEffect(() => {
        async function loadSessions() {
            try {
                const data = await getUserSessions();
                setSessions(data);
            } catch (err) {
                console.error('Failed to load sessions:', err);
            } finally {
                setIsLoadingSessions(false);
            }
        }
        loadSessions();
    }, []);

    // Смена пароля
    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordError(t('errors.passwordMismatch'));
            return;
        }

        setIsChangingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        try {
            await authApi.changePassword({
                old_password: currentPassword,
                new_password: newPassword,
            });

            setPasswordSuccess(t('passwordChanged'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to change password:', err);
            setPasswordError(t('errorSaving'));
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Выход из сессии
    const handleTerminateSession = async (sessionId: string) => {
        setTerminatingSessionId(sessionId);
        try {
            await terminateSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            onUpdate();
        } catch (err) {
            console.error('Failed to terminate session:', err);
        } finally {
            setTerminatingSessionId(null);
        }
    };

    // Выход со всех устройств
    const handleLogoutAll = async () => {
        await logoutAll();
        router.push('/login');
    };

    // Удаление аккаунта
    const handleDeleteAccount = async () => {
        try {
            await usersApi.deleteMe();
            await logout();
            router.push('/');
        } catch (err) {
            console.error('Failed to delete account:', err);
        }
    };

    // Форматирование даты
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Иконка устройства
    const getDeviceIcon = (device: string) => {
        const deviceLower = device.toLowerCase();
        if (deviceLower.includes('iphone') || deviceLower.includes('android') || deviceLower.includes('mobile')) {
            return <Smartphone className="w-5 h-5" />;
        }
        if (deviceLower.includes('macbook') || deviceLower.includes('laptop')) {
            return <Laptop className="w-5 h-5" />;
        }
        return <Monitor className="w-5 h-5" />;
    };

    return (
        <div className="space-y-6">
            {/* Смена пароля */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        {t('changePassword')}
                    </CardTitle>
                    <CardDescription>
                        {t('passwordRequirements')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {passwordError && (
                        <Alert variant="destructive">{passwordError}</Alert>
                    )}
                    {passwordSuccess && (
                        <Alert className="bg-success/10 border-success text-success">
                            {passwordSuccess}
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">{t('newPassword')}</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        >
                            {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('changePassword')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Активные сессии */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {t('sessions.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingSessions ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg",
                                            session.isCurrent 
                                                ? "bg-brand-primary-light border border-brand-primary/20" 
                                                : "bg-background-secondary"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-text-secondary">
                                                {getDeviceIcon(session.device)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-text-primary">
                                                        {session.device}
                                                    </span>
                                                    {session.isCurrent && (
                                                        <Badge variant="primary" className="text-xs">
                                                            {t('sessions.current')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-secondary">
                                                    {session.browser}
                                                    {session.location && (
                                                        <> • <Globe className="w-3 h-3 inline" /> {session.location}</>
                                                    )}
                                                </p>
                                                <p className="text-xs text-text-tertiary">
                                                    {t('sessions.lastActive')}: {formatDate(session.lastActive)}
                                                </p>
                                            </div>
                                        </div>
                                        {!session.isCurrent && (
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleTerminateSession(session.id)}
                                                disabled={terminatingSessionId === session.id}
                                            >
                                                {terminatingSessionId === session.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <X className="w-4 h-4 text-text-secondary hover:text-error" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleLogoutAll}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {t('sessions.terminateOther')}
                            </Button>
                        </>
                    )}
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
        </div>
    );
}
