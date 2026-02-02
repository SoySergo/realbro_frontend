'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Phone, MessageCircle, BarChart3, ChevronRight, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import type { RentalConditions, PropertyAuthor } from '../../model/types';

interface PropertySidebarConditionsProps {
    price: number;
    currency?: string;
    rentalConditions?: RentalConditions;
    noCommission?: boolean;
    author?: PropertyAuthor;
    onCall?: () => void;
    onMessage?: () => void;
    onLike?: () => void;
    onDislike?: () => void;
    onShare?: () => void;
    className?: string;
}

export function PropertySidebarConditions({
    price,
    currency = '€',
    rentalConditions,
    noCommission,
    author,
    onCall,
    onMessage,
    onLike,
    onDislike,
    onShare,
    className
}: PropertySidebarConditionsProps) {
    const t = useTranslations('propertyDetail');
    const [offerPrice, setOfferPrice] = useState('');

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('ru-RU').format(Math.round(amount));
    };

    const deposit = rentalConditions?.deposit ?? 0;
    const utilitiesIncluded = rentalConditions?.utilitiesIncluded ?? false;
    
    return (
        <Card className={cn('p-6 shadow-sm border-border bg-card', className)}>
            <div className="space-y-6">
                {/* Header: Price & Actions */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold">
                                {formatPrice(price)} {currency}/{t('perMonth')}
                            </span>
                            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors" title={t('priceHistory') || 'История цены'}>
                                <BarChart3 className="w-5 h-5" />
                            </button>
                        </div>
                        <button className="text-sm text-primary hover:underline mt-1">
                            {t('trackPrice') || 'Следить за изменением цены'}
                        </button>
                    </div>
                    <div className="flex gap-1">
                        <button 
                            onClick={onLike}
                            className="p-2 rounded-full transition-all duration-200 hover:bg-muted active:scale-90 text-muted-foreground hover:text-foreground"
                            title={t('like') || 'Нравится'}
                        >
                            <ThumbsUp className="w-5 h-5" />
                        </button>
                         <button 
                            onClick={onDislike}
                            className="p-2 rounded-full transition-all duration-200 hover:bg-muted active:scale-90 text-muted-foreground hover:text-foreground"
                            title={t('dislike') || 'Не нравится'}
                        >
                            <ThumbsDown className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={onShare}
                            className="p-2 rounded-full transition-all duration-200 hover:bg-muted active:scale-90 text-muted-foreground hover:text-foreground"
                            title={t('share') || 'Поделиться'}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Offer Price Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('offerYourPrice') || 'Предложите свою цену'}</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder={`${t('example')}, ${formatPrice(Math.round(price * 0.9))} ${currency}`}
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                            className="bg-muted/30"
                        />
                        <Button size="icon" variant="secondary" className="bg-brand-primary-light text-brand-primary hover:bg-brand-primary-light/80 dark:bg-brand-primary/20 dark:text-brand-primary aspect-square h-auto w-10 shrink-0">
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Conditions List - Reduced */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-end gap-2">
                        <span className="text-muted-foreground whitespace-nowrap">{t('utilities') || 'Оплата ЖКХ'}</span>
                        <div className="flex-1 border-b border-border border-dashed mb-1 mx-1 opacity-50"></div>
                        <span className="text-right font-medium text-nowrap">
                            {utilitiesIncluded 
                                ? (t('utilitiesIncluded') || 'включена (без счётчиков)') 
                                : (t('utilitiesNotIncluded') || 'не включена')
                            }
                        </span>
                    </div>

                    <div className="flex justify-between items-end gap-2">
                        <span className="text-muted-foreground whitespace-nowrap">{t('deposit') || 'Залог'}</span>
                        <div className="flex-1 border-b border-border border-dashed mb-1 mx-1 opacity-50"></div>
                        <span className="text-right font-medium text-nowrap">
                            {deposit > 0 ? `${formatPrice(deposit)} ${currency}` : '—'}
                        </span>
                    </div>

                    <div className="flex justify-between items-end gap-2">
                        <span className="text-muted-foreground whitespace-nowrap">{t('rentalTerm') || 'Срок аренды'}</span>
                        <div className="flex-1 border-b border-border border-dashed mb-1 mx-1 opacity-50"></div>
                        <span className="text-right font-medium text-nowrap">
                            {rentalConditions?.minRentalMonths
                                ? t('minRentalPeriod', { months: rentalConditions.minRentalMonths })
                                : t('longTerm')
                            }
                        </span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <Button
                        size="lg"
                        className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-lg h-12 shadow-md shadow-brand-primary/10"
                        onClick={onCall}
                    >
                        {t('showPhone') || 'Показать телефон'}
                    </Button>
                    
                    <Button
                        size="lg"
                        variant="secondary"
                        className="w-full text-lg h-12 bg-brand-primary-light text-brand-primary hover:bg-brand-primary-light/80 dark:bg-brand-primary/20 dark:text-brand-primary"
                        onClick={onMessage}
                    >
                        {t('writeMessage') || 'Написать'}
                    </Button>
                </div>

                {/* Online Status */}
                {author?.showOnline && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span>{t('writeOnline') || 'Напишите, пока пользователь в сети'}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
