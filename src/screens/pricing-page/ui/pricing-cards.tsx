'use client';

import { useTranslations } from 'next-intl';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Check, X } from 'lucide-react';
import { Link } from '@/shared/config/routing';

type PlanFeature = {
    key: string;
    included: boolean;
    value?: string | number;
};

type Plan = {
    id: string;
    price: number | null;
    duration?: number;
    popular?: boolean;
    features: PlanFeature[];
};

const plans: Plan[] = [
    {
        id: 'free',
        price: null,
        features: [
            { key: 'database', included: true },
            { key: 'filtering', included: true },
            { key: 'tabs', included: true, value: 1 },
            { key: 'ownersLimited', included: true },
            { key: 'aiSearchNo', included: false },
        ],
    },
    {
        id: 'trial',
        price: 7,
        duration: 3,
        features: [
            { key: 'database', included: true },
            { key: 'filtering', included: true },
            { key: 'tabs', included: true, value: 3 },
            { key: 'owners', included: true, value: 2 },
            { key: 'aiSearch', included: true },
            { key: 'aiFilters', included: true, value: 3 },
        ],
    },
    {
        id: 'standard',
        price: 14,
        duration: 14,
        popular: true,
        features: [
            { key: 'database', included: true },
            { key: 'filtering', included: true },
            { key: 'tabs', included: true, value: 7 },
            { key: 'owners', included: true, value: 5 },
            { key: 'aiSearch', included: true },
            { key: 'aiFilters', included: true, value: 7 },
        ],
    },
    {
        id: 'maximum',
        price: 24,
        duration: 30,
        features: [
            { key: 'database', included: true },
            { key: 'filtering', included: true },
            { key: 'tabs', included: true, value: 15 },
            { key: 'owners', included: true, value: 10 },
            { key: 'aiSearch', included: true },
            { key: 'aiFilters', included: true, value: 15 },
        ],
    },
];

export function PricingCards() {
    const t = useTranslations('pricing');
    const tCommon = useTranslations('common');

    const renderFeature = (feature: PlanFeature) => {
        const { key, included, value } = feature;

        let text: string;
        switch (key) {
            case 'tabs':
                text = t('features.tabsUnlimited', { count: value ?? 1 });
                break;
            case 'owners':
                text = t('features.ownersMultiplier', { count: value ?? 1 });
                break;
            case 'aiFilters':
                text = t('features.aiFilters', { count: value ?? 1 });
                break;
            case 'ownersLimited':
                text = t('features.ownersLimited');
                break;
            case 'aiSearchNo':
                text = t('features.aiSearchNo');
                break;
            default:
                text = t(`features.${key}` as 'features.database' | 'features.filtering' | 'features.aiSearch');
        }

        return (
            <li key={key} className="flex items-start gap-3">
                {included ? (
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                ) : (
                    <X className="mt-0.5 h-5 w-5 shrink-0 text-text-tertiary" />
                )}
                <span
                    className={
                        included ? 'text-text-primary' : 'text-text-tertiary'
                    }
                >
                    {text}
                </span>
            </li>
        );
    };

    return (
        <div className="mt-16 grid gap-6 lg:grid-cols-4 md:grid-cols-2">
            {plans.map((plan) => (
                <Card
                    key={plan.id}
                    className={`relative flex flex-col ${
                        plan.popular
                            ? 'border-brand-primary shadow-lg ring-2 ring-brand-primary'
                            : ''
                    }`}
                >
                    {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-brand-primary text-white">
                                {t('popular')}
                            </Badge>
                        </div>
                    )}

                    <CardHeader>
                        <CardTitle className="text-xl">
                            {t(`plans.${plan.id}.name`)}
                        </CardTitle>
                        <CardDescription>
                            {t(`plans.${plan.id}.description`)}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                        <div className="mb-6">
                            {plan.price === null ? (
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-text-primary">
                                        {tCommon('free')}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-text-primary">
                                        {plan.price}
                                    </span>
                                    <span className="text-lg text-text-secondary">
                                        {tCommon('euro')}
                                    </span>
                                </div>
                            )}
                            {plan.duration && (
                                <p className="mt-1 text-sm text-text-secondary">
                                    {t('features.duration', {
                                        days: plan.duration,
                                    })}
                                </p>
                            )}
                        </div>

                        <ul className="space-y-3">
                            {plan.features.map(renderFeature)}
                        </ul>
                    </CardContent>

                    <CardFooter>
                        <Button
                            asChild
                            className={`w-full ${
                                plan.popular
                                    ? 'bg-brand-primary hover:bg-brand-primary-hover'
                                    : ''
                            }`}
                            variant={plan.popular ? 'default' : 'outline'}
                        >
                            <Link href="/search">{t('selectPlan')}</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
