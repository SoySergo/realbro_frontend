'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
    Star, 
    MapPin, 
    BadgeCheck, 
    Crown, 
    Phone, 
    Mail, 
    Globe, 
    Clock,
    Building2,
    Users,
    Calendar,
    MessageCircle,
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    Share2,
    StickyNote,
    Flag
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import type { Agency, AgencyReview } from '@/entities/agency';
import type { Property } from '@/entities/property';

interface AgencyDetailProps {
    agency: Agency;
    properties?: Property[];
    locale: string;
}

/**
 * Детальная страница агентства недвижимости
 * Отображает: фон, логотип, контакты, описание, объекты, отзывы
 */
export function AgencyDetail({ agency, properties = [], locale }: AgencyDetailProps) {
    const t = useTranslations('agency');
    const tLang = useTranslations('languages');
    const tCommon = useTranslations('common');
    const router = useRouter();

    // Состояние для показа телефона
    const [showPhone, setShowPhone] = useState(false);
    const [showSidebarPhone, setShowSidebarPhone] = useState(false);

    // Определяем стили для Premium агентства
    const isPremium = agency.isPremium;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Мобильный хедер */}
            <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-b border-border h-14 flex items-center px-2 gap-2">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-brand-primary-light text-brand-primary active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="flex-1 font-semibold text-sm truncate">{agency.name}</span>
                <button className="p-2 rounded-full hover:bg-muted transition-all text-muted-foreground">
                    <Share2 className="w-4 h-4" />
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-full hover:bg-muted transition-all text-muted-foreground">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            {t('helpful')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            {t('notHelpful')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <StickyNote className="w-4 h-4 mr-2" />
                            {tCommon('note')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-error focus:text-error">
                            <Flag className="w-4 h-4 mr-2" />
                            {tCommon('report')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Desktop хедер с кнопками действий */}
            <div className="hidden md:flex fixed top-0 left-16 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border h-14 items-center px-6 gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-brand-primary-light text-brand-primary active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="flex-1 font-semibold truncate">{agency.name}</span>
                
                {/* Компактные действия */}
                <div className="flex items-center gap-1">
                    <button 
                        className="p-2 rounded-full hover:bg-muted transition-all text-muted-foreground"
                        title={tCommon('share')}
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-full hover:bg-muted transition-all text-muted-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                {t('helpful')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                {t('notHelpful')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <StickyNote className="w-4 h-4 mr-2" />
                                {tCommon('note')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-error focus:text-error">
                                <Flag className="w-4 h-4 mr-2" />
                                {tCommon('report')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Фоновое изображение (hero section) */}
            <div className={cn(
                "relative h-48 md:h-64 lg:h-80 mt-14",
                isPremium 
                    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
                    : "bg-background-secondary"
            )}>
                {agency.coverImage ? (
                    <Image
                        src={agency.coverImage}
                        alt={agency.name}
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                ) : isPremium ? (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-amber-500/10" />
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-primary-light via-brand-primary-light/50 to-background dark:from-brand-primary/20 dark:via-brand-primary/10 dark:to-background" />
                )}
                {/* Градиент для читаемости */}
                <div className={cn(
                    "absolute inset-0",
                    isPremium 
                        ? "bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"
                        : "bg-gradient-to-t from-background via-background/50 to-transparent"
                )} />
            </div>

            {/* Основной контент */}
            <div className="max-w-6xl mx-auto px-4 md:pl-6 -mt-20 md:-mt-24 relative z-10">
                {/* Шапка агентства */}
                <Card className={cn(
                    "p-0 overflow-hidden",
                    isPremium 
                        ? "border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl shadow-brand-primary/10"
                        : "shadow-lg"
                )}>
                    {/* Декоративный элемент для Premium */}
                    {isPremium && (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-amber-500/5 pointer-events-none" />
                    )}
                    
                    <div className={cn(
                        "relative p-4 md:p-6",
                        !isPremium && "bg-background"
                    )}>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                            {/* Логотип */}
                            <div className={cn(
                                "relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 mx-auto md:mx-0",
                                isPremium 
                                    ? "ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 bg-white dark:bg-slate-700"
                                    : "bg-background border border-border shadow-sm"
                            )}>
                                {agency.logo ? (
                                    <Image
                                        src={agency.logo}
                                        alt={agency.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 96px, 128px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Building2 className={cn(
                                            "w-12 h-12",
                                            isPremium ? "text-amber-500" : "text-text-tertiary"
                                        )} />
                                    </div>
                                )}
                            </div>

                            {/* Информация */}
                            <div className="flex-1 text-center md:text-left">
                                {/* Название и бейджи */}
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                    <h1 className={cn(
                                        "text-2xl md:text-3xl font-bold",
                                        isPremium ? "text-white" : "text-text-primary"
                                    )}>
                                        {agency.name}
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        {agency.isPremium && (
                                            <Badge 
                                                variant="default" 
                                                className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold border-0 shadow-lg shadow-amber-500/30 gap-1"
                                            >
                                                <Crown className="w-3 h-3" />
                                                {t('premium')}
                                            </Badge>
                                        )}
                                        {agency.isVerified && (
                                            <Badge variant="success" className="gap-1 shadow-sm">
                                                <BadgeCheck className="w-3 h-3" />
                                                {t('verified')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Локация */}
                                {agency.offices[0] && (
                                    <div className={cn(
                                        "flex items-center justify-center md:justify-start gap-1.5 mb-3",
                                        isPremium ? "text-slate-300" : "text-text-secondary"
                                    )}>
                                        <MapPin className={cn(
                                            "w-4 h-4",
                                            isPremium && "text-amber-400/70"
                                        )} />
                                        <span>{agency.offices[0].address}, {agency.offices[0].city}</span>
                                    </div>
                                )}

                                {/* Статистика */}
                                <div className={cn(
                                    "flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm",
                                    isPremium && "bg-white/5 rounded-lg px-4 py-2.5 backdrop-blur-sm w-fit mx-auto md:mx-0"
                                )}>
                                    {/* Рейтинг */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        'w-4 h-4',
                                                        star <= Math.round(agency.rating)
                                                            ? isPremium 
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-amber-500 fill-amber-500'
                                                            : isPremium
                                                                ? 'text-slate-500'
                                                                : 'text-text-tertiary'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className={cn(
                                            "font-semibold text-base",
                                            isPremium ? "text-white" : "text-text-primary"
                                        )}>
                                            {agency.rating.toFixed(1)}
                                        </span>
                                        <span className={cn(
                                            isPremium ? "text-slate-400" : "text-text-secondary"
                                        )}>
                                            ({agency.reviewsCount} {t('reviews')})
                                        </span>
                                    </div>

                                    {!isPremium && <div className="w-px h-4 bg-border hidden md:block" />}

                                    {/* Объекты */}
                                    <div className={cn(
                                        "flex items-center gap-1.5",
                                        isPremium ? "text-slate-300" : "text-text-secondary"
                                    )}>
                                        <Building2 className={cn(
                                            "w-4 h-4",
                                            isPremium && "text-amber-400/70"
                                        )} />
                                        <span>{t('objectsCount', { count: agency.objectsCount })}</span>
                                    </div>

                                    {/* Агенты */}
                                    {agency.agentsCount && (
                                        <div className={cn(
                                            "flex items-center gap-1.5",
                                            isPremium ? "text-slate-300" : "text-text-secondary"
                                        )}>
                                            <Users className={cn(
                                                "w-4 h-4",
                                                isPremium && "text-amber-400/70"
                                            )} />
                                            <span>{t('agentsCount', { count: agency.agentsCount })}</span>
                                        </div>
                                    )}

                                    {/* Год основания */}
                                    {agency.foundedYear && (
                                        <div className={cn(
                                            "flex items-center gap-1.5",
                                            isPremium ? "text-slate-300" : "text-text-secondary"
                                        )}>
                                            <Calendar className={cn(
                                                "w-4 h-4",
                                                isPremium && "text-amber-400/70"
                                            )} />
                                            <span>{t('founded', { year: agency.foundedYear })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Кнопки действий */}
                            <div className="flex flex-col gap-2 shrink-0">
                                {/* Кнопка показа телефона */}
                                {showPhone ? (
                                    <a
                                        href={`tel:${agency.contact.phone}`}
                                        className={cn(
                                            "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-4 py-2 transition-colors",
                                            isPremium 
                                                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/20"
                                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                                        )}
                                    >
                                        <Phone className="w-4 h-4" />
                                        {agency.contact.phone}
                                    </a>
                                ) : (
                                    <Button 
                                        onClick={() => setShowPhone(true)}
                                        className={cn(
                                            "gap-2",
                                            isPremium && "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/20"
                                        )}
                                    >
                                        <Phone className="w-4 h-4" />
                                        {t('showPhone')}
                                    </Button>
                                )}

                                {/* Кнопка написать с выбором мессенджера */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className={cn(
                                                "gap-2 w-full",
                                                isPremium && "border-white/20 text-white hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            {t('writeMessage')}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {agency.contact.whatsapp && (
                                            <DropdownMenuItem asChild>
                                                <a
                                                    href={`https://wa.me/${agency.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    WhatsApp
                                                </a>
                                            </DropdownMenuItem>
                                        )}
                                        {agency.contact.telegram && (
                                            <DropdownMenuItem asChild>
                                                <a
                                                    href={`https://t.me/${agency.contact.telegram.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    Telegram
                                                </a>
                                            </DropdownMenuItem>
                                        )}
                                        {agency.contact.email && (
                                            <DropdownMenuItem asChild>
                                                <a href={`mailto:${agency.contact.email}`}>
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Email
                                                </a>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Табы с контентом */}
                <Tabs defaultValue="about" className="mt-6">
                    <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide">
                        <TabsTrigger value="about">{t('aboutAgency')}</TabsTrigger>
                        <TabsTrigger value="properties">
                            {t('agencyProperties')} ({agency.objectsCount})
                        </TabsTrigger>
                        <TabsTrigger value="reviews">
                            {t('agencyReviews')} ({agency.reviewsCount})
                        </TabsTrigger>
                        <TabsTrigger value="team">{t('team')}</TabsTrigger>
                    </TabsList>

                    {/* Об агентстве */}
                    <TabsContent value="about" className="mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Описание */}
                            <div className="lg:col-span-2 bg-background border border-border rounded-xl p-4 md:p-6">
                                <h2 className="text-lg font-semibold text-text-primary mb-4">
                                    {t('description')}
                                </h2>
                                <p className="text-text-secondary whitespace-pre-line">
                                    {agency.description}
                                </p>

                                {/* Языки */}
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-text-primary mb-2">
                                        {t('languages')}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {agency.languages.map((lang) => (
                                            <Badge key={lang} variant="secondary">
                                                {tLang(lang)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Типы недвижимости */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-text-primary mb-2">
                                        {t('propertyTypes')}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {agency.propertyTypes.map((type) => (
                                            <Badge key={type} variant="outline">
                                                {t(`propertyTypesLabels.${type}`)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Услуги */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-text-primary mb-2">
                                        {t('services')}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {agency.serviceTypes.map((type) => (
                                            <Badge key={type} variant="outline">
                                                {t(`serviceTypesLabels.${type}`)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Контакты */}
                            <div className="bg-background border border-border rounded-xl p-4 md:p-6">
                                <h2 className="text-lg font-semibold text-text-primary mb-4">
                                    {t('contact')}
                                </h2>

                                <div className="space-y-3">
                                    {/* Телефон с маскировкой */}
                                    {agency.contact.phone && (
                                        showSidebarPhone ? (
                                            <a
                                                href={`tel:${agency.contact.phone}`}
                                                className="flex items-center gap-3 text-text-secondary hover:text-brand-primary transition-colors"
                                            >
                                                <Phone className="w-5 h-5 shrink-0" />
                                                <span>{agency.contact.phone}</span>
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => setShowSidebarPhone(true)}
                                                className="flex items-center gap-3 text-text-secondary hover:text-brand-primary transition-colors w-full text-left"
                                            >
                                                <Phone className="w-5 h-5 shrink-0" />
                                                <span>{agency.contact.phone.slice(0, 4)} *** ** **</span>
                                            </button>
                                        )
                                    )}

                                    {/* Email */}
                                    {agency.contact.email && (
                                        <a
                                            href={`mailto:${agency.contact.email}`}
                                            className="flex items-center gap-3 text-text-secondary hover:text-brand-primary transition-colors"
                                        >
                                            <Mail className="w-5 h-5 shrink-0" />
                                            <span>{agency.contact.email}</span>
                                        </a>
                                    )}

                                    {/* Сайт */}
                                    {agency.contact.website && (
                                        <a
                                            href={agency.contact.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-text-secondary hover:text-brand-primary transition-colors"
                                        >
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span className="truncate">{agency.contact.website}</span>
                                        </a>
                                    )}
                                </div>

                                {/* Офисы */}
                                {agency.offices.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <h3 className="text-sm font-medium text-text-primary mb-3">
                                            {t('offices')}
                                        </h3>
                                        <div className="space-y-3">
                                            {agency.offices.map((office) => (
                                                <div key={office.id} className="text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                                                        <div>
                                                            {office.isMain && (
                                                                <span className="text-xs text-brand-primary font-medium">
                                                                    {t('mainOffice')}
                                                                </span>
                                                            )}
                                                            <p className="text-text-secondary">
                                                                {office.address}, {office.city}
                                                            </p>
                                                            {office.phone && (
                                                                <p className="text-text-tertiary">{office.phone}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Объекты */}
                    <TabsContent value="properties" className="mt-4">
                        <AgencyPropertiesTab
                            properties={properties}
                        />
                    </TabsContent>

                    {/* Отзывы */}
                    <TabsContent value="reviews" className="mt-4">
                        <AgencyReviewsTab
                            reviews={agency.reviews || []}
                            rating={agency.rating}
                            totalCount={agency.reviewsCount}
                        />
                    </TabsContent>

                    {/* Команда */}
                    <TabsContent value="team" className="mt-4">
                        <AgencyTeamTab agents={agency.agents || []} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// Компонент для таба с объектами
function AgencyPropertiesTab({
    properties,
}: {
    properties: Property[];
}) {
    const t = useTranslations('agency');
    const tCommon = useTranslations('common');

    if (properties.length === 0) {
        return (
            <div className="bg-background border border-border rounded-xl p-8 text-center">
                <Building2 className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                <p className="text-text-secondary">{t('noPropertiesFound')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
                <div
                    key={property.id}
                    className="bg-background border border-border rounded-xl overflow-hidden hover:border-border-hover transition-colors"
                >
                    {/* Изображение */}
                    <div className="relative aspect-[4/3]">
                        {property.images[0] && (
                            <Image
                                src={property.images[0]}
                                alt={property.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        )}
                    </div>

                    {/* Контент */}
                    <div className="p-3">
                        <p className="font-semibold text-price">
                            {property.price.toLocaleString()} €
                            <span className="text-text-tertiary font-normal text-sm">{tCommon('perMonth')}</span>
                        </p>
                        <h3 className="text-sm font-medium text-text-primary truncate mt-1">
                            {property.title}
                        </h3>
                        <p className="text-xs text-text-secondary mt-1">
                            {property.rooms} {t('rooms')} · {property.area} {t('sqm')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Компонент для таба с отзывами
function AgencyReviewsTab({
    reviews,
    rating,
    totalCount,
}: {
    reviews: AgencyReview[];
    rating: number;
    totalCount: number;
}) {
    const t = useTranslations('agency');

    return (
        <div className="space-y-4">
            {/* Общий рейтинг */}
            <div className="bg-background border border-border rounded-xl p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-text-primary">
                        {rating.toFixed(1)}
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        'w-5 h-5',
                                        star <= Math.round(rating)
                                            ? 'text-amber-500 fill-amber-500'
                                            : 'text-text-tertiary'
                                    )}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                            {t('reviewsCount', { count: totalCount })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Список отзывов */}
            <div className="space-y-3">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-background border border-border rounded-xl p-4"
                    >
                        <div className="flex items-start gap-3">
                            {/* Аватар */}
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-background-secondary shrink-0">
                                {review.authorAvatar ? (
                                    <Image
                                        src={review.authorAvatar}
                                        alt={review.authorName}
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-tertiary font-medium">
                                        {review.authorName[0]}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Имя и рейтинг */}
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium text-text-primary">
                                        {review.authorName}
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    'w-3.5 h-3.5',
                                                    star <= review.rating
                                                        ? 'text-amber-500 fill-amber-500'
                                                        : 'text-text-tertiary'
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Текст отзыва */}
                                <p className="text-sm text-text-secondary mt-2">
                                    {review.text}
                                </p>

                                {/* Дата */}
                                <p className="text-xs text-text-tertiary mt-2">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>

                                {/* Ответ агентства */}
                                {review.reply && (
                                    <div className="mt-3 pl-3 border-l-2 border-brand-primary">
                                        <p className="text-xs text-brand-primary font-medium">
                                            {t('reply')}
                                        </p>
                                        <p className="text-sm text-text-secondary mt-1">
                                            {review.reply.text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Компонент для таба с командой
function AgencyTeamTab({
    agents,
}: {
    agents: NonNullable<Agency['agents']>;
}) {
    const t = useTranslations('agency');
    const tLang = useTranslations('languages');

    if (agents.length === 0) {
        return (
            <div className="bg-background border border-border rounded-xl p-8 text-center">
                <Users className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                <p className="text-text-secondary">{t('noAgentsFound')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
                <div
                    key={agent.id}
                    className="bg-background border border-border rounded-xl p-4 hover:border-border-hover transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {/* Аватар */}
                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-background-secondary shrink-0">
                            {agent.avatar ? (
                                <Image
                                    src={agent.avatar}
                                    alt={agent.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-tertiary font-medium text-lg">
                                    {agent.name[0]}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-text-primary truncate">
                                {agent.name}
                            </h3>
                            {agent.position && (
                                <p className="text-sm text-text-secondary truncate">
                                    {agent.position}
                                </p>
                            )}
                            {agent.objectsCount && (
                                <p className="text-xs text-text-tertiary">
                                    {t('objectsCount', { count: agent.objectsCount })}
                                </p>
                            )}
                        </div>

                        {agent.isVerified && (
                            <BadgeCheck className="w-5 h-5 text-success shrink-0" />
                        )}
                    </div>

                    {/* Языки */}
                    <div className="flex flex-wrap gap-1 mt-3">
                        {agent.languages.slice(0, 3).map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                                {tLang(lang)}
                            </Badge>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
