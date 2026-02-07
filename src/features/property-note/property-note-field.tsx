'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { StickyNote, Bell, Save, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { format, type Locale } from 'date-fns';
import { ru, enUS, fr } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { favoritesApi } from '@/shared/api/mocks';
import type { PropertyNote } from '@/entities/favorites/model/types';

interface PropertyNoteFieldProps {
    propertyId: string;
    initialNote?: string;
    initialReminderDate?: Date;
    variant?: 'inline' | 'compact';
    className?: string;
    onSave?: (note: string, reminderDate?: Date) => void;
}

const dateLocales: Record<string, Locale> = {
    ru,
    en: enUS,
    fr,
};

/**
 * Поле заметки для страницы детали объекта
 * Показывает сохранённые заметки выше формы ввода, позволяет создавать новые
 */
export function PropertyNoteField({
    propertyId,
    initialNote = '',
    initialReminderDate,
    variant = 'inline',
    className,
    onSave,
}: PropertyNoteFieldProps) {
    const t = useTranslations('favorites.notes');
    const locale = useLocale();

    const [note, setNote] = useState(initialNote);
    const [reminderDate, setReminderDate] = useState<Date | undefined>(initialReminderDate);
    const [isExpanded, setIsExpanded] = useState(variant === 'inline' || !!initialNote);
    const [isSaving, setIsSaving] = useState(false);
    const [savedNotes, setSavedNotes] = useState<PropertyNote[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Автоматическое увеличение высоты textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [note]);

    const formatReminderDate = (date: Date) => {
        return format(new Date(date), 'd MMM yyyy, HH:mm', {
            locale: dateLocales[locale] || enUS
        });
    };

    const handleSave = async () => {
        if (!note.trim()) return;

        setIsSaving(true);
        try {
            const createdNote = await favoritesApi.createNote(propertyId, note, reminderDate);
            setSavedNotes((prev) => [createdNote, ...prev]);
            onSave?.(note, reminderDate);
            // Сбрасываем форму для новой заметки
            setNote('');
            setReminderDate(undefined);
        } catch (error) {
            console.error('Failed to save note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await favoritesApi.deleteNote(noteId);
            setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const handleClear = () => {
        setNote('');
        setReminderDate(undefined);
        if (variant === 'compact' && savedNotes.length === 0) {
            setIsExpanded(false);
        }
    };

    // Предустановленные даты для напоминаний
    const reminderPresets = [
        { label: t('reminderPresets.in1Hour'), hours: 1 },
        { label: t('reminderPresets.in3Hours'), hours: 3 },
        { label: t('reminderPresets.tomorrow'), hours: 24 },
        { label: t('reminderPresets.in3Days'), hours: 72 },
        { label: t('reminderPresets.inWeek'), hours: 168 },
    ];

    const handleSetReminder = (hours: number) => {
        const date = new Date(Date.now() + hours * 60 * 60 * 1000);
        setReminderDate(date);
    };

    // Compact вариант - кнопка, которая раскрывается
    if (variant === 'compact' && !isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm text-text-secondary",
                    "hover:text-text-primary hover:bg-background-secondary rounded-lg transition-colors",
                    className
                )}
            >
                <StickyNote className="w-4 h-4" />
                {t('addNote')}
            </button>
        );
    }

    return (
        <div
            className={cn("space-y-3", className)}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Сохранённые заметки */}
            {savedNotes.length > 0 && (
                <div className="space-y-2">
                    {savedNotes.map((savedNote) => (
                        <div
                            key={savedNote.id}
                            className="bg-background-secondary/50 rounded-xl border border-border/50 p-4"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary whitespace-pre-wrap">
                                        {savedNote.text}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-text-tertiary">
                                            {format(new Date(savedNote.createdAt), 'd MMM yyyy, HH:mm', {
                                                locale: dateLocales[locale] || enUS,
                                            })}
                                        </span>
                                        {savedNote.reminder && (
                                            <span className="inline-flex items-center gap-1 text-xs text-brand-primary">
                                                <Bell className="w-3 h-3" />
                                                {formatReminderDate(savedNote.reminder.date)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteNote(savedNote.id)}
                                    className="p-1.5 text-text-tertiary hover:text-error rounded-md hover:bg-error/10 transition-colors flex-shrink-0"
                                    title={t('deleteNote')}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Форма создания заметки */}
            <div className="bg-background-secondary/50 rounded-xl border border-border/50 p-4">
                {/* Заголовок */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <StickyNote className="w-4 h-4 text-text-secondary" />
                        {savedNotes.length > 0 ? t('addNote') : t('addNote')}
                    </div>
                    {variant === 'compact' && (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1 text-text-secondary hover:text-text-primary rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Поле ввода */}
                <textarea
                    ref={textareaRef}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('placeholder')}
                    className={cn(
                        "w-full bg-background border border-border rounded-lg px-3 py-2",
                        "text-sm text-text-primary placeholder:text-text-tertiary",
                        "focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary",
                        "resize-none min-h-[60px] transition-colors"
                    )}
                    rows={2}
                />

                {/* Напоминание и действия */}
                <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        {/* Кнопка напоминания */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={reminderDate ? "secondary" : "outline"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Bell className="w-4 h-4" />
                                    {reminderDate ? (
                                        <span className="text-xs">
                                            {formatReminderDate(reminderDate)}
                                        </span>
                                    ) : (
                                        <span className="hidden sm:inline">{t('setReminder')}</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2" align="start">
                                <div className="space-y-1">
                                    {reminderPresets.map((preset) => (
                                        <button
                                            key={preset.hours}
                                            onClick={() => handleSetReminder(preset.hours)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-sm rounded-md",
                                                "hover:bg-background-secondary transition-colors"
                                            )}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                    {reminderDate && (
                                        <>
                                            <hr className="my-2 border-border" />
                                            <button
                                                onClick={() => setReminderDate(undefined)}
                                                className="w-full text-left px-3 py-2 text-sm rounded-md text-error hover:bg-error/10 transition-colors"
                                            >
                                                {t('removeReminder')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex items-center gap-2">
                        {note.trim() && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                            >
                                {t('cancel')}
                            </Button>
                        )}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={!note.trim() || isSaving}
                            className="gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white"
                        >
                            <Save className="w-4 h-4" />
                            {t('saveNote')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
