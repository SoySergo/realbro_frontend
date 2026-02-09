import { NextRequest, NextResponse } from 'next/server';
import { generateMockTabLimitCheck } from '@/shared/api/mocks/subscription-mock';

/**
 * GET /api/subscription/check
 * Проверить, может ли пользователь создать новую вкладку
 *
 * В продакшене — замена на реальный бекенд:
 * - Авторизация через cookies/headers
 * - Подсчёт текущих вкладок в БД
 * - Проверка лимита по тарифу
 */
export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId') || 'mock_user_1';
    const currentCount = parseInt(
        request.nextUrl.searchParams.get('currentCount') || '0',
        10
    );

    const result = generateMockTabLimitCheck(userId, currentCount);

    return NextResponse.json({ data: result });
}
