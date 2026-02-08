'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/shared/config/routing';
import { PropertyToastContainer } from '@/shared/ui/property-toast';
import { useToastStore } from '@/features/chat-messages';
import type { Property } from '@/entities/property';

/**
 * Глобальный провайдер для отображения тостов с уведомлениями о новых объектах
 * Использует переводы для локализации
 */
export function GlobalToastProvider() {
    const t = useTranslations('chat');
    const { toasts, removeToast } = useToastStore();
    const router = useRouter();

    const labels = {
        newProperty: t('toast.newProperty'),
        view: t('toast.view'),
        like: t('actions.like'),
        dislike: t('actions.dislike'),
        note: t('actions.save'),
    };

    const handleOpen = (property: Property) => {
        router.push(`/property/${property.id}`);
    };

    return (
        <PropertyToastContainer
            toasts={toasts}
            onDismiss={removeToast}
            onOpen={handleOpen}
            labels={labels}
        />
    );
}
