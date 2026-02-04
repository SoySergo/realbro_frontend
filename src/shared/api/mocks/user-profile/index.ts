/**
 * User Profile API - Mock/Real API Switching
 *
 * Аналогично property-detail, этот модуль позволяет переключаться
 * между моками и реальным API через переменную окружения.
 *
 * Usage:
 *   - Set NEXT_PUBLIC_USE_MOCKS=true in .env.local for mock data
 *   - Set NEXT_PUBLIC_USE_MOCKS=false for real API
 */

import type {
    ExtendedUserProfile,
    SubscriptionPlan,
    PaymentHistory,
    UserSession,
    NotificationSettings,
    UserSubscription,
    PaymentMethod,
    ProfilePageData,
} from '@/entities/user';

// ============================================================================
// Configuration
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

// ============================================================================
// Mock Data Loaders
// ============================================================================

async function loadMockProfile(): Promise<ExtendedUserProfile> {
    const data = await import('./profile.json');
    // Приводим к unknown, затем к нужному типу для обхода строгой проверки
    return data.default as unknown as ExtendedUserProfile;
}

async function loadMockPlans(): Promise<SubscriptionPlan[]> {
    const data = await import('./plans.json');
    return data.default as SubscriptionPlan[];
}

async function loadMockPaymentHistory(): Promise<PaymentHistory[]> {
    const data = await import('./payment-history.json');
    return data.default as PaymentHistory[];
}

async function loadMockSessions(): Promise<UserSession[]> {
    const data = await import('./sessions.json');
    return data.default as UserSession[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Получить расширенный профиль пользователя
 */
export async function getExtendedProfile(): Promise<ExtendedUserProfile | null> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return loadMockProfile();
    }

    try {
        const response = await fetch(`${API_BASE}/users/me/profile`, {
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Profile API] Failed to get extended profile:', error);
        return null;
    }
}

/**
 * Получить доступные тарифные планы
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 50));
        return loadMockPlans();
    }

    try {
        const response = await fetch(`${API_BASE}/subscriptions/plans`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Profile API] Failed to get subscription plans:', error);
        return [];
    }
}

/**
 * Получить историю платежей
 */
export async function getPaymentHistory(limit: number = 10): Promise<PaymentHistory[]> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const history = await loadMockPaymentHistory();
        return history.slice(0, limit);
    }

    try {
        const response = await fetch(`${API_BASE}/payments/history?limit=${limit}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Profile API] Failed to get payment history:', error);
        return [];
    }
}

/**
 * Получить активные сессии пользователя
 */
export async function getUserSessions(): Promise<UserSession[]> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 50));
        return loadMockSessions();
    }

    try {
        const response = await fetch(`${API_BASE}/auth/sessions`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Profile API] Failed to get user sessions:', error);
        return [];
    }
}

/**
 * Обновить настройки уведомлений
 */
export async function updateNotificationSettings(
    settings: Partial<NotificationSettings>
): Promise<NotificationSettings | null> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const profile = await loadMockProfile();
        return {
            ...profile.settings.notifications,
            ...settings,
        };
    }

    try {
        const response = await fetch(`${API_BASE}/users/me/notifications`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Profile API] Failed to update notification settings:', error);
        return null;
    }
}

/**
 * Изменить подписку
 */
export async function changeSubscription(
    planId: string,
    paymentMethodId?: string
): Promise<UserSubscription | null> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            id: `sub_new_${Date.now()}`,
            planId: planId as UserSubscription['planId'],
            status: 'active',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            createdAt: new Date().toISOString(),
        };
    }

    try {
        const response = await fetch(`${API_BASE}/subscriptions/change`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ planId, paymentMethodId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Profile API] Failed to change subscription:', error);
        return null;
    }
}

/**
 * Отменить подписку
 */
export async function cancelSubscription(
    cancelAtPeriodEnd: boolean = true
): Promise<boolean> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return true;
    }

    try {
        const response = await fetch(`${API_BASE}/subscriptions/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ cancelAtPeriodEnd }),
        });

        return response.ok;
    } catch (error) {
        console.error('[Profile API] Failed to cancel subscription:', error);
        return false;
    }
}

/**
 * Завершить сессию по ID
 */
export async function terminateSession(sessionId: string): Promise<boolean> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return true;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/sessions/${sessionId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        return response.ok;
    } catch (error) {
        console.error('[Profile API] Failed to terminate session:', error);
        return false;
    }
}

/**
 * Добавить метод оплаты
 */
export async function addPaymentMethod(
    paymentData: { token: string }
): Promise<PaymentMethod | null> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            id: `pm_new_${Date.now()}`,
            type: 'card',
            isDefault: false,
            card: {
                brand: 'visa',
                last4: '1234',
                expiryMonth: 12,
                expiryYear: 2026,
            },
            createdAt: new Date().toISOString(),
        };
    }

    try {
        const response = await fetch(`${API_BASE}/payments/methods`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[Profile API] Failed to add payment method:', error);
        return null;
    }
}

/**
 * Удалить метод оплаты
 */
export async function removePaymentMethod(methodId: string): Promise<boolean> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return true;
    }

    try {
        const response = await fetch(`${API_BASE}/payments/methods/${methodId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        return response.ok;
    } catch (error) {
        console.error('[Profile API] Failed to remove payment method:', error);
        return false;
    }
}

// ============================================================================
// Batch Data Fetching
// ============================================================================

/**
 * Получить все данные для страницы профиля
 */
export async function getProfilePageData(): Promise<ProfilePageData | null> {
    const profile = await getExtendedProfile();

    if (!profile) {
        return null;
    }

    // Получаем остальные данные параллельно
    const [plans, paymentHistory, sessions] = await Promise.all([
        getSubscriptionPlans(),
        getPaymentHistory(),
        getUserSessions(),
    ]);

    return {
        profile,
        subscription: profile.subscription || null,
        plans,
        paymentHistory,
        paymentMethods: profile.paymentMethods || [],
        activeSessions: sessions.length,
    };
}

// Re-export types for convenience
export type {
    ExtendedUserProfile,
    SubscriptionPlan,
    PaymentHistory,
    UserSession,
    NotificationSettings,
    UserSubscription,
    PaymentMethod,
    ProfilePageData,
};
