'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { StickyNote, Bell, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { format, type Locale } from 'date-fns';
import { ru, enUS, fr } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { favoritesApi } from '@/shared/api/mocks';

interface PropertyNoteDialogProps {
    propertyId: string;
    propertyTitle?: string;
    isOpen: boolean;
    onClose: () => void;
    initialNote?: string;
    initialReminderDate?: Date;
    onSave?: (note: string, reminderDate?: Date) => void;
}

const dateLocales: Record<string, Locale> = {
    ru,
    en: enUS,
    fr,
};

/**
 * Диалог для добавления/редактирования заметки к объекту
 */
export function PropertyNoteDialog({
    propertyId,
    propertyTitle,
    isOpen,
    onClose,
    initialNote = '',
    initialReminderDate,
    onSave,
}: PropertyNoteDialogProps) {
    const t = useTranslations('favorites.notes');
    const locale = useLocale();
    
    const [note, setNote] = useState(initialNote);
    const [reminderDate, setReminderDate] = useState<Date | undefined>(initialReminderDate);
    const [isSaving, setIsSaving] = useState(false);

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
            onClose();
            // Сбрасываем состояние
            setNote('');
            setReminderDate(undefined);
        } catch (error) {
            console.error('Failed to save note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setNote(initialNote);
        setReminderDate(initialReminderDate);
        onClose();
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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <StickyNote className="w-5 h-5" />
                        {t('addNote')}
                    </DialogTitle>
                    {propertyTitle && (
                        <p className="text-sm text-text-secondary truncate">
                            {propertyTitle}
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Поле ввода */}
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('placeholder')}
                        className={cn(
                            "w-full bg-background border border-border rounded-lg px-3 py-2",
                            "text-sm text-text-primary placeholder:text-text-tertiary",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                            "resize-none min-h-[100px] transition-colors"
                        )}
                        rows={4}
                        autoFocus
                    />

                    {/* Напоминание */}
                    <div className="flex items-center gap-2">
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
                                        t('setReminder')
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
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!note.trim() || isSaving}
                        className="gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {t('saveNote')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
