'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { usePropertyActionsStore } from '../../model/store';

interface PropertyActionButtonsProps {
    propertyId: string;
    onViewDetails?: () => void;
    className?: string;
}

/**
 * Action buttons for property cards (like, dislike, save, view)
 * Memoized to prevent re-renders when other properties change
 */
export const PropertyActionButtons = React.memo(function PropertyActionButtons({
    propertyId,
    onViewDetails,
    className,
}: PropertyActionButtonsProps) {
    const { likedIds, dislikedIds, savedIds, toggleLike, toggleDislike, toggleSave, markViewed } =
        usePropertyActionsStore();

    const isLiked = likedIds.includes(propertyId);
    const isDisliked = dislikedIds.includes(propertyId);
    const isSaved = savedIds.includes(propertyId);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleLike(propertyId);
        markViewed(propertyId);
    };

    const handleDislike = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleDislike(propertyId);
        markViewed(propertyId);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleSave(propertyId);
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        markViewed(propertyId);
        onViewDetails?.();
    };

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <button
                onClick={handleLike}
                className={cn(
                    'p-1.5 rounded-lg transition-all duration-200 cursor-pointer',
                    isLiked
                        ? 'bg-success/15 text-success'
                        : 'text-text-tertiary hover:text-success hover:bg-success/10'
                )}
                title="Like"
            >
                <ThumbsUp className={cn('w-4 h-4', isLiked && 'fill-current')} />
            </button>
            <button
                onClick={handleDislike}
                className={cn(
                    'p-1.5 rounded-lg transition-all duration-200 cursor-pointer',
                    isDisliked
                        ? 'bg-error/15 text-error'
                        : 'text-text-tertiary hover:text-error hover:bg-error/10'
                )}
                title="Dislike"
            >
                <ThumbsDown className={cn('w-4 h-4', isDisliked && 'fill-current')} />
            </button>
            <button
                onClick={handleSave}
                className={cn(
                    'p-1.5 rounded-lg transition-all duration-200 cursor-pointer',
                    isSaved
                        ? 'bg-warning/15 text-warning'
                        : 'text-text-tertiary hover:text-warning hover:bg-warning/10'
                )}
                title="Save"
            >
                <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
            </button>
            <button
                onClick={handleView}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-brand-primary hover:bg-brand-primary-light transition-all duration-200 cursor-pointer ml-auto"
                title="View details"
            >
                <ExternalLink className="w-4 h-4" />
            </button>
        </div>
    );
});

