'use client';

import { memo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PropertyCardImage } from '@/entities/property';
import { getImageUrl, getImageAlt } from '@/entities/property';

interface MediaGalleryPopupProps {
  images: (PropertyCardImage | string)[];
  isOpen: boolean;
  onClose: () => void;
  labels: {
    allPhotos: string;
    photo: string;
    of: string;
    close: string;
  };
  className?: string;
}

const HEADER_HEIGHT_PX = 52;

export const MediaGalleryPopup = memo(function MediaGalleryPopup({
  images,
  isOpen,
  onClose,
  labels,
  className,
}: MediaGalleryPopupProps) {
  // Закрытие по Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 bg-background/95 backdrop-blur-sm',
      className
    )}>
      {/* Заголовок с кнопкой закрытия */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-sm border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">
          {labels.allPhotos} ({images.length})
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-background-tertiary transition-colors cursor-pointer"
          aria-label={labels.close}
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Список фото — одна колонка с прокруткой */}
      <div
        className="overflow-y-auto px-2 py-2 space-y-2 scrollbar-hide"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT_PX}px)` }}
      >
        {images.map((img, index) => {
          const url = getImageUrl(img);
          const alt = getImageAlt(img, `${labels.photo} ${index + 1}`);

          return (
            <div key={index} className="relative w-full rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={url}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index < 3}
                />
              </div>
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs text-text-secondary">
                {index + 1} {labels.of} {images.length}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
