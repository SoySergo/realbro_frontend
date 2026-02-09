/**
 * Мок активации ИИ-агента
 * В продакшене — замена на реальный бекенд
 */

// Настройки ИИ-агента для вкладки
export interface AiAgentSettings {
    notifyFrom: number; // Час начала уведомлений (0-23)
    notifyTo: number;   // Час конца уведомлений (0-23)
    frequency: '30min' | '1h' | '2h' | '4h';
    offlineNotify: boolean; // Уведомлять офлайн
}

// Результат активации
export interface AiAgentActivation {
    success: boolean;
    agentId?: string;
    error?: 'no_subscription' | 'limit_reached';
}

// In-memory хранилище агентов (queryId → настройки)
const mockAgents = new Map<string, {
    agentId: string;
    queryId: string;
    settings: AiAgentSettings;
    activatedAt: string;
}>();

/**
 * Активировать ИИ-агента для поисковой вкладки
 */
export function generateMockAiAgentActivation(
    queryId: string,
    settings: AiAgentSettings,
    hasSubscription: boolean
): AiAgentActivation {
    if (!hasSubscription) {
        return { success: false, error: 'no_subscription' };
    }

    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    mockAgents.set(queryId, {
        agentId,
        queryId,
        settings,
        activatedAt: new Date().toISOString(),
    });

    return { success: true, agentId };
}

/**
 * Получить настройки агента для вкладки
 */
export function generateMockAiAgentSettings(queryId: string) {
    return mockAgents.get(queryId) ?? null;
}
