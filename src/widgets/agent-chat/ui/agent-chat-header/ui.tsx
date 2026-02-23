'use client';

import { memo } from 'react';
import { Bot, Settings, PanelLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AgentChatLabels } from '@/entities/agent-chat';

interface AgentChatHeaderProps {
  labels: AgentChatLabels;
  onToggleSidebar?: () => void;
  className?: string;
}

export const AgentChatHeader = memo(function AgentChatHeader({
  labels,
  onToggleSidebar,
  className,
}: AgentChatHeaderProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 h-14 border-b border-border bg-background shrink-0',
      className
    )}>
      {/* Кнопка сайдбара на мобильном */}
      <button
        onClick={onToggleSidebar}
        className="p-1.5 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer md:hidden"
      >
        <PanelLeft className="w-5 h-5 text-text-secondary" />
      </button>

      <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center">
        <Bot className="w-5 h-5 text-brand-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary">{labels.title}</h3>
        <p className="text-xs text-text-secondary">{labels.subtitle}</p>
      </div>

      <button
        className="p-2 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
        title={labels.settings.title}
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
});
