'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/shared/config/routing';
import { PropertyToastContainer } from '@/shared/ui/property-toast';
import { useToastStore } from '@/features/chat-messages';
import { useUserActionsStore } from '@/entities/user-actions';
import { setPropertyReaction } from '@/entities/user-actions/api';
import type { PropertyChatCard } from '@/entities/property/model/card-types';

/**
 * Глобальный провайдер для отображения тостов с уведомлениями о новых объектах
 * Интегрирован с централизованной системой действий пользователя
 */
export function GlobalToastProvider() {
    const t = useTranslations('chat');
    const tProperty = useTranslations('property');
    const { toasts, removeToast } = useToastStore();
    const router = useRouter();

    // Получаем методы из store
    const { getReaction, setReaction } = useUserActionsStore();

    const labels = {
        newProperty: t('toast.newProperty'),
        view: t('toast.view'),
        like: t('actions.like'),
        dislike: t('actions.dislike'),
        note: tProperty('addNote'),
        rooms: tProperty('roomsShort'),
    };

    const handleOpen = useCallback((property: PropertyChatCard) => {
        router.push(`/property/${property.slug || property.id}`);
    }, [router]);

    // Централизованные обработчики действий
    const handleLike = useCallback(async (propertyId: string) => {
        const currentReaction = getReaction(propertyId);
        const newReaction = currentReaction === 'like' ? null : 'like';

        // Оптимистичное обновление
        setReaction(propertyId, newReaction);

        // Синхронизация с бекендом
        try {
            await setPropertyReaction(propertyId, newReaction);
        } catch (error) {
            console.error('Failed to sync like', error);
            // Откатываем при ошибке
            setReaction(propertyId, currentReaction);
        }
    }, [getReaction, setReaction]);

    const handleDislike = useCallback(async (propertyId: string) => {
        const currentReaction = getReaction(propertyId);
        const newReaction = currentReaction === 'dislike' ? null : 'dislike';

        // Оптимистичное обновление
        setReaction(propertyId, newReaction);

        // Синхронизация с бекендом
        try {
            await setPropertyReaction(propertyId, newReaction);
        } catch (error) {
            console.error('Failed to sync dislike', error);
            // Откатываем при ошибке
            setReaction(propertyId, currentReaction);
        }
    }, [getReaction, setReaction]);

    const handleNote = useCallback((propertyId: string) => {
        // TODO: Открыть модалку заметки
        console.log('Open note modal for property', { propertyId });
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
