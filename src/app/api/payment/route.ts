import { NextRequest, NextResponse } from 'next/server';
import { generateMockPayment } from '@/shared/api/mocks/payment-mock';
import { generateMockActivatePlan } from '@/shared/api/mocks/subscription-mock';

/**
 * POST /api/payment
 * Обработка оплаты тарифного плана
 *
 * В продакшене — замена на реальный платёжный провайдер:
 * - Создание сессии оплаты (Stripe Checkout, etc.)
 * - Webhook для подтверждения оплаты
 * - Активация подписки после подтверждения
 */
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { userId = 'mock_user_1', planId } = body;

    if (!planId) {
        return NextResponse.json(
            { error: 'planId is required' },
            { status: 400 }
        );
    }

    // Имитация обработки платежа (1.5с задержка)
    const paymentResult = await generateMockPayment(planId);

    if (!paymentResult.success) {
        return NextResponse.json(
            { error: paymentResult.error || 'Payment failed' },
            { status: 402 }
        );
    }

    // После успешной оплаты — активируем план
    const subscription = generateMockActivatePlan(userId, planId);

    if (!subscription) {
        return NextResponse.json(
            { error: 'Failed to activate plan' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        data: {
            transactionId: paymentResult.transactionId,
            subscription,
        },
    });
}
