'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, CreditCard, CheckCircle, MessageCircle, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { NotificationSettings } from '@/features/chat-settings/ui/notification-settings';
import { useChatSettingsStore } from '@/features/chat-settings/model/store';
import { useSidebarStore } from '@/widgets/sidebar/model';
import { useToast } from '@/shared/ui/toast';
import { Link } from '@/shared/config/routing';

type AiAgentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    queryId: string | null;
};

type FlowStep = 'activating' | 'pricing' | 'paying' | 'settings' | 'complete';

const plans = [
    { id: 'basic' as const, maxTabs: 5, price: 9.99 },
    { id: 'pro' as const, maxTabs: 20, price: 19.99 },
];

export function AiAgentDialog({ open, onOpenChange, queryId }: AiAgentDialogProps) {
    const t = useTranslations('sidebar');
    const tSub = useTranslations('subscription');
    const { showToast } = useToast();
    const { setAiAgent } = useSidebarStore();
    const { settings } = useChatSettingsStore();
    const [step, setStep] = useState<FlowStep>('activating');
    const [isProcessing, setIsProcessing] = useState(false);

    // Начальная активация при открытии
    const handleActivate = async () => {
        if (!queryId) return;

        setStep('activating');
        setIsProcessing(true);

        try {
            const res = await fetch('/api/ai-agent/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queryId,
                    settings: {
                        notifyFrom: settings.notificationStartHour,
                        notifyTo: settings.notificationEndHour,
                        frequency: settings.notificationFrequency,
                        offlineNotify: true,
                    },
                }),
            });
            const data = await res.json();

            if (data.error === 'no_subscription') {
                setStep('pricing');
            } else if (data.success) {
                setAiAgent(queryId, 'searching');
                setStep('complete');
            }
        } catch (error) {
            console.error('Failed to activate AI agent', error);
            showToast('Failed to activate AI agent', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Оплата тарифа
    const handlePayment = async (planId: string) => {
        setStep('paying');
        setIsProcessing(true);

        try {
            const res = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            });
            const data = await res.json();

            if (data.success) {
                showToast(tSub('paymentSuccess'), 'success');
                setStep('settings');
            }
        } catch (error) {
            console.error('Payment failed', error);
            showToast('Payment failed', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Сохранение настроек и активация агента
    const handleSaveSettings = async () => {
        if (!queryId) return;

        setIsProcessing(true);
        try {
            const res = await fetch('/api/ai-agent/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queryId,
                    settings: {
                        notifyFrom: settings.notificationStartHour,
                        notifyTo: settings.notificationEndHour,
                        frequency: settings.notificationFrequency,
                        offlineNotify: true,
                    },
                }),
            });
            const data = await res.json();

            if (data.success) {
                setAiAgent(queryId, 'searching');
                setStep('complete');
            }
        } catch (error) {
            console.error('Failed to activate AI agent', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Сброс при открытии
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            handleActivate();
        } else {
            setStep('activating');
            setIsProcessing(false);
        }
        onOpenChange(newOpen);
    };

    // Метки для компонента NotificationSettings
    const notificationLabels = {
        activeHours: 'Active hours',
        from: 'From',
        to: 'To',
        frequency: 'Frequency',
        immediately: 'Immediately',
        every15min: 'Every 15 min',
        every30min: 'Every 30 min',
        every1hour: 'Every hour',
        every2hours: 'Every 2 hours',
        agentStatus: 'Agent status',
        active: 'Active',
        paused: 'Paused',
        runningFor: 'Running for {days} days',
        totalFound: '{count} found',
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                {/* Шаг: Выбор тарифа */}
                {step === 'pricing' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{tSub('choosePlan')}</DialogTitle>
                            <DialogDescription>{tSub('noSubscription')}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-4">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => handlePayment(plan.id)}
                                    disabled={isProcessing}
                                    className={cn(
                                        'w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer',
                                        'hover:border-brand-primary hover:bg-brand-primary-light transition-colors',
                                        'disabled:opacity-50 disabled:cursor-not-allowed'
                                    )}
                                >
                                    <div>
                                        <div className="font-medium text-text-primary">
                                            {tSub(plan.id)}
                                        </div>
                                        <div className="text-sm text-text-secondary">
                                            {plan.maxTabs} tabs
                                        </div>
                                    </div>
                                    <div className="text-lg font-bold text-brand-primary">
                                        €{plan.price}/mo
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Шаг: Обработка оплаты */}
                {step === 'paying' && (
                    <div className="flex flex-col items-center py-8 gap-4">
                        <CreditCard className="w-12 h-12 text-brand-primary animate-pulse" />
                        <p className="text-text-secondary">Processing payment...</p>
                    </div>
                )}

                {/* Шаг: Активация (загрузка) */}
                {step === 'activating' && (
                    <div className="flex flex-col items-center py-8 gap-4">
                        <Bot className="w-12 h-12 text-brand-primary animate-pulse" />
                        <p className="text-text-secondary">{t('agentSearching')}</p>
                    </div>
                )}

                {/* Шаг: Настройки уведомлений */}
                {step === 'settings' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t('assignAiAgent')}</DialogTitle>
                        </DialogHeader>
                        <NotificationSettings labels={notificationLabels} className="py-4" />
                        <DialogFooter>
                            <Button
                                onClick={handleSaveSettings}
                                disabled={isProcessing}
                                className="w-full"
                            >
                                {t('saveFilter')}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* Шаг: Завершение */}
                {step === 'complete' && (
                    <>
                        <div className="flex flex-col items-center py-6 gap-3">
                            <CheckCircle className="w-12 h-12 text-success" />
                            <p className="text-sm text-text-secondary text-center">
                                {t('agentNotifications', {
                                    startHour: `${String(settings.notificationStartHour).padStart(2, '0')}:00`,
                                    endHour: `${String(settings.notificationEndHour).padStart(2, '0')}:00`,
                                })}
                            </p>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-col gap-2">
                            <Link href="/chat" className="w-full">
                                <Button variant="default" className="w-full gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    {t('goToChat')}
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="w-full gap-2"
                            >
                                <Search className="w-4 h-4" />
                                {t('continueSearch')}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
