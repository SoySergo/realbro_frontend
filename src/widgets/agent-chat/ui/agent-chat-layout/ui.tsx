'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { useAgentChatStore } from '@/features/agent-chat';
import { AgentChatSidebar } from '../agent-chat-sidebar/ui';
import { AgentChatMainFeed } from '../agent-chat-main-feed/ui';
import { AgentChatThreadView } from '../agent-chat-thread-view/ui';
import { AgentChatHeader } from '../agent-chat-header/ui';
import { AgentChatInput } from '../agent-chat-input/ui';
import type { AgentChatLabels } from '@/entities/agent-chat';

interface AgentChatLayoutProps {
  labels: AgentChatLabels;
  className?: string;
}

export function AgentChatLayout({ labels, className }: AgentChatLayoutProps) {
  const { currentView, fetchData } = useAgentChatStore();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className={cn('flex h-full', className)}>
      {/* Сайдбар с тредами — скрыт на мобильном когда открыт тред */}
      <div className={cn(
        'w-full md:w-[280px] lg:w-[300px] shrink-0',
        'hidden md:flex',
        showMobileSidebar && 'flex md:flex'
      )}>
        <AgentChatSidebar
          labels={{
            propertyThreads: labels.propertyThreads,
            noThreads: labels.noThreads,
            mainChat: labels.mainChat,
            objects: labels.objects,
          }}
          className="w-full"
        />
      </div>

      {/* Основная область */}
      <div className="flex-1 min-w-0 flex flex-col">
        {currentView === 'thread' ? (
          <AgentChatThreadView labels={labels} />
        ) : (
          <>
            <AgentChatHeader
              labels={labels}
              onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
            />
            <AgentChatMainFeed labels={labels} className="flex-1 min-h-0" />
            <AgentChatInput
              labels={labels}
            />
          </>
        )}
      </div>
    </div>
  );
}
