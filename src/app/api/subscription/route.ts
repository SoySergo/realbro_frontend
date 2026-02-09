import { NextRequest, NextResponse } from 'next/server';
import {
    generateMockSubscription,
    generateMockPlans,
    generateMockActivatePlan,
} from '@/shared/api/mocks/subscription-mock';

/**
 * GET /api/subscription
 * Получить текущую подписку пользователя и список планов
 *
 * В продакшене — замена на реальный бекенд:
 * - Авторизация через cookies/headers
 * - Запрос к БД за данными подписки
 */
export async function GET(request: NextRequest) {
    // Мок: берём userId из query или дефолтный
    const userId = request.nextUrl.searchParams.get('userId') || 'mock_user_1';

    const subscription = generateMockSubscription(userId);
    const plans = generateMockPlans();

    return NextResponse.json({
        data: {
            subscription,
            plans,
        },
    });
}

/**
 * POST /api/subscription
 * Активировать тарифный план (после успешной оплаты)
 *
 * В продакшене — замена на реальный бекенд:
 * - Проверка транзакции оплаты
 * - Обновление подписки в БД
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

    const subscription = generateMockActivatePlan(userId, planId);

    if (!subscription) {
        return NextResponse.json(
            { error: 'Invalid planId' },
            { status: 400 }
        );
    }

    return NextResponse.json({ data: subscription });
}
