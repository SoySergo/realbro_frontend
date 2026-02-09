import { NextRequest, NextResponse } from 'next/server';
import {
    generateMockAiAgentActivation,
    type AiAgentSettings,
} from '@/shared/api/mocks/ai-agent-mock';
import { generateMockSubscription } from '@/shared/api/mocks/subscription-mock';

/**
 * POST /api/ai-agent/activate
 * Активировать ИИ-агента для поисковой вкладки
 *
 * В продакшене — замена на реальный бекенд:
 * - Проверка авторизации и тарифа
 * - Создание задачи агента в очереди
 * - Привязка к queryId
 */
export async function POST(request: NextRequest) {
    const body = await request.json();
    const {
        userId = 'mock_user_1',
        queryId,
        settings,
    } = body as {
        userId?: string;
        queryId: string;
        settings: AiAgentSettings;
    };

    if (!queryId || !settings) {
        return NextResponse.json(
            { error: 'queryId and settings are required' },
            { status: 400 }
        );
    }

    // Проверяем подписку пользователя
    const subscription = generateMockSubscription(userId);
    const hasSubscription = subscription.aiAgentEnabled;

    const result = generateMockAiAgentActivation(queryId, settings, hasSubscription);

    if (!result.success) {
        return NextResponse.json(
            { data: result },
            { status: 403 }
        );
    }

    return NextResponse.json({ data: result }, { status: 201 });
}
