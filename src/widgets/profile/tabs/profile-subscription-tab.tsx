'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
    CreditCard, 
    Check, 
    X, 
    Clock, 
    ArrowUpRight,
    Receipt,
    Loader2
} from 'lucide-react';
import type { 
    UserSubscription, 
    SubscriptionPlan, 
    PaymentHistory, 
    PaymentMethod 
} from '@/entities/user';
import { changeSubscription, cancelSubscription } from '@/shared/api/mocks/user-profile';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
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

type ProfileSubscriptionTabProps = {
    subscription: UserSubscription | null;
    plans: SubscriptionPlan[];
    paymentHistory: PaymentHistory[];
    paymentMethods: PaymentMethod[];
    onUpdate: () => void;
};

// Утилита форматирования цены
const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Таб подписки и платежей
 * Отображает текущую подписку, доступные планы и историю платежей
 */
export function ProfileSubscriptionTab({
    subscription,
    plans,
    paymentHistory,
    paymentMethods,
    onUpdate,
}: ProfileSubscriptionTabProps) {
    const t = useTranslations('profile.subscription');
    const tPayments = useTranslations('profile.payments');
    const tPricing = useTranslations('pricing');
    const tCommon = useTranslations('common');

    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    // Текущий план
    const currentPlan = plans.find(p => p.id === subscription?.planId) || plans[0];

    // Форматирование даты
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Смена плана
    const handleChangePlan = async (planId: string) => {
        setIsChangingPlan(true);
        try {
            await changeSubscription(planId);
            onUpdate();
        } catch (err) {
            console.error('Failed to change plan:', err);
        } finally {
            setIsChangingPlan(false);
        }
    };

    // Отмена подписки
    const handleCancelSubscription = async () => {
        setIsCanceling(true);
        try {
            await cancelSubscription(true);
            onUpdate();
        } catch (err) {
            console.error('Failed to cancel subscription:', err);
        } finally {
            setIsCanceling(false);
        }
    };

    // Статус подписки
    const getStatusBadge = (status: UserSubscription['status']) => {
        const variants: Record<string, { variant: 'default' | 'success' | 'destructive' | 'secondary'; label: string }> = {
            active: { variant: 'success', label: t('active') },
            canceled: { variant: 'secondary', label: t('canceled') },
            expired: { variant: 'destructive', label: t('expired') },
            past_due: { variant: 'destructive', label: t('pastDue') },
        };
        const config = variants[status] || variants.active;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    // Статус платежа
    const getPaymentStatusBadge = (status: PaymentHistory['status']) => {
        const variants: Record<string, { variant: 'default' | 'success' | 'destructive' | 'secondary'; label: string }> = {
            succeeded: { variant: 'success', label: tPayments('succeeded') },
            pending: { variant: 'secondary', label: tPayments('pending') },
            failed: { variant: 'destructive', label: tPayments('failed') },
            refunded: { variant: 'secondary', label: tPayments('refunded') },
        };
        const config = variants[status] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Текущая подписка */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {t('currentPlan')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {subscription ? (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold text-text-primary">
                                            {tPricing(`plans.${currentPlan.id}.name`)}
                                        </h3>
                                        {getStatusBadge(subscription.status)}
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1">
                                        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                                            <>{t('renewsOn')} {formatDate(subscription.currentPeriodEnd)}</>
                                        )}
                                        {subscription.cancelAtPeriodEnd && (
                                            <>{t('canceledOn')} {formatDate(subscription.currentPeriodEnd)}</>
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-text-primary">
                                        {currentPlan.price === 0 ? tCommon('free') : formatPrice(currentPlan.price, currentPlan.currency)}
                                    </p>
                                    {currentPlan.price > 0 && (
                                        <p className="text-sm text-text-secondary">{tCommon('perMonth')}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Возможности плана */}
                            <div>
                                <h4 className="font-medium text-text-primary mb-3">{t('features')}</h4>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <FeatureItem 
                                        label={t('searchTabs')} 
                                        value={currentPlan.features.searchTabs.toString()} 
                                    />
                                    <FeatureItem 
                                        label={t('aiFilters')} 
                                        value={currentPlan.features.aiFilters > 0 ? currentPlan.features.aiFilters.toString() : '—'} 
                                    />
                                    <FeatureItem 
                                        label={t('ownerAccess')} 
                                        value={currentPlan.features.ownerAccess ? (
                                            currentPlan.features.ownerAccessMultiplier 
                                                ? `×${currentPlan.features.ownerAccessMultiplier}` 
                                                : <Check className="w-4 h-4 text-success" />
                                        ) : <X className="w-4 h-4 text-text-tertiary" />}
                                    />
                                </div>
                            </div>

                            {/* Кнопки действий */}
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" onClick={() => setIsChangingPlan(true)}>
                                    {t('changePlan')}
                                </Button>
                                {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" className="text-text-secondary">
                                                {t('cancelSubscription')}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('cancelConfirmTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('cancelConfirmDescription')}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={handleCancelSubscription}
                                                    className="bg-error hover:bg-error/90"
                                                    disabled={isCanceling}
                                                >
                                                    {isCanceling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                    {t('cancelAtPeriodEnd')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-text-secondary mb-4">{t('noPlan')}</p>
                            <Button onClick={() => setIsChangingPlan(true)}>
                                {t('selectPlan')}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Выбор плана (если активен) */}
            {isChangingPlan && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('comparePlans')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {plans.map((plan) => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    isCurrentPlan={subscription?.planId === plan.id}
                                    onSelect={() => handleChangePlan(plan.id)}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* История платежей */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        {tPayments('title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {paymentHistory.length > 0 ? (
                        <div className="space-y-3">
                            {paymentHistory.map((payment) => (
                                <div 
                                    key={payment.id}
                                    className={cn(
                                        "flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg",
                                        "bg-background-secondary"
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-text-primary truncate">
                                            {payment.description}
                                        </p>
                                        <p className="text-sm text-text-secondary">
                                            {formatDate(payment.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getPaymentStatusBadge(payment.status)}
                                        <span className="font-mono font-medium text-text-primary">
                                            {formatPrice(payment.amount, payment.currency)}
                                        </span>
                                        {payment.invoiceUrl && (
                                            <Button variant="ghost" size="icon-sm" asChild>
                                                <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-text-secondary py-8">
                            {tPayments('noPayments')}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Компонент элемента функции плана
function FeatureItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-2 rounded bg-background-secondary">
            <span className="text-sm text-text-secondary">{label}</span>
            <span className="font-medium text-text-primary">{value}</span>
        </div>
    );
}

// Компонент карточки плана
function PlanCard({ 
    plan, 
    isCurrentPlan, 
    onSelect 
}: { 
    plan: SubscriptionPlan; 
    isCurrentPlan: boolean; 
    onSelect: () => void;
}) {
    const t = useTranslations('profile.subscription');
    const tPricing = useTranslations('pricing');
    const tCommon = useTranslations('common');

    return (
        <div className={cn(
            "p-4 rounded-lg border-2 transition-colors",
            isCurrentPlan 
                ? "border-brand-primary bg-brand-primary-light" 
                : "border-border hover:border-brand-primary/50"
        )}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-text-primary">
                    {tPricing(`plans.${plan.id}.name`)}
                </h3>
                {isCurrentPlan && (
                    <Badge variant="primary">{t('currentPlanBadge')}</Badge>
                )}
            </div>
            <p className="text-2xl font-bold text-text-primary mb-4">
                {plan.price === 0 ? tCommon('free') : formatPrice(plan.price, plan.currency)}
                {plan.price > 0 && <span className="text-sm font-normal text-text-secondary">{tCommon('perMonth')}</span>}
            </p>
            <div className="space-y-2 text-sm text-text-secondary mb-4">
                <p>✓ {plan.features.searchTabs} {t('searchTabs')}</p>
                {plan.features.aiFilters > 0 && (
                    <p>✓ {plan.features.aiFilters} {t('aiFilters')}</p>
                )}
                {plan.features.ownerAccess && (
                    <p>✓ {t('ownerAccess')}</p>
                )}
            </div>
            <Button 
                variant={isCurrentPlan ? "outline" : "default"}
                className="w-full"
                onClick={onSelect}
                disabled={isCurrentPlan}
            >
                {isCurrentPlan ? t('currentPlanBadge') : t('selectPlan')}
            </Button>
        </div>
    );
}
