'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Pencil, Check } from 'lucide-react';

type EditableTitleProps = {
    /** Текущий заголовок */
    title: string;
    /** Колбэк при изменении заголовка */
    onTitleChange?: (newTitle: string) => void;
    /** Плейсхолдер для инпута */
    placeholder?: string;
    /** Разрешить редактирование */
    editable?: boolean;
    /** CSS классы */
    className?: string;
    /** Внешнее управление режимом редактирования */
    isEditing?: boolean;
    /** Колбэк для изменения режима редактирования */
    onEditingChange?: (isEditing: boolean) => void;
};

/**
 * Универсальный компонент редактируемого заголовка
 * Позволяет редактировать текст по клику на иконку карандаша
 */
export function EditableTitle({
    title,
    onTitleChange,
    placeholder = 'Title',
    editable = true,
    className = '',
    isEditing: externalIsEditing,
    onEditingChange,
}: EditableTitleProps) {
    const [internalIsEditing, setInternalIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    // Используем внешнее или внутреннее состояние редактирования
    const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
    const setIsEditing = (value: boolean) => {
        if (onEditingChange) {
            onEditingChange(value);
        } else {
            setInternalIsEditing(value);
        }
    };

    // Синхронизация с внешним title
    useEffect(() => {
        setEditedTitle(title);
    }, [title]);

    // Фокус на инпут при начале редактирования
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        if (editable) {
            setIsEditing(true);
        }
    };

    const handleSaveTitle = () => {
        const trimmed = editedTitle.trim();
        if (trimmed) {
            onTitleChange?.(trimmed);
            setIsEditing(false);
        } else {
            handleCancelEdit();
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedTitle(title);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div className={`inline-flex items-center group ${className}`}>
            <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveTitle}
                onClick={handleStartEdit}
                readOnly={!isEditing}
                size={editedTitle.length || placeholder.length}
                style={{ width: 'auto' }}
                className={`text-sm font-medium bg-transparent border-none outline-none transition-colors p-0 max-w-full ${isEditing
                    ? 'cursor-text text-text-primary'
                    : 'cursor-pointer text-text-secondary hover:text-text-primary text-ellipsis overflow-hidden'
                    }`}
                placeholder={placeholder}
                disabled={!editable}
            />
            {editable && (
                <div className="flex items-center shrink-0">
                    {isEditing ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveTitle}
                            className="h-auto w-auto p-0 hover:bg-transparent cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5 text-brand-primary hover:text-brand-primary/80 transition-colors" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"

                            className="h-auto w-auto p-0 hover:bg-transparent group/button"
                        >
                            <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover/button:opacity-0 transition-opacity" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
