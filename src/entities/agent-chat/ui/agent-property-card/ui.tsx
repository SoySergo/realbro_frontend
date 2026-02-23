'use client';

import { memo, useState, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, Flag, MapPin, Building2, Maximize2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PropertyChatCard } from '@/entities/property';
import type { AgentPropertyCardLabels, PropertyReaction } from '@/entities/agent-chat';
import { MediaGalleryCollage } from '../media-gallery-collage';
import { MediaGalleryPopup } from '../media-gallery-popup';

interface AgentPropertyCardProps {
  property: PropertyChatCard;
  reaction?: PropertyReaction;
  isFavorite?: boolean;
  isNew?: boolean;
  filterName?: string;
  onOpenThread?: () => void;
  onReact?: (reaction: PropertyReaction) => void;
  labels: AgentPropertyCardLabels;
  mediaLabels: {
    morePhotos: string;
    allPhotos: string;
    photo: string;
    of: string;
    close: string;
  };
  actionLabels: {
    like: string;
    dislike: string;
    report: string;
  };
  className?: string;
}

export const AgentPropertyCard = memo(function AgentPropertyCard({
  property,
  reaction,
  isFavorite,
  isNew,
  filterName,
  onOpenThread,
  onReact,
  labels,
  mediaLabels,
  actionLabels,
  className,
}: AgentPropertyCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleCardClick = useCallback(() => {
    onOpenThread?.();
  }, [onOpenThread]);

  const handleReact = useCallback((r: PropertyReaction, e: React.MouseEvent) => {
    e.stopPropagation();
    onReact?.(r);
  }, [onReact]);

  const price = property.price?.toLocaleString('es-ES') ?? '0';

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'rounded-xl border border-border bg-background overflow-hidden',
          'transition-all duration-200 hover:shadow-md cursor-pointer',
          'animate-message-slide-in',
          className
        )}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
      >
        {/* Медиа-коллаж с бейджами */}
        <div className="relative">
          <MediaGalleryCollage
            images={property.images}
            onOpenGallery={() => setIsGalleryOpen(true)}
            labels={{ morePhotos: mediaLabels.morePhotos }}
          />

          {/* Бейджи поверх фото */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {isNew && (
              <span className="px-2 py-0.5 rounded-md bg-brand-primary text-white text-[10px] font-semibold uppercase">
                {labels.new}
              </span>
            )}
            {property.is_verified && (
              <span className="px-2 py-0.5 rounded-md bg-success text-white text-[10px] font-semibold">
                {labels.verified}
              </span>
            )}
          </div>
          {filterName && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-text-secondary text-[10px]">
                {filterName}
              </span>
            </div>
          )}
        </div>

        {/* Информация об объекте */}
        <div className="p-3 space-y-2">
          {/* Цена */}
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-brand-primary">
              {price}€<span className="text-xs font-normal text-text-tertiary">{labels.perMonth}</span>
            </span>
            {isFavorite && (
              <span className="text-error text-sm">❤️</span>
            )}
          </div>

          {/* Характеристики */}
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            {property.rooms > 0 && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {property.rooms} {labels.rooms}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              {property.area} {labels.area}
            </span>
            {property.floor && (
              <span>
                {property.floor}{property.total_floors ? `/${property.total_floors}` : ''} {labels.floor}
              </span>
            )}
          </div>

          {/* Адрес */}
          <div className="flex items-start gap-1.5 text-xs text-text-tertiary">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{property.address}</span>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center border-t border-border">
          <button
            onClick={(e) => handleReact('like', e)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors cursor-pointer',
              reaction === 'like'
                ? 'text-success bg-success/10'
                : 'text-text-tertiary hover:text-success hover:bg-success/5'
            )}
          >
            <ThumbsUp className="w-4 h-4" />
            {actionLabels.like}
          </button>
          <div className="w-px h-6 bg-border" />
          <button
            onClick={(e) => handleReact('dislike', e)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors cursor-pointer',
              reaction === 'dislike'
                ? 'text-error bg-error/10'
                : 'text-text-tertiary hover:text-error hover:bg-error/5'
            )}
          >
            <ThumbsDown className="w-4 h-4" />
            {actionLabels.dislike}
          </button>
          <div className="w-px h-6 bg-border" />
          <button
            onClick={(e) => handleReact('report', e)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors cursor-pointer',
              reaction === 'report'
                ? 'text-warning bg-warning/10'
                : 'text-text-tertiary hover:text-warning hover:bg-warning/5'
            )}
          >
            <Flag className="w-4 h-4" />
            {actionLabels.report}
          </button>
        </div>
      </div>

      {/* Галерея popup */}
      <MediaGalleryPopup
        images={property.images}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        labels={mediaLabels}
      />
    </>
  );
});
