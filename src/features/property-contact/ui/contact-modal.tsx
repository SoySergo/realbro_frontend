'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    Phone,
    MessageCircle,
    Mail,
    ExternalLink,
    User,
    Building2,
    Loader2,
    X,
    LogIn,
    Crown,
    Copy,
    Check,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';
import { useContactStore } from '../model/store';
import { useAuthStore } from '@/features/auth/model/store';
import type { ContactInfo, AuthorType } from '@/shared/api/contacts';

// ============================================================================
// Типы
// ============================================================================

export interface ContactModalTranslations {
    title: string;
    loadingTitle: string;
    authRequiredTitle: string;
    authRequiredDescription: string;
    authRequiredOwnerDescription: string;
    limitExceededTitle: string;
    limitExceededDescription: string;
    loginButton: string;
    upgradeButton: string;
    closeButton: string;
    phone: string;
    showPhone: string;
    call: string;
    whatsapp: string;
    telegram: string;
    email: string;
    website: string;
    agencyProfile: string;
    copySuccess: string;
    owner: string;
    agent: string;
    agency: string;
    limitInfo: string;
}

interface ContactModalProps {
    translations: ContactModalTranslations;
    pricingPath?: string;
}

// ============================================================================
// Хелперы
// ============================================================================

/**
 * Определяем мобильное устройство по ширине экрана
 * Используем только ширину экрана для надежного определения
 */
function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            // Используем только ширину экрана - более надежный метод
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    return isMobile;
}

/**
 * Иконка для типа автора
 */
function AuthorTypeIcon({ type, className }: { type: AuthorType; className?: string }) {
    switch (type) {
        case 'owner':
            return <User className={className} />;
        case 'agency':
            return <Building2 className={className} />;
        default:
            return <User className={className} />;
    }
}

// ============================================================================
// Компонент кнопки контакта
// ============================================================================

interface ContactButtonProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    copyable?: boolean;
    copyLabel?: string;
}

function ContactButton({
    icon,
    label,
    value,
    href,
    onClick,
    variant = 'secondary',
    copyable,
    copyLabel,
}: ContactButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('[Contact] Failed to copy:', err);
        }
    }, [value]);

    const buttonClasses = cn(
        'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200',
        'font-medium text-sm',
        variant === 'primary' && 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-sm',
        variant === 'secondary' && 'bg-brand-primary-light text-brand-primary hover:bg-brand-primary-light/80 dark:bg-brand-primary/20',
        variant === 'outline' && 'border border-border hover:bg-muted'
    );

    const content = (
        <>
            <div className="flex items-center gap-3">
                {icon}
                <div className="text-left">
                    <div className="text-xs text-muted-foreground opacity-80">{label}</div>
                    <div>{value}</div>
                </div>
            </div>
            {copyable && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopy();
                    }}
                    className="p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    title={copyLabel}
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-success" />
                    ) : (
                        <Copy className="w-4 h-4 opacity-60" />
                    )}
                </button>
            )}
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                onClick={onClick}
                className={buttonClasses}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
                {content}
            </a>
        );
    }

    return (
        <button onClick={onClick} className={buttonClasses}>
            {content}
        </button>
    );
}

// ============================================================================
// Компоненты состояний
// ============================================================================

/**
 * Состояние загрузки
 */
function LoadingState({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="relative">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
            </div>
            <p className="text-muted-foreground">{title}</p>
        </div>
    );
}

/**
 * Требуется авторизация
 */
function AuthRequiredState({
    translations,
    authorType,
    onLogin,
}: {
    translations: ContactModalTranslations;
    authorType: AuthorType;
    onLogin: () => void;
}) {
    const description = authorType === 'owner'
        ? translations.authRequiredOwnerDescription
        : translations.authRequiredDescription;

    return (
        <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-warning" />
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-1">{translations.authRequiredTitle}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{description}</p>
            </div>
            <Button onClick={onLogin} className="mt-2">
                <LogIn className="w-4 h-4 mr-2" />
                {translations.loginButton}
            </Button>
        </div>
    );
}

/**
 * Превышен лимит
 */
function LimitExceededState({
    translations,
    limit,
    onUpgrade,
}: {
    translations: ContactModalTranslations;
    limit?: { current: number; max: number; resetAt?: string };
    onUpgrade: () => void;
}) {
    const limitInfo = limit
        ? translations.limitInfo.replace('{current}', String(limit.current)).replace('{max}', String(limit.max))
        : '';

    return (
        <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                <Crown className="w-8 h-8 text-warning" />
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-1">{translations.limitExceededTitle}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{translations.limitExceededDescription}</p>
                {limitInfo && (
                    <p className="text-xs text-muted-foreground mt-2">{limitInfo}</p>
                )}
            </div>
            <Button onClick={onUpgrade} className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <Crown className="w-4 h-4 mr-2" />
                {translations.upgradeButton}
            </Button>
        </div>
    );
}

/**
 * Отображение контактов
 */
function ContactsDisplay({
    contacts,
    translations,
    isMobile,
}: {
    contacts: ContactInfo;
    translations: ContactModalTranslations;
    isMobile: boolean;
}) {
    return (
        <div className="space-y-3 py-4">
            {/* Телефон */}
            {contacts.phone && (
                <ContactButton
                    icon={<Phone className="w-5 h-5 text-success" />}
                    label={translations.phone}
                    value={contacts.phone}
                    href={isMobile ? `tel:${contacts.phone.replace(/\s/g, '')}` : undefined}
                    variant="primary"
                    copyable={!isMobile}
                    copyLabel={translations.copySuccess}
                />
            )}

            {/* WhatsApp */}
            {contacts.whatsapp && (
                <ContactButton
                    icon={
                        <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    }
                    label={translations.whatsapp}
                    value="WhatsApp"
                    href={`https://wa.me/${contacts.whatsapp.replace(/[^0-9]/g, '')}`}
                    variant="secondary"
                />
            )}

            {/* Telegram */}
            {contacts.telegram && (
                <ContactButton
                    icon={
                        <svg className="w-5 h-5 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                    }
                    label={translations.telegram}
                    value={contacts.telegram}
                    href={`https://t.me/${contacts.telegram.replace('@', '')}`}
                    variant="secondary"
                />
            )}

            {/* Email */}
            {contacts.email && (
                <ContactButton
                    icon={<Mail className="w-5 h-5 text-info" />}
                    label={translations.email}
                    value={contacts.email}
                    href={`mailto:${contacts.email}`}
                    variant="outline"
                    copyable
                    copyLabel={translations.copySuccess}
                />
            )}

            {/* Website */}
            {contacts.website && (
                <ContactButton
                    icon={<ExternalLink className="w-5 h-5 text-muted-foreground" />}
                    label={translations.website}
                    value={(() => {
                        try {
                            return new URL(contacts.website).hostname;
                        } catch {
                            return contacts.website;
                        }
                    })()}
                    href={contacts.website}
                    variant="outline"
                />
            )}

            {/* Agency Profile */}
            {contacts.agencyProfile && (
                <ContactButton
                    icon={<Building2 className="w-5 h-5 text-muted-foreground" />}
                    label={translations.agencyProfile}
                    value={translations.agency}
                    href={contacts.agencyProfile}
                    variant="outline"
                />
            )}
        </div>
    );
}

// ============================================================================
// Основной компонент
// ============================================================================

export function ContactModal({ translations, pricingPath = '/pricing' }: ContactModalProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useIsMobile();
    
    // Stores
    const {
        isOpen,
        isLoading,
        authorType,
        authorName,
        authorAvatar,
        contacts,
        error,
        limit,
        closeContactModal,
        requestContacts,
    } = useContactStore();
    
    const { user, isAuthenticated } = useAuthStore();
    
    // Определяем тариф пользователя (мок - всегда free)
    const userTariff = useMemo(() => {
        // TODO: Получать реальный тариф из профиля пользователя
        return 'free' as const;
    }, [user]);

    // Запрашиваем контакты при открытии модалки
    useEffect(() => {
        if (isOpen && !contacts && !error) {
            requestContacts(isAuthenticated(), userTariff);
        }
    }, [isOpen, contacts, error, isAuthenticated, userTariff, requestContacts]);

    // Обработчики
    const handleLogin = useCallback(() => {
        closeContactModal();
        // Добавляем параметр modal=login к текущему URL
        const params = new URLSearchParams(window.location.search);
        params.set('modal', 'login');
        router.push(`${pathname}?${params.toString()}`);
    }, [closeContactModal, router, pathname]);

    const handleUpgrade = useCallback(() => {
        closeContactModal();
        // Извлекаем локаль из пути
        const locale = pathname.split('/')[1] || 'ru';
        router.push(`/${locale}${pricingPath}`);
    }, [closeContactModal, router, pathname, pricingPath]);

    // Получаем название типа автора
    const authorTypeLabel = useMemo(() => {
        if (!authorType) return '';
        return translations[authorType] || authorType;
    }, [authorType, translations]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeContactModal()}>
            <DialogContent className="sm:max-w-md">
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <X className="h-4 w-4" />
                    <span className="sr-only">{translations.closeButton}</span>
                </DialogClose>
                
                <DialogHeader>
                    {/* Аватар и информация об авторе */}
                    {authorName && (
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={authorAvatar} alt={authorName} />
                                <AvatarFallback className="bg-brand-primary-light text-brand-primary">
                                    <AuthorTypeIcon type={authorType || 'agent'} className="w-5 h-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-left">{authorName}</DialogTitle>
                                <DialogDescription className="text-left">
                                    {authorTypeLabel}
                                </DialogDescription>
                            </div>
                        </div>
                    )}
                </DialogHeader>

                {/* Контент в зависимости от состояния */}
                {isLoading && <LoadingState title={translations.loadingTitle} />}
                
                {!isLoading && error === 'auth_required' && authorType && (
                    <AuthRequiredState
                        translations={translations}
                        authorType={authorType}
                        onLogin={handleLogin}
                    />
                )}
                
                {!isLoading && error === 'limit_exceeded' && (
                    <LimitExceededState
                        translations={translations}
                        limit={limit}
                        onUpgrade={handleUpgrade}
                    />
                )}
                
                {!isLoading && !error && contacts && (
                    <ContactsDisplay
                        contacts={contacts}
                        translations={translations}
                        isMobile={isMobile}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
