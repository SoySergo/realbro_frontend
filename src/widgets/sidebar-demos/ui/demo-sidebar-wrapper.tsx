'use client';

import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  variantNumber: number;
  children: ReactNode;
};

// Обёртка для демонстрации варианта сайдбара с заголовком и описанием
export function DemoSidebarWrapper({
  title,
  description,
  variantNumber,
  children,
}: Props) {
  return (
    <div className={cn('flex flex-col')}>
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono bg-brand-primary text-white px-2 py-0.5 rounded">
            #{variantNumber}
          </span>
          <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
        </div>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <div className="relative h-[600px] w-[280px] rounded-xl border-2 border-border overflow-hidden bg-background shadow-lg">
        {children}
      </div>
    </div>
  );
}
