'use client';

import { useAuthInit } from '@/features/auth';

/**
 * Провайдер для инициализации системы авторизации
 * Запускает проверку и обновление токенов при загрузке приложения
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Инициализируем auth при монтировании
    useAuthInit();

    return <>{children}</>;
}
