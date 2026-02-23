'use client';

import { memo, useState, useCallback } from 'react';
import { StickyNote, X, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface NoteFormProps {
  onSave: (text: string) => void;
  onCancel: () => void;
  initialValue?: string;
  labels: {
    title: string;
    placeholder: string;
    save: string;
    cancel: string;
  };
  className?: string;
}

export const NoteForm = memo(function NoteForm({
  onSave,
  onCancel,
  initialValue = '',
  labels,
  className,
}: NoteFormProps) {
  const [text, setText] = useState(initialValue);

  const handleSave = useCallback(() => {
    if (text.trim()) onSave(text.trim());
  }, [text, onSave]);

  return (
    <div className={cn(
      'rounded-xl border border-border bg-background-secondary p-3 space-y-3',
      'animate-message-slide-in',
      className
    )}>
      {/* Заголовок */}
      <div className="flex items-center gap-2">
        <StickyNote className="w-4 h-4 text-warning" />
        <span className="text-sm font-medium text-text-primary">{labels.title}</span>
      </div>

      {/* Поле ввода */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={labels.placeholder}
        rows={3}
        className={cn(
          'w-full rounded-lg border border-border bg-background p-2.5 text-sm',
          'text-text-primary placeholder:text-text-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
          'resize-none transition-all duration-200'
        )}
      />

      {/* Кнопки */}
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancel}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer',
            'text-text-secondary hover:bg-background-tertiary transition-colors'
          )}
        >
          <X className="w-3.5 h-3.5" />
          {labels.cancel}
        </button>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer',
            'bg-brand-primary text-white transition-colors',
            text.trim() ? 'hover:bg-brand-primary-hover' : 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className="w-3.5 h-3.5" />
          {labels.save}
        </button>
      </div>
    </div>
  );
});
