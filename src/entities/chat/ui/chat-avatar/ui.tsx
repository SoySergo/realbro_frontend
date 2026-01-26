'use client';

import { Bot, Headphones, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ChatType } from '../../model/types';

interface ChatAvatarProps {
    type: ChatType;
    avatar?: string;
    title: string;
    isOnline?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
};

const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

const statusSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
};

export function ChatAvatar({
    type,
    avatar,
    title,
    isOnline,
    size = 'md',
    className,
}: ChatAvatarProps) {
    const getIcon = () => {
        switch (type) {
            case 'ai-agent':
                return <Bot className={iconSizes[size]} />;
            case 'support':
                return <Headphones className={iconSizes[size]} />;
            default:
                return <User className={iconSizes[size]} />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'ai-agent':
                return 'bg-brand-primary text-white';
            case 'support':
                return 'bg-success text-white';
            default:
                return 'bg-background-tertiary text-text-secondary';
        }
    };

    return (
        <div className={cn('relative shrink-0', className)}>
            {avatar ? (
                <img
                    src={avatar}
                    alt={title}
                    className={cn(
                        sizeClasses[size],
                        'rounded-full object-cover'
                    )}
                />
            ) : (
                <div
                    className={cn(
                        sizeClasses[size],
                        'rounded-full flex items-center justify-center',
                        getBgColor()
                    )}
                >
                    {getIcon()}
                </div>
            )}
            {isOnline !== undefined && (
                <span
                    className={cn(
                        statusSizes[size],
                        'absolute bottom-0 right-0 rounded-full border-2 border-background',
                        isOnline ? 'bg-success' : 'bg-text-tertiary'
                    )}
                />
            )}
        </div>
    );
}
