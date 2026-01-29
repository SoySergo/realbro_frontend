'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';

interface PropertyGalleryProps {
    images: string[];
    title?: string;
    className?: string;
}

export function PropertyGallery({ images, title, className }: PropertyGalleryProps) {
    const t = useTranslations('propertyDetail');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalImages = images.length;
    const minSwipeDistance = 50;

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, [totalImages]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }, [totalImages]);

    const goToIndex = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    // Touch handlers for swipe
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrev();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen) {
                if (e.key === 'ArrowRight') goToNext();
                if (e.key === 'ArrowLeft') goToPrev();
                if (e.key === 'Escape') setIsLightboxOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, goToNext, goToPrev]);

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isLightboxOpen]);

    if (!images.length) {
        return (
            <div className={cn('bg-muted flex items-center justify-center aspect-[4/3]', className)}>
                <span className="text-muted-foreground">No images</span>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Carousel */}
            <div 
                className={cn('md:hidden relative', className)}
                ref={containerRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                        src={images[currentIndex]}
                        alt={title || `Image ${currentIndex + 1}`}
                        fill
                        className="object-cover"
                        priority={currentIndex === 0}
                    />
                    
                    {/* Counter badge */}
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {currentIndex + 1} / {totalImages}
                    </div>
                    
                    {/* Zoom button */}
                    <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors"
                        aria-label={t('showAllPhotos', { count: totalImages })}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Dot indicators */}
                {totalImages > 1 && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.slice(0, Math.min(5, totalImages)).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToIndex(idx)}
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full transition-all',
                                    idx === currentIndex 
                                        ? 'bg-white w-3' 
                                        : 'bg-white/50'
                                )}
                                aria-label={`Go to image ${idx + 1}`}
                            />
                        ))}
                        {totalImages > 5 && (
                            <span className="text-white/70 text-xs ml-1">+{totalImages - 5}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop View */}
            <div className={cn('hidden md:flex flex-col gap-2', className)}>
                {/* Main Image */}
                <div 
                    className="relative w-full h-[440px] rounded-lg overflow-hidden group cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                >
                    {/* Background Blurred Image */}
                    <div className="absolute inset-0">
                         <Image
                            src={images[currentIndex]}
                            alt=""
                            fill
                            className="object-cover opacity-40 blur-xl scale-110"
                         />
                    </div>

                    {/* Main Contained Image */}
                    <Image
                        src={images[currentIndex]}
                        alt={title || 'Main image'}
                        fill
                        className="object-contain relative z-10 transition-transform duration-500 hover:scale-105"
                        priority
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none z-20" />

                    {/* Navigation Buttons (visible on hover) */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrev();
                            }}
                            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-transform hover:scale-110"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-transform hover:scale-110"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Count Indicator */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none z-20">
                        {currentIndex + 1} / {totalImages}
                    </div>
                </div>

                {/* Thumbnails Row */}
                <div className="w-full overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide">
                     <div className="flex items-center gap-2 h-[64px]">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToIndex(idx)}
                                className={cn(
                                    'relative w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden transition-all',
                                    idx === currentIndex 
                                        ? 'border border-brand-primary' 
                                        : 'opacity-70 hover:opacity-100'
                                )}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                     </div>
                </div>
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    {/* Counter */}
                    <div className="absolute top-4 left-4 text-white text-sm">
                        {currentIndex + 1} / {totalImages}
                    </div>
                    
                    {/* Navigation buttons */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrev();
                        }}
                        className="absolute left-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        className="absolute right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Next"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                    
                    {/* Main image */}
                    <div 
                        className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <Image
                            src={images[currentIndex]}
                            alt={title || `Image ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    
                    {/* Thumbnail strip */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToIndex(idx);
                                }}
                                className={cn(
                                    'relative w-16 h-12 shrink-0 rounded overflow-hidden transition-all',
                                    idx === currentIndex 
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black' 
                                        : 'opacity-60 hover:opacity-100'
                                )}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
