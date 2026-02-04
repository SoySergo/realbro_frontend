'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Save, Loader2, User, BarChart3 } from 'lucide-react';
import { usersApi } from '@/shared/api/users';
import { UserAvatar } from '@/entities/user';
import type { ExtendedUserProfile } from '@/entities/user';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';
import { cn } from '@/shared/lib/utils';

type ProfileGeneralTabProps = {
    profile: ExtendedUserProfile;
    onUpdate: () => void;
};

/**
 * Таб общей информации профиля
 * Отображает и позволяет редактировать основные данные пользователя
 */
export function ProfileGeneralTab({ profile, onUpdate }: ProfileGeneralTabProps) {
    const t = useTranslations('profile');
    const tCommon = useTranslations('common');

    const [displayName, setDisplayName] = useState(profile.settings.display_name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Форматирование даты регистрации
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Сохранение изменений
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await usersApi.updateMe({
                settings: {
                    display_name: displayName || undefined,
                },
            });

            setSuccess(t('saved'));
            onUpdate();

            // Скрыть сообщение через 3 секунды
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setError(t('errorSaving'));
        } finally {
            setIsSaving(false);
        }
    };

    // Проверка на наличие изменений
    const hasChanges = displayName !== (profile.settings.display_name || '');

    return (
        <div className="space-y-6">
            {/* Сообщения об ошибках/успехе */}
            {error && (
                <Alert variant="destructive">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert className="bg-success/10 border-success text-success">
                    {success}
                </Alert>
            )}

            {/* Личная информация */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t('personalInfo')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Аватар и базовая информация */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <UserAvatar
                            email={profile.email}
                            displayName={displayName}
                            size="lg"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">
                                {displayName || profile.email.split('@')[0]}
                            </p>
                            <p className="text-sm text-text-secondary truncate">
                                {profile.email}
                            </p>
                            <p className="text-xs text-text-tertiary mt-1">
                                {t('memberSince')} {formatDate(profile.created_at)}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Форма редактирования */}
                    <div className="grid gap-4 sm:grid-cols-2">
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
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input 
                                id="email"
                                value={profile.email} 
                                disabled 
                                className="bg-background-secondary"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Статистика аккаунта */}
            {profile.stats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            {t('accountStats')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <StatCard
                                label={t('savedProperties')}
                                value={profile.stats.savedProperties}
                            />
                            <StatCard
                                label={t('savedSearches')}
                                value={profile.stats.savedSearches}
                            />
                            <StatCard
                                label={t('viewedProperties')}
                                value={profile.stats.viewedProperties}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Кнопка сохранения */}
            {hasChanges && (
                <div className="flex justify-end sticky bottom-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="shadow-lg"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {t('saveChanges')}
                    </Button>
                </div>
            )}
        </div>
    );
}

// Компонент карточки статистики
function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className={cn(
            "text-center p-4 rounded-lg",
            "bg-background-secondary border border-border"
        )}>
            <p className="text-2xl font-bold text-text-primary">
                {value}
            </p>
            <p className="text-xs text-text-secondary mt-1">
                {label}
            </p>
        </div>
    );
}
