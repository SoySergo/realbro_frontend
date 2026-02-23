'use client';

import { memo } from 'react';
import {
  FileText, StickyNote, Heart, CheckCircle, XCircle, MapPin, Phone,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { QuickActionType } from '@/entities/agent-chat';

interface QuickActionChipsProps {
  onAction: (action: QuickActionType) => void;
  isFavorite?: boolean;
  labels: Record<string, string>;
  className?: string;
}

const actions: { type: QuickActionType; icon: typeof FileText; activeColor?: string }[] = [
  { type: 'description', icon: FileText },
  { type: 'makeNote', icon: StickyNote },
  { type: 'addFavorite', icon: Heart, activeColor: 'text-error' },
  { type: 'suitable', icon: CheckCircle, activeColor: 'text-success' },
  { type: 'notSuitable', icon: XCircle, activeColor: 'text-error' },
  { type: 'whatsNearby', icon: MapPin },
  { type: 'contact', icon: Phone },
];

export const QuickActionChips = memo(function QuickActionChips({
  onAction,
  isFavorite,
  labels,
  className,
}: QuickActionChipsProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-hide',
      'border-t border-border bg-background',
      className
    )}>
      {actions.map(({ type, icon: Icon, activeColor }) => {
        // Активное состояние для кнопки избранного
        const isActive = type === 'addFavorite' && isFavorite;

        return (
          <button
            key={type}
            onClick={() => onAction(type)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
              'whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer',
              'border border-border',
              isActive
                ? 'bg-error/10 text-error border-error/30'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', isActive && activeColor)} />
            {labels[type] || type}
          </button>
        );
      })}
    </div>
  );
});
