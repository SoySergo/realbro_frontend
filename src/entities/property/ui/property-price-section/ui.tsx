'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import type { RentalConditions } from '@/entities/property/model/types';

interface PropertyPriceSectionProps {
    price: number;
    currency?: string;
    rentalConditions?: RentalConditions;
    noCommission?: boolean;
    className?: string;
}

export function PropertyPriceSection({
    price,
    currency = '€',
    rentalConditions,
    noCommission,
    className
}: PropertyPriceSectionProps) {
    const t = useTranslations('propertyDetail');

    const deposit = rentalConditions?.deposit ?? 0;
    const commission = noCommission ? 0 : (rentalConditions?.commission ?? 0);
    const utilitiesIncluded = rentalConditions?.utilitiesIncluded ?? false;
    const utilitiesAmount = rentalConditions?.utilitiesAmount ?? 0;

    // Calculate total at move-in
    const totalAtStart = price + deposit + (rentalConditions?.commissionType === 'fixed' ? commission : (price * commission / 100));

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('ru-RU').format(amount);
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Main price */}
            <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                    {formatPrice(price)} {currency}
                </span>
                <span className="text-muted-foreground">
                    {t('perMonth')}
                </span>
            </div>

            {/* Utilities info */}
            <div className="text-sm text-muted-foreground">
                {utilitiesIncluded ? (
                    <span className="text-green-600 dark:text-green-400">
                        {t('utilitiesIncluded')}
                    </span>
                ) : (
                    <span>
                        {t('utilitiesNotIncluded')}
                        {utilitiesAmount > 0 && ` (~${formatPrice(utilitiesAmount)} ${currency})`}
                    </span>
                )}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-border pt-4 space-y-3">
                {/* Deposit */}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('deposit')}</span>
                    <span className="font-medium">
                        {deposit > 0 ? `${formatPrice(deposit)} ${currency}` : '—'}
                    </span>
                </div>

                {/* Commission */}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('commission')}</span>
                    {noCommission || commission === 0 ? (
                        <span className="font-medium text-green-600 dark:text-green-400">
                            {t('noCommission')}
                        </span>
                    ) : (
                        <span className="font-medium">
                            {rentalConditions?.commissionType === 'percent' 
                                ? `${commission}%` 
                                : `${formatPrice(commission)} ${currency}`
                            }
                        </span>
                    )}
                </div>

                {/* Total */}
                <div className="flex justify-between pt-3 border-t border-border">
                    <span className="font-medium">{t('totalAtStart')}</span>
                    <span className="text-lg font-bold text-primary">
                        {formatPrice(totalAtStart)} {currency}
                    </span>
                </div>
            </div>
        </div>
    );
}
