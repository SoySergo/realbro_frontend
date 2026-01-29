'use client';

import { Phone, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';
import type { RentalConditions, PropertyAuthor } from '../../model/types';
import { PropertyAgentCard } from '../property-agent-card';

interface PropertyPriceCardProps {
    price: number;
    currency?: string;
    rentalConditions?: RentalConditions;
    noCommission?: boolean;
    author?: PropertyAuthor;
    onCall?: () => void;
    onMessage?: () => void;
    onToggleFavorite?: () => void;
    onShare?: () => void;
    isFavorite?: boolean;
    className?: string;
    actionButtons?: React.ReactNode;
}

export function PropertyPriceCard({
    price,
    currency = '€',
    rentalConditions,
    noCommission,
    author,
    onCall,
    onMessage,
    onToggleFavorite,
    onShare,
    isFavorite,
    className,
    actionButtons
}: PropertyPriceCardProps) {
    const t = useTranslations('propertyDetail');

    const deposit = rentalConditions?.deposit ?? 0;
    const commission = noCommission ? 0 : (rentalConditions?.commission ?? 0);
    const utilitiesIncluded = rentalConditions?.utilitiesIncluded ?? false;
    const utilitiesAmount = rentalConditions?.utilitiesAmount ?? 0;
    
    // Total at start calculation matches the previous logic
    const totalAtStart = price + deposit + (rentalConditions?.commissionType === 'fixed' ? commission : (price * commission / 100));

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('ru-RU').format(Math.round(amount));
    };

    return (
        <Card className={cn('p-6 shadow-lg border-border/60 sticky top-24', className)}>
            <div className="space-y-6">
                {/* Price Header */}
                <div className="space-y-1">
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">
                            {formatPrice(price)} {currency}
                        </span>
                        <span className="text-muted-foreground mb-1">
                            / {t('perMonth')}
                        </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                        {utilitiesIncluded ? (
                            <span className="text-green-600">{t('utilitiesIncluded')}</span>
                        ) : (
                            <span>
                                {t('utilitiesNotIncluded')}
                                {utilitiesAmount > 0 && ` (~${formatPrice(utilitiesAmount)} ${currency})`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Primary Actions */}
                <div className="grid gap-3">
                    <Button 
                        size="lg" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg h-12"
                        onClick={onCall}
                    >
                        <Phone className="w-5 h-5 mr-2" />
                        {t('showPhone')}
                    </Button>
                    
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="w-full text-lg h-12"
                        onClick={onMessage}
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        {t('writeMessage')}
                    </Button>
                </div>

                {/* Agent Info (Inline or specific slot) */}
                {author && (
                    <div className="pt-4 border-t border-border">
                        <PropertyAgentCard 
                            agent={author} 
                            compact 
                        />
                    </div>
                )}

                {/* Financial Breakdown (Cian style small text) */}
                <div className="space-y-2 pt-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>{t('deposit')}</span>
                        <span className="text-foreground">{deposit > 0 ? `${formatPrice(deposit)} ${currency}` : '—'}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>{t('commission')}</span>
                        <span className={noCommission ? 'text-green-600' : 'text-foreground'}>
                            {noCommission 
                                ? t('noCommission') 
                                : (rentalConditions?.commissionType === 'percent' ? `${commission}%` : `${formatPrice(commission)} ${currency}`)}
                        </span>
                    </div>
                </div>

                {/* Secondary Actions (Share/Favorite) or Custom Slot */}
                <div className="pt-2">
                    {actionButtons ? (
                        actionButtons
                    ) : (
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn("text-muted-foreground hover:text-red-500", isFavorite && "text-red-500")}
                                onClick={onToggleFavorite}
                            >
                                <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current")} />
                                {isFavorite ? t('inFavorites') : t('addToFavorites')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-blue-500"
                                onClick={onShare}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                {t('share')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
