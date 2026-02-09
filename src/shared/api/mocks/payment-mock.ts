/**
 * Мок обработки платежей
 * В продакшене — замена на реальный платёжный провайдер (Stripe, etc.)
 */

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

/**
 * Имитация обработки платежа
 * Возвращает промис с задержкой 1.5с (имитация обработки)
 */
export async function generateMockPayment(planId: string): Promise<PaymentResult> {
    // Имитация задержки обработки платежа
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Мок: всегда успешная оплата
    return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    };
}
