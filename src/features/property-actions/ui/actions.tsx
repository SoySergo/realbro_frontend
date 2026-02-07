'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { Heart, Share2, Pencil, FileDown, Flag, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/shared/ui/toast';

export interface PropertyActionsTranslations {
    addToFavorites: string;
    inFavorites: string;
    share: string;
    linkCopied: string;
    note: string;
    pdf: string;
    report: string;
}

interface PropertyActionsProps {
    propertyId: string;
    isFavorite?: boolean;
    translations: PropertyActionsTranslations;
    onToggleFavorite?: (id: string) => void;
    onShare?: (id: string) => void;
    className?: string;
    variant?: 'row' | 'column' | 'full' | 'primary' | 'secondary';
}

export function PropertyActions({
    propertyId,
    isFavorite = false,
    translations,
    onToggleFavorite,
    onShare,
    className,
    variant = 'row'
}: PropertyActionsProps) {
    const t = translations;
    const { showToast } = useToast();
    const [isLiked, setIsLiked] = useState(isFavorite);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch { /* fallback */ }
        }
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch {
            return false;
        }
    }, []);

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
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url,
                });
                onShare?.(propertyId);
                return;
            } catch {
                // Пользователь отменил — fallback на копирование
            }
        }

        const copied = await copyToClipboard(url);
        if (copied) {
            showToast(t.linkCopied, 'success');
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
                            ? 'text-error hover:bg-error/10 dark:hover:bg-error/20'
                            : 'text-muted-foreground hover:bg-muted hover:text-error'
                    )}
                >
                    <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                    {isLiked ? t.inFavorites : t.addToFavorites}
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
                </button>

                 <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <Share2 className="w-4 h-4" />
                    {t.share}
                </button>
            </div>
        );
    }

    if (variant === 'secondary') {
         const actions = [
            { icon: Pencil, label: t.note },
            { icon: FileDown, label: t.pdf },
            { icon: Flag, label: t.report },
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
                        ? 'text-success'
                        : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={t.addToFavorites}
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
                aria-label={t.share}
            >
                <Share2 className="w-6 h-6" />
            </button>
        </div>
    );
}
