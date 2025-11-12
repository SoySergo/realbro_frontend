'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Pencil, Check } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebarStore';

/**
 * Компонент редактирования названия запроса
 * Позволяет редактировать заголовок по клику на текст или иконку
 */
export function QueryTitleEditor() {
    const t = useTranslations('filters');
    const { activeQueryId, queries, updateQuery } = useSidebarStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Найти активный запрос
    const activeQuery = queries.find(q => q.id === activeQueryId);

    // Фокус на инпут при начале редактирования
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        if (activeQuery) {
            setEditedTitle(activeQuery.title);
            setIsEditing(true);
        }
    };

    const handleSaveTitle = () => {
        if (activeQueryId && editedTitle.trim()) {
            updateQuery(activeQueryId, { title: editedTitle.trim() });
            setIsEditing(false);
        } else {
            handleCancelEdit();
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedTitle('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1.5">
                <input
                    ref={inputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveTitle}
                    className="text-sm font-medium bg-background dark:bg-input/30 border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent min-w-[200px] transition-all"
                    placeholder={t('title')}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveTitle}
                    className="h-7 w-7 p-0 hover:bg-accent"
                >
                    <Check className="w-3.5 h-3.5 text-brand-primary" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group">
            <button
                onClick={handleStartEdit}
                className="text-sm font-medium text-text-secondary hover:text-text-primary whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2"
            >
                {activeQuery ? activeQuery.title : t('title')}
                {activeQuery && (
                    <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </button>
        </div>
    );
}
