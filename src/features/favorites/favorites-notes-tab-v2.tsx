'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { 
    StickyNote, Bell, Trash2, Edit, Clock, ExternalLink, 
    Calendar as CalendarIcon, Filter as FilterIcon, Plus, ArrowUpDown 
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/ui/alert-dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { DateRangePicker } from '@/shared/ui/date-range-picker';
import type { PropertyNote, FavoritesNotesFilters } from '@/entities/favorites/model/types';
import { cn, safeImageSrc } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { ru, enUS, es, ca, uk, fr, it, pt, de } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Link } from '@/shared/config/routing';
import Image from 'next/image';

interface FavoritesNotesTabProps {
    notes: PropertyNote[];
    isEmpty: boolean;
    onDelete?: (id: string) => void;
    onEdit?: (id: string, text: string, reminderDate?: Date | null) => void;
    onCreate?: (text: string, propertyId?: string, reminderDate?: Date) => void;
}

const dateLocales: Record<string, Locale> = {
    ru,
    en: enUS,
    es,
    ca,
    uk,
    fr,
    it,
    pt,
    de,
};

/**
 * Улучшенный таб заметок с редактированием и календарным представлением
 */
export function FavoritesNotesTabV2({ 
    notes, 
    isEmpty,
    onDelete,
    onEdit,
    onCreate 
}: FavoritesNotesTabProps) {
    const t = useTranslations('favorites');
    const tNotes = useTranslations('favorites.notes');
    const locale = useLocale();
    const dateLocale = dateLocales[locale] || enUS;

    // Состояния
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [filters, setFilters] = useState<FavoritesNotesFilters>({
        noteType: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });
    
    // Состояния диалогов
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<PropertyNote | null>(null);
    
    // Форма редактирования/создания
    const [formText, setFormText] = useState('');
    const [formReminderDate, setFormReminderDate] = useState('');
    const [formReminderTime, setFormReminderTime] = useState('');

    const formatDate = (date: Date) => {
        return format(new Date(date), 'd MMM yyyy, HH:mm', { locale: dateLocale });
    };

    const formatReminderDate = (date: Date) => {
        const now = new Date();
        const reminderDate = new Date(date);
        const isToday = reminderDate.toDateString() === now.toDateString();
        const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === reminderDate.toDateString();
        
        if (isToday) return tNotes('today');
        if (isTomorrow) return tNotes('tomorrowLabel');
        return format(reminderDate, 'd MMM yyyy', { locale: dateLocale });
    };

    // Применение фильтров
    const filteredNotes = useMemo(() => {
        let result = [...notes];

        // Фильтр по типу заметки
        if (filters.noteType && filters.noteType !== 'all') {
            result = result.filter((note) => {
                if (filters.noteType === 'property') return note.property !== undefined;
                if (filters.noteType === 'agency') return note.agency !== undefined;
                if (filters.noteType === 'general') return !note.property && !note.agency;
                return true;
            });
        }

        // Фильтр по наличию напоминания
        if (filters.hasReminder !== undefined) {
            result = result.filter((note) =>
                filters.hasReminder ? note.reminder !== undefined : note.reminder === undefined
            );
        }

        // Фильтр по дате
        if (filters.dateFrom) {
            result = result.filter((note) => new Date(note.createdAt) >= filters.dateFrom!);
        }
        if (filters.dateTo) {
            result = result.filter((note) => new Date(note.createdAt) <= filters.dateTo!);
        }

        // Сортировка
        result.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'updatedAt':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                case 'reminderDate':
                    const aReminder = a.reminder?.date?.getTime() || 0;
                    const bReminder = b.reminder?.date?.getTime() || 0;
                    comparison = aReminder - bReminder;
                    break;
                default:
                    comparison = 0;
            }

            return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [notes, filters]);

    // Обработчики диалогов
    const handleOpenEdit = (note: PropertyNote) => {
        setSelectedNote(note);
        setFormText(note.text);
        setFormReminderDate(note.reminder ? format(new Date(note.reminder.date), 'yyyy-MM-dd') : '');
        setFormReminderTime(note.reminder ? format(new Date(note.reminder.date), 'HH:mm') : '');
        setEditDialogOpen(true);
    };

    const handleOpenCreate = () => {
        setFormText('');
        setFormReminderDate('');
        setFormReminderTime('');
        setCreateDialogOpen(true);
    };

    const handleOpenDelete = (note: PropertyNote) => {
        setSelectedNote(note);
        setDeleteDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (!selectedNote) return;
        
        let reminderDate: Date | null = null;
        if (formReminderDate && formReminderTime) {
            reminderDate = new Date(`${formReminderDate}T${formReminderTime}`);
        }
        
        onEdit?.(selectedNote.id, formText, reminderDate);
        setEditDialogOpen(false);
        setSelectedNote(null);
    };

    const handleCreate = () => {
        let reminderDate: Date | undefined = undefined;
        if (formReminderDate && formReminderTime) {
            reminderDate = new Date(`${formReminderDate}T${formReminderTime}`);
        }
        
        onCreate?.(formText, undefined, reminderDate);
        setCreateDialogOpen(false);
    };

    const handleConfirmDelete = () => {
        if (selectedNote) {
            onDelete?.(selectedNote.id);
        }
        setDeleteDialogOpen(false);
        setSelectedNote(null);
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
                <p className="text-text-secondary max-w-sm mb-4">
                    {t('empty.notes.description')}
                </p>
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    {tNotes('addNote')}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Панель управления */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Левая часть: фильтры и переключатель вида */}
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Переключатель список/календарь */}
                    <ToggleGroup
                        type="single"
                        value={viewMode}
                        onValueChange={(value) => value && setViewMode(value as any)}
                        className="border border-border rounded-lg p-1"
                    >
                        <ToggleGroupItem value="list" size="sm">
                            <StickyNote className="w-4 h-4 mr-1" />
                            {tNotes('listView')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="calendar" size="sm">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {tNotes('calendarView')}
                        </ToggleGroupItem>
                    </ToggleGroup>

                    {/* Фильтр по типу */}
                    <Select
                        value={filters.noteType || 'all'}
                        onValueChange={(value) => setFilters({ ...filters, noteType: value as any })}
                    >
                        <SelectTrigger className="w-[160px] h-9 text-xs">
                            <FilterIcon className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{tNotes('filters.allTypes')}</SelectItem>
                            <SelectItem value="property">{tNotes('filters.propertyNotes')}</SelectItem>
                            <SelectItem value="agency">{tNotes('filters.agencyNotes')}</SelectItem>
                            <SelectItem value="general">{tNotes('filters.generalNotes')}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Фильтр по дате */}
                    <DateRangePicker
                        from={filters.dateFrom}
                        to={filters.dateTo}
                        onSelect={(from, to) => setFilters({ ...filters, dateFrom: from, dateTo: to })}
                        placeholder={t('filters.selectDateRange')}
                        className="h-9 text-xs"
                    />

                    {/* Фильтр по напоминанию */}
                    <ToggleGroup
                        type="single"
                        value={filters.hasReminder === undefined ? 'all' : filters.hasReminder ? 'with' : 'without'}
                        onValueChange={(value) => {
                            const hasReminder = value === 'all' ? undefined : value === 'with';
                            setFilters({ ...filters, hasReminder });
                        }}
                        className="border border-border rounded-lg p-1"
                    >
                        <ToggleGroupItem value="all" size="sm" className="text-xs">
                            {tNotes('filters.all')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="with" size="sm" className="text-xs">
                            <Bell className="w-3 h-3 mr-1" />
                            {tNotes('filters.withReminder')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="without" size="sm" className="text-xs">
                            {tNotes('filters.noReminder')}
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Правая часть: кнопка создания и сортировка */}
                <div className="flex items-center gap-2">
                    <Select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onValueChange={(value) => {
                            const [sortBy, sortOrder] = value.split('-');
                            setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
                        }}
                    >
                        <SelectTrigger className="w-[180px] h-9 text-xs">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt-desc">{t('sort.newestFirst')}</SelectItem>
                            <SelectItem value="createdAt-asc">{t('sort.oldestFirst')}</SelectItem>
                            <SelectItem value="updatedAt-desc">{tNotes('sort.recentlyUpdated')}</SelectItem>
                            <SelectItem value="reminderDate-asc">{tNotes('sort.upcomingReminders')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleOpenCreate} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        {tNotes('addNote')}
                    </Button>
                </div>
            </div>

            {/* Счетчик результатов */}
            <div className="text-sm text-text-secondary">
                {t('filters.showing', { count: filteredNotes.length, total: notes.length })}
            </div>

            {/* Контент */}
            {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FilterIcon className="w-12 h-12 text-text-tertiary mb-3" />
                    <p className="text-text-secondary">{t('filters.noResults')}</p>
                </div>
            ) : viewMode === 'list' ? (
                // Список заметок
                <div className="space-y-4">
                    {filteredNotes.map((note) => (
                        <div 
                            key={note.id}
                            className="bg-card rounded-xl border border-border p-4 hover:border-primary transition-colors"
                        >
                            <div className="flex gap-4">
                                {/* Превью объекта/агентства */}
                                {(note.property || note.agency) && (
                                    <div className="flex-shrink-0">
                                        {note.property && (
                                            <Link href={`/property/${note.property.id}`}>
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
                                        {note.agency && (
                                            <div className="w-24 h-24 rounded-lg bg-background-secondary flex items-center justify-center">
                                                <Image
                                                    src={safeImageSrc(note.agency.avatar)}
                                                    alt={note.agency.name}
                                                    width={60}
                                                    height={60}
                                                    className="rounded-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Контент заметки */}
                                <div className="flex-1 min-w-0">
                                    {/* Заголовок */}
                                    {note.property && (
                                        <Link href={`/property/${note.property.id}`}>
                                            <h3 className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-1 mb-1">
                                                {note.property.title}
                                            </h3>
                                        </Link>
                                    )}
                                    {note.agency && (
                                        <h3 className="font-medium text-text-primary line-clamp-1 mb-1">
                                            {note.agency.name}
                                        </h3>
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
                                        onClick={() => handleOpenEdit(note)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleOpenDelete(note)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Календарное представление (упрощенное)
                <div className="bg-card rounded-xl border border-border p-6">
                    <p className="text-center text-text-secondary">
                        {tNotes('calendarViewComingSoon')}
                    </p>
                </div>
            )}

            {/* Диалог редактирования */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{tNotes('editNote')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{tNotes('noteText')}</Label>
                            <Textarea
                                value={formText}
                                onChange={(e) => setFormText(e.target.value)}
                                placeholder={tNotes('placeholder')}
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{tNotes('reminder')}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    type="date"
                                    value={formReminderDate}
                                    onChange={(e) => setFormReminderDate(e.target.value)}
                                />
                                <Input
                                    type="time"
                                    value={formReminderTime}
                                    onChange={(e) => setFormReminderTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            {tNotes('cancel')}
                        </Button>
                        <Button onClick={handleSaveEdit}>
                            {tNotes('saveNote')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог создания */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{tNotes('addNote')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{tNotes('noteText')}</Label>
                            <Textarea
                                value={formText}
                                onChange={(e) => setFormText(e.target.value)}
                                placeholder={tNotes('placeholder')}
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{tNotes('reminder')} ({tNotes('optional')})</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    type="date"
                                    value={formReminderDate}
                                    onChange={(e) => setFormReminderDate(e.target.value)}
                                />
                                <Input
                                    type="time"
                                    value={formReminderTime}
                                    onChange={(e) => setFormReminderTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            {tNotes('cancel')}
                        </Button>
                        <Button onClick={handleCreate}>
                            {tNotes('create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{tNotes('deleteConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {tNotes('deleteDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{tNotes('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>
                            {tNotes('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
