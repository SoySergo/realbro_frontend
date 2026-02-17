/**
 * Subscriptions API — подписки и тарифные планы
 *
 * Управление подписками пользователя.
 * Все эндпоинты требуют авторизации.
 */

import { apiClient } from './lib/api-client';

// === Типы ===

export interface PlanFeatures {
    searchTabs: number;
    aiFilters: number;
    ownerAccess: boolean;
    ownerAccessMultiplier: number;
    durationDays: number;
}

export interface PlanResponse {
    id: string;
    name: string;
    price: number;
    currency: string;
    period: string;
    features: PlanFeatures;
    isActive: boolean;
    sortPosition: number;
}

export interface SubscriptionResponse {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'canceled' | 'expired' | 'past_due';
    externalId?: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChangePlanRequest {
    planId: string;
    paymentMethodId?: string;
}

export interface CancelSubscriptionApiRequest {
    reason?: string;
    cancelAtPeriodEnd?: boolean;
}

// === API ===

/**
 * Получить список тарифных планов
 */
export function getPlans(): Promise<PlanResponse[]> {
    return apiClient.get<PlanResponse[]>('/subscription/plans');
}

/**
 * Получить текущую подписку пользователя
 */
export function getCurrentSubscription(): Promise<SubscriptionResponse> {
    return apiClient.get<SubscriptionResponse>('/subscription/current');
}

/**
 * Сменить тарифный план
 */
export function changePlan(data: ChangePlanRequest): Promise<SubscriptionResponse> {
    return apiClient.post<SubscriptionResponse>('/subscription/change', data);
}

/**
 * Отменить подписку
 */
export function cancelSubscription(data?: CancelSubscriptionApiRequest): Promise<SubscriptionResponse> {
    return apiClient.post<SubscriptionResponse>('/subscription/cancel', data);
}
