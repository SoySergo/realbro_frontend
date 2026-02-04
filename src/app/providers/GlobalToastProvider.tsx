'use client';

import { useTranslations } from 'next-intl';
import { PropertyToastContainer } from '@/shared/ui/property-toast';
import { useToastStore } from '@/features/chat-messages';

/**
 * Глобальный провайдер для отображения тостов с уведомлениями о новых объектах
 * Использует переводы для локализации
 */
export function GlobalToastProvider() {
    const t = useTranslations('chat');
    const { toasts, removeToast } = useToastStore();

    const labels = {
        newProperty: t('toast.newProperty'),
        view: t('toast.view'),
    };

    return (
        <PropertyToastContainer
            toasts={toasts}
            onDismiss={removeToast}
            labels={labels}
        />
    );
}
