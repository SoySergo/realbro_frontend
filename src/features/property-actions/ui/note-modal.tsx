'use client';

import { useState, useCallback, useEffect } from 'react';
import { StickyNote, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

// ============================================================================
// Типы
// ============================================================================

export interface NoteModalTranslations {
    title: string;
    description: string;
    placeholder: string;
    saveButton: string;
    cancelButton: string;
    closeButton: string;
    characterCount: string;
}

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    initialNote?: string;
    propertyTitle?: string;
    translations: NoteModalTranslations;
    maxLength?: number;
}

// ============================================================================
// Локальное хранилище заметок
// ============================================================================

const STORAGE_KEY = 'realbro_property_notes';

interface StoredNotes {
    [propertyId: string]: {
        note: string;
        updatedAt: string;
    };
}

/**
 * Получить заметки из localStorage
 */
export function getStoredNotes(): StoredNotes {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

/**
 * Сохранить заметку в localStorage
 */
export function saveNote(propertyId: string, note: string): void {
    if (typeof window === 'undefined') return;
    try {
        const notes = getStoredNotes();
        if (note.trim()) {
            notes[propertyId] = {
                note: note.trim(),
                updatedAt: new Date().toISOString(),
            };
        } else {
            delete notes[propertyId];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
        console.error('[Notes] Failed to save note');
    }
}

/**
 * Получить заметку для объекта
 */
export function getNote(propertyId: string): string | null {
    const notes = getStoredNotes();
    return notes[propertyId]?.note || null;
}

// ============================================================================
// Компонент
// ============================================================================

export function NoteModal({
    isOpen,
    onClose,
    onSave,
    initialNote = '',
    propertyTitle,
    translations,
    maxLength = 500,
}: NoteModalProps) {
    const [note, setNote] = useState(initialNote);
    
    // Синхронизируем при открытии
    useEffect(() => {
        if (isOpen) {
            setNote(initialNote);
        }
    }, [isOpen, initialNote]);

    const handleSave = useCallback(() => {
        onSave(note.trim());
        onClose();
    }, [note, onSave, onClose]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Ctrl/Cmd + Enter для сохранения
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    }, [handleSave]);

    const characterCountText = translations.characterCount
        .replace('{current}', String(note.length))
        .replace('{max}', String(maxLength));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <X className="h-4 w-4" />
                    <span className="sr-only">{translations.closeButton}</span>
                </DialogClose>
                
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                            <StickyNote className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <DialogTitle>{translations.title}</DialogTitle>
                            <DialogDescription>
                                {propertyTitle || translations.description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value.slice(0, maxLength))}
                        onKeyDown={handleKeyDown}
                        placeholder={translations.placeholder}
                        className={cn(
                            'w-full min-h-[120px] p-3 rounded-lg resize-none',
                            'bg-muted/50 border border-border',
                            'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
                            'text-sm placeholder:text-muted-foreground',
                            'transition-all duration-200'
                        )}
                        autoFocus
                    />
                    <div className="flex justify-end mt-2">
                        <span className={cn(
                            'text-xs',
                            note.length >= maxLength * 0.9 ? 'text-warning' : 'text-muted-foreground'
                        )}>
                            {characterCountText}
                        </span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        {translations.cancelButton}
                    </Button>
                    <Button onClick={handleSave}>
                        {translations.saveButton}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
