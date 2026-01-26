'use client';

import { cn } from '@/shared/lib/utils';

interface TypingIndicatorProps {
    label?: string;
    className?: string;
}

export function TypingIndicator({ label, className }: TypingIndicatorProps) {
    return (
        <div className={cn('flex items-center gap-2 py-2', className)}>
            <div className="bg-background-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                {label && (
                    <span className="text-xs text-text-tertiary ml-1">{label}</span>
                )}
            </div>
        </div>
    );
}
