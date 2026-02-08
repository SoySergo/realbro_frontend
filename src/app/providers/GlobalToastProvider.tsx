'use client';

import { useCallback } from 'react';
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
    const tProperty = useTranslations('property');
    const { toasts, removeToast } = useToastStore();
    const router = useRouter();

    const labels = {
        newProperty: t('toast.newProperty'),
        view: t('toast.view'),
        like: t('actions.like'),
        dislike: t('actions.dislike'),
        note: t('actions.save'),
        rooms: tProperty('roomsShort'),
    };

    const handleOpen = useCallback((property: Property) => {
        router.push(`/property/${property.id}`);
    }, [router]);

    const handleLike = useCallback((propertyId: string) => {
        console.log('Property liked from toast', { propertyId });
    }, []);

    const handleDislike = useCallback((propertyId: string) => {
        console.log('Property disliked from toast', { propertyId });
    }, []);

    const handleNote = useCallback((propertyId: string) => {
        console.log('Property note from toast', { propertyId });
    }, []);

    return (
        <PropertyToastContainer
            toasts={toasts}
            onDismiss={removeToast}
            onLike={handleLike}
            onDislike={handleDislike}
            onNote={handleNote}
            onOpen={handleOpen}
            labels={labels}
        />
    );
}
