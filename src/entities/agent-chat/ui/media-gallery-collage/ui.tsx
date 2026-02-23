'use client';

import { memo } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import type { PropertyCardImage } from '@/entities/property';
import { getImageUrl, getImageAlt } from '@/entities/property';

interface MediaGalleryCollageProps {
  images: (PropertyCardImage | string)[];
  maxDisplay?: number;
  onOpenGallery?: () => void;
  labels: {
    morePhotos: string; // "+{count}" шаблон
  };
  className?: string;
}

const MAX_DISPLAY = 9;
const ROW_HEIGHT_PX = 80;
const GRID_PADDING_PX = 16;

export const MediaGalleryCollage = memo(function MediaGalleryCollage({
  images,
  maxDisplay = MAX_DISPLAY,
  onOpenGallery,
  labels,
  className,
}: MediaGalleryCollageProps) {
  const displayCount = Math.min(images.length, maxDisplay);
  const remaining = images.length - displayCount;
  const displayImages = images.slice(0, displayCount);

  const handleClick = () => onOpenGallery?.();

  // Рендер одного элемента коллажа
  const renderImage = (img: PropertyCardImage | string, index: number, isLast: boolean) => {
    const url = getImageUrl(img);
    const alt = getImageAlt(img, `Photo ${index + 1}`);
    const showOverlay = isLast && remaining > 0;

    return (
      <button
        key={index}
        onClick={handleClick}
        className="relative w-full h-full overflow-hidden cursor-pointer group"
      >
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        {showOverlay && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {labels.morePhotos.replace('{count}', String(remaining))}
            </span>
          </div>
        )}
      </button>
    );
  };

  // Одно изображение — на всю ширину
  if (displayCount === 1) {
    return (
      <div className={cn('rounded-xl overflow-hidden h-48', className)}>
        {renderImage(displayImages[0], 0, true)}
      </div>
    );
  }

  // Два изображения — рядом
  if (displayCount === 2) {
    return (
      <div className={cn('grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden h-48', className)}>
        {displayImages.map((img, i) => renderImage(img, i, i === displayCount - 1))}
      </div>
    );
  }

  // Три изображения — большое слева, два маленьких справа
  if (displayCount === 3) {
    return (
      <div className={cn('grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden h-56', className)}>
        <div className="row-span-2">
          {renderImage(displayImages[0], 0, false)}
        </div>
        <div>{renderImage(displayImages[1], 1, false)}</div>
        <div>{renderImage(displayImages[2], 2, true)}</div>
      </div>
    );
  }

  // Четыре изображения — сетка 2x2
  if (displayCount === 4) {
    return (
      <div className={cn('grid grid-cols-2 grid-rows-2 gap-0.5 rounded-xl overflow-hidden h-56', className)}>
        {displayImages.map((img, i) => renderImage(img, i, i === displayCount - 1))}
      </div>
    );
  }

  // 5-6 изображений — 2 сверху, остальные снизу
  if (displayCount <= 6) {
    const topRow = displayImages.slice(0, 2);
    const bottomRow = displayImages.slice(2);
    return (
      <div className={cn('grid gap-0.5 rounded-xl overflow-hidden h-64', className)}>
        <div className="grid grid-cols-2 gap-0.5">
          {topRow.map((img, i) => renderImage(img, i, false))}
        </div>
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${bottomRow.length}, minmax(0, 1fr))` }}
        >
          {bottomRow.map((img, i) => renderImage(img, i + 2, i + 2 === displayCount - 1))}
        </div>
      </div>
    );
  }

  // 7-9 изображений — сетка по 3 в ряду
  const rows: (PropertyCardImage | string)[][] = [];
  for (let i = 0; i < displayCount; i += 3) {
    rows.push(displayImages.slice(i, Math.min(i + 3, displayCount)));
  }

  return (
    <div
      className={cn('grid gap-0.5 rounded-xl overflow-hidden', className)}
      style={{ height: `${rows.length * ROW_HEIGHT_PX + GRID_PADDING_PX}px` }}
    >
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
        >
          {row.map((img, ci) => {
            const idx = ri * 3 + ci;
            return renderImage(img, idx, idx === displayCount - 1);
          })}
        </div>
      ))}
    </div>
  );
});
