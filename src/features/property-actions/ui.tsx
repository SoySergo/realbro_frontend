'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Heart, Share2, MoreHorizontal, Pencil, FileDown, Printer, EyeOff, Flag, ThumbsUp, ThumbsDown } from 'lucide-react';

interface PropertyActionsProps {
    propertyId: string;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
    onShare?: (id: string) => void;
    className?: string;
    variant?: 'row' | 'column' | 'full' | 'primary' | 'secondary';
}

export function PropertyActions({
    propertyId,
    isFavorite = false,
    onToggleFavorite,
    onShare,
    className,
    variant = 'row'
}: PropertyActionsProps) {
    const t = useTranslations('propertyDetail');
    const [isLiked, setIsLiked] = useState(isFavorite);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggleFavorite = () => {
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        if (newLikedState) {
            setIsDisliked(false);
        }
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        onToggleFavorite?.(propertyId);
    };

    const handleToggleDislike = () => {
        const newDislikedState = !isDisliked;
        setIsDisliked(newDislikedState);
        if (newDislikedState) {
            setIsLiked(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } catch (err) {
                // User cancelled or error
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                // Could show toast notification here
            } catch (err) {
                console.error('Failed to copy');
            }
        }
        onShare?.(propertyId);
    };

    if (variant === 'primary') {
        return (
            <div className={cn('flex items-center justify-center gap-4', className)}>
                 <button
                    onClick={handleToggleFavorite}
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium text-sm',
                         isLiked 
                            ? 'text-red-500 hover:bg-red-50' 
                            : 'text-muted-foreground hover:bg-muted hover:text-red-500'
                    )}
                >
                    <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                    {isLiked ? t('inFavorites') : t('addToFavorites')}
                </button>

                <button
                    onClick={handleToggleDislike}
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium text-sm',
                         isDisliked
                            ? 'text-foreground bg-muted' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                >
                    <ThumbsDown className={cn('w-4 h-4', isDisliked && 'fill-current')} />
                    {/* <span>Не нравится</span> */}
                </button>

                 <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <Share2 className="w-4 h-4" />
                    {t('share')}
                </button>
            </div>
        );
    }

    if (variant === 'secondary') {
         const actions = [
            { icon: Pencil, label: 'Оставить заметку' },
            { icon: FileDown, label: 'PDF' },
            { icon: Flag, label: 'Жалоба' },
        ];

        return (
            <div className={cn('flex items-center gap-1', className)}>
                {actions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={idx}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                            title={action.label}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    )
                })}
            </div>
        )
    }

    // Default or 'row' variant (kept for mobile or other uses)
    return (
        <div className={cn('flex items-center gap-1', className)}>
            <button
                onClick={handleToggleFavorite}
                className={cn(
                    'p-2 rounded-full transition-all',
                    isLiked 
                        ? 'text-green-600' 
                        : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={t('addToFavorites')}
            >
                <ThumbsUp 
                    className={cn(
                        'w-6 h-6 transition-transform',
                        isLiked && 'fill-current',
                        isAnimating && 'scale-125'
                    )} 
                />
            </button>
            <button
                onClick={handleShare}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t('share')}
            >
                <Share2 className="w-6 h-6" />
            </button>
        </div>
    );
}
