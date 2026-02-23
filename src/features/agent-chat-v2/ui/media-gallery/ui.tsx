'use client';

import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getImageUrl, getImageAlt } from '@/entities/property/model/card-types';
import type { PropertyCardImage } from '@/entities/property/model/card-types';

interface MediaGalleryCollageProps {
    images: (PropertyCardImage | string)[];
    maxVisible?: number;
    alt?: string;
    labels: {
        showAll: string;
        photos: string;
        closeGallery: string;
    };
    className?: string;
}

/**
 * Галерея-коллаж медиа (стиль Telegram)
 * До 9 превью в сетке, последняя с "+N"
 * Попап со всеми фото в 1 колонку
 */
export const MediaGalleryCollage = React.memo(function MediaGalleryCollage({
    images,
    maxVisible = 9,
    alt = '',
    labels,
    className,
}: MediaGalleryCollageProps) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const totalImages = images.length;
    const visibleImages = images.slice(0, maxVisible);
    const remainingCount = totalImages - maxVisible;

    const handleOpen = useCallback(() => setIsPopupOpen(true), []);
    const handleClose = useCallback(() => setIsPopupOpen(false), []);

    // Определяем сетку в зависимости от количества изображений
    const getGridClass = () => {
        const count = visibleImages.length;
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 6) return 'grid-cols-3';
        return 'grid-cols-3';
    };

    // Высота ячейки зависит от количества
    const getCellClass = (index: number) => {
        const count = visibleImages.length;
        if (count === 1) return 'col-span-1 aspect-[16/10]';
        if (count === 2) return 'col-span-1 aspect-square';
        if (count === 3) {
            return index === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'col-span-1 aspect-square';
        }
        if (count === 4) return 'col-span-1 aspect-square';
        if (count <= 6) {
            if (index < 3) return 'col-span-1 aspect-[4/3]';
            return 'col-span-1 aspect-square';
        }
        // 7-9
        if (index < 3) return 'col-span-1 aspect-[4/3]';
        return 'col-span-1 aspect-square';
    };

    if (totalImages === 0) return null;

    return (
        <>
            {/* Коллаж-сетка */}
            <div
                className={cn(
                    'grid gap-0.5 rounded-lg overflow-hidden cursor-pointer',
                    getGridClass(),
                    className
                )}
                onClick={handleOpen}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
                aria-label={`${labels.showAll} ${totalImages} ${labels.photos}`}
            >
                {visibleImages.map((img, index) => {
                    const isLast = index === maxVisible - 1 && remainingCount > 0;
                    return (
                        <div
                            key={index}
                            className={cn('relative overflow-hidden', getCellClass(index))}
                        >
                            <img
                                src={getImageUrl(img)}
                                alt={getImageAlt(img, `${alt} ${index + 1}`)}
                                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                loading="lazy"
                            />
                            {isLast && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">
                                        +{remainingCount}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Попап — все фото в 1 колонку */}
            {isPopupOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    {/* Кнопка закрытия */}
                    <button
                        className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-background/80 text-text-primary hover:bg-background transition-colors"
                        onClick={handleClose}
                        aria-label={labels.closeGallery}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Счётчик */}
                    <div className="absolute top-4 left-4 z-[60] px-3 py-1.5 rounded-full bg-background/80 text-text-primary text-sm font-medium">
                        {totalImages} {labels.photos}
                    </div>

                    {/* Скролл-контейнер с фото */}
                    <div
                        className="h-full overflow-y-auto py-16 px-4 scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="max-w-2xl mx-auto space-y-2">
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={getImageUrl(img)}
                                    alt={getImageAlt(img, `${alt} ${index + 1}`)}
                                    className="w-full rounded-lg"
                                    loading="lazy"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
