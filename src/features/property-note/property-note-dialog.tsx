'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { StickyNote, Bell, Save, Calendar } from 'lucide-react';
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
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customDate, setCustomDate] = useState('');
    const [customTime, setCustomTime] = useState('12:00');

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
        { label: t('reminderPresets.in1Hour'), hours: 1 },
        { label: t('reminderPresets.in3Hours'), hours: 3 },
        { label: t('reminderPresets.tomorrow'), hours: 24 },
        { label: t('reminderPresets.in3Days'), hours: 72 },
        { label: t('reminderPresets.inWeek'), hours: 168 },
    ];

    const handleSetReminder = (hours: number) => {
        const date = new Date(Date.now() + hours * 60 * 60 * 1000);
        setReminderDate(date);
        setShowCustomPicker(false);
    };

    const handleCustomDateTime = () => {
        if (customDate && customTime) {
            const [hours, minutes] = customTime.split(':').map(Number);
            const date = new Date(customDate);
            date.setHours(hours, minutes, 0, 0);
            setReminderDate(date);
            setShowCustomPicker(false);
        }
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
                            <PopoverContent className="w-64 p-2" align="start">
                                {!showCustomPicker ? (
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
                                        <hr className="my-2 border-border" />
                                        <button
                                            onClick={() => setShowCustomPicker(true)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2",
                                                "hover:bg-background-secondary transition-colors text-primary"
                                            )}
                                        >
                                            <Calendar className="w-4 h-4" />
                                            {t('customDateTime')}
                                        </button>
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
                                ) : (
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <label className="text-xs text-muted-foreground">{t('date')}</label>
                                            <input
                                                type="date"
                                                value={customDate}
                                                onChange={(e) => setCustomDate(e.target.value)}
                                                min={format(new Date(), 'yyyy-MM-dd')}
                                                className={cn(
                                                    "w-full bg-background border border-border rounded-md px-3 py-2",
                                                    "text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-muted-foreground">{t('time')}</label>
                                            <input
                                                type="time"
                                                value={customTime}
                                                onChange={(e) => setCustomTime(e.target.value)}
                                                className={cn(
                                                    "w-full bg-background border border-border rounded-md px-3 py-2",
                                                    "text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                )}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => setShowCustomPicker(false)}
                                            >
                                                {t('cancel')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={handleCustomDateTime}
                                                disabled={!customDate}
                                            >
                                                {t('apply')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
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
