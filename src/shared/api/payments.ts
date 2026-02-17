/**
 * Payments API — платежи и способы оплаты
 *
 * Управление платёжными методами и историей платежей.
 * Все эндпоинты требуют авторизации.
 */

import { apiClient } from './lib/api-client';

// === Типы ===

export interface PaymentMethodResponse {
    id: string;
    userId: string;
    type: 'card' | 'paypal' | 'bank_transfer';
    isDefault: boolean;
    externalId?: string;
    cardData?: Record<string, unknown>;
    paypalData?: Record<string, unknown>;
    createdAt: string;
}

export interface AddPaymentMethodRequest {
    type: 'card' | 'paypal' | 'bank_transfer';
    isDefault?: boolean;
    cardData?: Record<string, unknown>;
    paypalData?: Record<string, unknown>;
}

export interface PaymentResponse {
    id: string;
    userId: string;
    subscriptionId?: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'pending' | 'failed' | 'refunded';
    description?: string;
    planId?: string;
    paymentMethodId?: string;
    externalId?: string;
    invoiceUrl?: string;
    createdAt: string;
}

export interface PaymentsListResponse {
    data: PaymentResponse[];
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
}

// === API ===

/**
 * Получить историю платежей
 */
export function getPaymentHistory(params?: {
    page?: number;
    perPage?: number;
}): Promise<PaymentsListResponse> {
    return apiClient.get<PaymentsListResponse>('/payments/history', { params });
}

/**
 * Получить список способов оплаты
 */
export function getPaymentMethods(): Promise<PaymentMethodResponse[]> {
    return apiClient.get<PaymentMethodResponse[]>('/payments/methods');
}

/**
 * Добавить способ оплаты
 */
export function addPaymentMethod(data: AddPaymentMethodRequest): Promise<PaymentMethodResponse> {
    return apiClient.post<PaymentMethodResponse>('/payments/methods', data);
}

/**
 * Удалить способ оплаты
 */
export function deletePaymentMethod(id: string): Promise<void> {
    return apiClient.delete<void>(`/payments/methods/${id}`);
}
