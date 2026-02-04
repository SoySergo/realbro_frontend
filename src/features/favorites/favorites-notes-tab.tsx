'use client';

import { useTranslations } from 'next-intl';
import { StickyNote, Bell, Trash2, Edit, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { PropertyNote } from '@/entities/favorites/model/types';
import { cn, safeImageSrc } from '@/shared/lib/utils';
import { format, type Locale } from 'date-fns';
import { ru, enUS, fr } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Link } from '@/shared/config/routing';
import Image from 'next/image';

interface FavoritesNotesTabProps {
    notes: PropertyNote[];
    isEmpty: boolean;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
}

const dateLocales: Record<string, Locale> = {
    ru,
    en: enUS,
    fr,
};

/**
 * Таб заметок и напоминаний
 */
export function FavoritesNotesTab({ 
    notes, 
    isEmpty,
    onDelete,
    onEdit 
}: FavoritesNotesTabProps) {
    const t = useTranslations('favorites');
    const tNotes = useTranslations('favorites.notes');
    const locale = useLocale();

    const formatDate = (date: Date) => {
        return format(new Date(date), 'd MMM yyyy, HH:mm', { 
            locale: dateLocales[locale] || enUS 
        });
    };

    const formatReminderDate = (date: Date) => {
        const now = new Date();
        const reminderDate = new Date(date);
        const isToday = reminderDate.toDateString() === now.toDateString();
        const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === reminderDate.toDateString();
        
        if (isToday) return tNotes('today');
        if (isTomorrow) return tNotes('tomorrowLabel');
        return format(reminderDate, 'd MMM yyyy', { 
            locale: dateLocales[locale] || enUS 
        });
    };

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                    <StickyNote className="w-8 h-8 text-text-secondary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                    {t('empty.notes.title')}
                </h2>
                <p className="text-text-secondary max-w-sm">
                    {t('empty.notes.description')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notes.map((note) => (
                <div 
                    key={note.id}
                    className="bg-card rounded-xl border border-border p-4 hover:border-primary transition-colors"
                >
                    <div className="flex gap-4">
                        {/* Превью объекта */}
                        {note.property && (
                            <Link 
                                href={`/property/${note.property.id}`}
                                className="flex-shrink-0"
                            >
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden group">
                                    <Image
                                        src={safeImageSrc(note.property.images[0])}
                                        alt={note.property.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Контент заметки */}
                        <div className="flex-1 min-w-0">
                            {/* Заголовок объекта */}
                            {note.property && (
                                <Link href={`/property/${note.property.id}`}>
                                    <h3 className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-1 mb-1">
                                        {note.property.title}
                                    </h3>
                                </Link>
                            )}

                            {/* Текст заметки */}
                            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                                {note.text}
                            </p>

                            {/* Мета информация */}
                            <div className="flex items-center gap-4 text-xs text-text-tertiary">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(note.updatedAt)}
                                </span>
                                {note.reminder && (
                                    <Badge 
                                        variant={new Date(note.reminder.date) < new Date() ? 'destructive' : 'secondary'}
                                        className="text-xs"
                                    >
                                        <Bell className="w-3 h-3 mr-1" />
                                        {formatReminderDate(note.reminder.date)}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Действия */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit?.(note.id)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onDelete?.(note.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
