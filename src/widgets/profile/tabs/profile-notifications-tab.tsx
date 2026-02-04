'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Mail, Smartphone, MessageCircle, Save, Loader2 } from 'lucide-react';
import type { NotificationSettings } from '@/entities/user';
import { updateNotificationSettings } from '@/shared/api/mocks/user-profile';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import { Alert } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';
import { cn } from '@/shared/lib/utils';

type ProfileNotificationsTabProps = {
    settings: NotificationSettings;
    onUpdate: () => void;
};

/**
 * Таб настроек уведомлений
 * Позволяет настроить email, push и telegram уведомления
 */
export function ProfileNotificationsTab({ settings, onUpdate }: ProfileNotificationsTabProps) {
    const t = useTranslations('profile.notificationSettings');
    const tProfile = useTranslations('profile');

    // Локальное состояние настроек
    const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Обновление локальных настроек
    const updateSetting = <T extends keyof NotificationSettings>(
        category: T,
        key: keyof NotificationSettings[T],
        value: boolean
    ) => {
        setLocalSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            },
        }));
    };

    // Сохранение настроек
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await updateNotificationSettings(localSettings);
            setSuccess(tProfile('saved'));
            onUpdate();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to save notification settings:', err);
            setError(tProfile('errorSaving'));
        } finally {
            setIsSaving(false);
        }
    };

    // Проверка на изменения
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

    return (
        <div className="space-y-6">
            {/* Сообщения */}
            {error && (
                <Alert variant="destructive">{error}</Alert>
            )}
            {success && (
                <Alert className="bg-success/10 border-success text-success">{success}</Alert>
            )}

            {/* Email уведомления */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        {t('email.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <NotificationSwitch
                        id="email-newProperties"
                        label={t('email.newProperties')}
                        checked={localSettings.email.newProperties}
                        onCheckedChange={(checked) => updateSetting('email', 'newProperties', checked)}
                    />
                    <NotificationSwitch
                        id="email-priceChanges"
                        label={t('email.priceChanges')}
                        checked={localSettings.email.priceChanges}
                        onCheckedChange={(checked) => updateSetting('email', 'priceChanges', checked)}
                    />
                    <NotificationSwitch
                        id="email-savedSearches"
                        label={t('email.savedSearches')}
                        checked={localSettings.email.savedSearches}
                        onCheckedChange={(checked) => updateSetting('email', 'savedSearches', checked)}
                    />
                    <NotificationSwitch
                        id="email-promotions"
                        label={t('email.promotions')}
                        checked={localSettings.email.promotions}
                        onCheckedChange={(checked) => updateSetting('email', 'promotions', checked)}
                    />
                    <NotificationSwitch
                        id="email-accountUpdates"
                        label={t('email.accountUpdates')}
                        checked={localSettings.email.accountUpdates}
                        onCheckedChange={(checked) => updateSetting('email', 'accountUpdates', checked)}
                    />
                </CardContent>
            </Card>

            {/* Push уведомления */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        {t('push.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <NotificationSwitch
                        id="push-newProperties"
                        label={t('push.newProperties')}
                        checked={localSettings.push.newProperties}
                        onCheckedChange={(checked) => updateSetting('push', 'newProperties', checked)}
                    />
                    <NotificationSwitch
                        id="push-priceChanges"
                        label={t('push.priceChanges')}
                        checked={localSettings.push.priceChanges}
                        onCheckedChange={(checked) => updateSetting('push', 'priceChanges', checked)}
                    />
                    <NotificationSwitch
                        id="push-savedSearches"
                        label={t('push.savedSearches')}
                        checked={localSettings.push.savedSearches}
                        onCheckedChange={(checked) => updateSetting('push', 'savedSearches', checked)}
                    />
                    <NotificationSwitch
                        id="push-messages"
                        label={t('push.messages')}
                        checked={localSettings.push.messages}
                        onCheckedChange={(checked) => updateSetting('push', 'messages', checked)}
                    />
                </CardContent>
            </Card>

            {/* Telegram уведомления */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        {t('telegram.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <NotificationSwitch
                        id="telegram-enabled"
                        label={t('telegram.enabled')}
                        checked={localSettings.telegram.enabled}
                        onCheckedChange={(checked) => updateSetting('telegram', 'enabled', checked)}
                    />
                    
                    {localSettings.telegram.enabled && (
                        <>
                            <Separator />
                            
                            {localSettings.telegram.chatId ? (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                                    <span className="text-sm text-success">{t('telegram.connected')}</span>
                                    <Button variant="ghost" size="sm" className="text-text-secondary">
                                        {t('telegram.disconnect')}
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" className="w-full">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {t('telegram.connect')}
                                </Button>
                            )}

                            {localSettings.telegram.chatId && (
                                <>
                                    <NotificationSwitch
                                        id="telegram-newProperties"
                                        label={t('telegram.newProperties')}
                                        checked={localSettings.telegram.newProperties}
                                        onCheckedChange={(checked) => updateSetting('telegram', 'newProperties', checked)}
                                    />
                                    <NotificationSwitch
                                        id="telegram-priceChanges"
                                        label={t('telegram.priceChanges')}
                                        checked={localSettings.telegram.priceChanges}
                                        onCheckedChange={(checked) => updateSetting('telegram', 'priceChanges', checked)}
                                    />
                                </>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

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
                        {tProfile('saveChanges')}
                    </Button>
                </div>
            )}
        </div>
    );
}

// Компонент переключателя уведомлений
function NotificationSwitch({
    id,
    label,
    checked,
    onCheckedChange,
}: {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <Label 
                htmlFor={id} 
                className="text-text-primary cursor-pointer flex-1 pr-4"
            >
                {label}
            </Label>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
        </div>
    );
}
