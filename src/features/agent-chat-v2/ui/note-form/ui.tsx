'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface NoteFormProps {
    labels: Record<string, string>;
    initialValue?: string;
    onSave: (text: string) => void;
    onCancel: () => void;
    className?: string;
}

/**
 * Форма для создания заметки по объекту
 */
export function NoteForm({ labels, initialValue = '', onSave, onCancel, className }: NoteFormProps) {
    const [text, setText] = useState(initialValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSave(text.trim());
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'bg-card border border-border rounded-xl p-3 space-y-3 animate-fade-in',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-text-primary">{labels.title}</h4>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1 rounded-full hover:bg-background-secondary transition-colors"
                >
                    <X className="w-4 h-4 text-text-tertiary" />
                </button>
            </div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={labels.placeholder}
                className={cn(
                    'w-full min-h-[80px] px-3 py-2 rounded-lg resize-none',
                    'bg-background-secondary border border-border',
                    'text-sm text-text-primary placeholder:text-text-tertiary',
                    'focus:outline-none focus:border-brand-primary/50 transition-colors'
                )}
                autoFocus
            />
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                    {labels.cancel}
                </button>
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className={cn(
                        'px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                        'bg-brand-primary text-white hover:bg-brand-primary-hover',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {labels.save}
                </button>
            </div>
        </form>
    );
}
