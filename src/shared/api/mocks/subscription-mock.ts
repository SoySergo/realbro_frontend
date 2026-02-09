import type { SubscriptionPlan } from '@/widgets/sidebar/model/types';

// Конфигурация тарифных планов
export interface MockSubscriptionConfig {
    locale?: 'en' | 'ru' | 'es' | 'ca' | 'fr' | 'it';
}

// Тарифный план
export interface PlanDetails {
    id: string;
    plan: SubscriptionPlan;
    maxTabs: number;
    aiAgentEnabled: boolean;
    price: number;
    currency: string;
    period: 'month' | 'year';
}

// Данные подписки пользователя
export interface UserSubscriptionData {
    plan: SubscriptionPlan;
    maxTabs: number;
    aiAgentEnabled: boolean;
    expiresAt: string | null;
    currentTabsCount: number;
}

// Доступные планы
const PLANS: PlanDetails[] = [
    {
        id: 'plan_free',
        plan: 'free',
        maxTabs: 1,
        aiAgentEnabled: false,
        price: 0,
        currency: 'EUR',
        period: 'month',
    },
    {
        id: 'plan_basic',
        plan: 'basic',
        maxTabs: 5,
        aiAgentEnabled: true,
        price: 9.99,
        currency: 'EUR',
        period: 'month',
    },
    {
        id: 'plan_pro',
        plan: 'pro',
        maxTabs: 20,
        aiAgentEnabled: true,
        price: 24.99,
        currency: 'EUR',
        period: 'month',
    },
];

// In-memory хранилище подписок (userId → subscription)
const mockSubscriptions = new Map<string, UserSubscriptionData>();

/**
 * Инициализация дефолтной подписки для пользователя
 */
function ensureSubscription(userId: string): UserSubscriptionData {
    if (!mockSubscriptions.has(userId)) {
        mockSubscriptions.set(userId, {
            plan: 'free',
            maxTabs: 1,
            aiAgentEnabled: false,
            expiresAt: null,
            currentTabsCount: 0,
        });
    }
    return mockSubscriptions.get(userId)!;
}

/**
 * Получить текущую подписку пользователя
 */
export function generateMockSubscription(userId: string): UserSubscriptionData {
    return ensureSubscription(userId);
}

/**
 * Получить список доступных планов
 */
export function generateMockPlans(): PlanDetails[] {
    return PLANS;
}

/**
 * Проверить лимит вкладок
 */
export function generateMockTabLimitCheck(
    userId: string,
    currentTabsCount: number
): {
    allowed: boolean;
    currentCount: number;
    maxCount: number;
    plan: SubscriptionPlan;
} {
    const sub = ensureSubscription(userId);
    sub.currentTabsCount = currentTabsCount;

    return {
        allowed: currentTabsCount < sub.maxTabs,
        currentCount: currentTabsCount,
        maxCount: sub.maxTabs,
        plan: sub.plan,
    };
}

/**
 * Активировать тарифный план (после оплаты)
 */
export function generateMockActivatePlan(
    userId: string,
    planId: string
): UserSubscriptionData | null {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return null;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (plan.period === 'year' ? 12 : 1));

    const subscription: UserSubscriptionData = {
        plan: plan.plan,
        maxTabs: plan.maxTabs,
        aiAgentEnabled: plan.aiAgentEnabled,
        expiresAt: expiresAt.toISOString(),
        currentTabsCount: mockSubscriptions.get(userId)?.currentTabsCount ?? 0,
    };

    mockSubscriptions.set(userId, subscription);
    return subscription;
}
