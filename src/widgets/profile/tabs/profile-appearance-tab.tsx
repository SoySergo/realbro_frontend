'use client';

import { useTranslations } from 'next-intl';
import { Palette, Globe, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ExtendedUserSettings } from '@/entities/user';
import { LANGUAGES } from '@/shared/config/i18n';
import { useLanguageSwitcher } from '@/features/language-switcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';

type ProfileAppearanceTabProps = {
    settings: ExtendedUserSettings;
    onUpdate: () => void;
};

/**
 * Таб оформления
 * Выбор темы и языка интерфейса
 */
export function ProfileAppearanceTab({ settings, onUpdate }: ProfileAppearanceTabProps) {
    const t = useTranslations('profile');
    const { theme, setTheme } = useTheme();
    const { currentLocale, changeLanguage, isPending } = useLanguageSwitcher();

    // Опции тем
    const themeOptions = [
        { value: 'light', label: t('themeLight'), icon: Sun },
        { value: 'dark', label: t('themeDark'), icon: Moon },
        { value: 'system', label: t('themeSystem'), icon: Monitor },
    ];

    return (
        <div className="space-y-6">
            {/* Выбор темы */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        {t('theme')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = theme === option.value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setTheme(option.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                                        isSelected
                                            ? "border-brand-primary bg-brand-primary-light"
                                            : "border-border hover:border-brand-primary/50 bg-background-secondary"
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-6 h-6",
                                        isSelected ? "text-brand-primary" : "text-text-secondary"
                                    )} />
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isSelected ? "text-brand-primary" : "text-text-primary"
                                    )}>
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Выбор языка */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {t('language')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {LANGUAGES.map((lang) => {
                            const isSelected = currentLocale === lang.code;

                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    disabled={isPending || isSelected}
                                    className={cn(
                                        "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                                        isSelected
                                            ? "border-brand-primary bg-brand-primary-light"
                                            : "border-border hover:border-brand-primary/50 bg-background-secondary",
                                        isPending && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <span className="text-2xl">{lang.flag}</span>
                                    <div className="text-left">
                                        <p className={cn(
                                            "font-medium",
                                            isSelected ? "text-brand-primary" : "text-text-primary"
                                        )}>
                                            {lang.nativeName}
                                        </p>
                                        <p className="text-sm text-text-secondary">
                                            {lang.name}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
