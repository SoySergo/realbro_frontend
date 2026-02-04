'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { StickyNote, Bell, Save, X, Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { format, type Locale } from 'date-fns';
import { ru, enUS, fr } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { favoritesApi } from '@/shared/api/mocks';

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
 * Inline вариант показывается развёрнутым, compact - свёрнутым
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
    const [showSaved, setShowSaved] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const hasChanges = note !== initialNote || reminderDate !== initialReminderDate;

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
            await favoritesApi.createNote(propertyId, note, reminderDate);
            onSave?.(note, reminderDate);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        setNote('');
        setReminderDate(undefined);
        if (variant === 'compact') {
            setIsExpanded(false);
        }
    };

    // Предустановленные даты для напоминаний
    const reminderPresets = [
        { label: 'Через 1 час', hours: 1 },
        { label: 'Через 3 часа', hours: 3 },
        { label: 'Завтра', hours: 24 },
        { label: 'Через 3 дня', hours: 72 },
        { label: 'Через неделю', hours: 168 },
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
        <div className={cn(
            "bg-background-secondary/50 rounded-xl border border-border/50 p-4",
            className
        )}>
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <StickyNote className="w-4 h-4 text-text-secondary" />
                    {t('addNote')}
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
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
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
                        className="gap-2"
                    >
                        {showSaved ? (
                            <>
                                <Check className="w-4 h-4" />
                                {t('noteCreated')}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {t('saveNote')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
