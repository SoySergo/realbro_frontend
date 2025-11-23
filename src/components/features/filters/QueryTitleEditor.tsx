'use client';

import { useTranslations } from 'next-intl';
import { EditableTitle } from '@/components/ui/editable-title';
import { useSidebarStore } from '@/store/sidebarStore';

/**
 * Компонент редактирования названия запроса
 * Позволяет редактировать заголовок по клику на текст или иконку
 */
export function QueryTitleEditor() {
    const t = useTranslations('filters');
    const { activeQueryId, queries, updateQuery } = useSidebarStore();

    // Найти активный запрос
    const activeQuery = queries.find((q) => q.id === activeQueryId);

    const handleTitleChange = (newTitle: string) => {
        if (activeQueryId) {
            updateQuery(activeQueryId, { title: newTitle });
        }
    };

    return (
        <EditableTitle
            title={activeQuery ? activeQuery.title : t('title')}
            onTitleChange={handleTitleChange}
            placeholder={t('title')}
            editable={!!activeQuery}
        />
    );
}
