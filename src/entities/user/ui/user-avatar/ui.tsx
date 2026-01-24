'use client';

import { cn } from '@/shared/lib/utils';

type UserAvatarProps = {
    email?: string;
    displayName?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

/**
 * Получить инициалы из email или имени
 */
function getInitials(email?: string, displayName?: string): string {
    if (displayName) {
        const parts = displayName.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return displayName.slice(0, 2).toUpperCase();
    }

    if (email) {
        const name = email.split('@')[0];
        return name.slice(0, 2).toUpperCase();
    }

    return '??';
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
};

export function UserAvatar({
    email,
    displayName,
    size = 'md',
    className,
}: UserAvatarProps) {
    const initials = getInitials(email, displayName);

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-full',
                'bg-brand-primary text-white font-medium',
                sizeClasses[size],
                className
            )}
        >
            {initials}
        </div>
    );
}
