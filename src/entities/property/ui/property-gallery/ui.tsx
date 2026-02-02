'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn, Map, Play, Box, Camera, Group } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';

import type { PropertyVideo, PropertyTour3D } from '@/entities/property/model/types';

interface PropertyGalleryProps {
    images: string[];
    title?: string;
    floorPlan?: string;
    video?: PropertyVideo;
    tour3d?: PropertyTour3D;
    className?: string;
}

export function PropertyGallery({ images, title, floorPlan, video, tour3d, className }: PropertyGalleryProps) {
    const t = useTranslations('propertyDetail');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeView, setActiveView] = useState<'photos' | 'video' | 'tour3d' | 'plan'>('photos');
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

    // Touch handlers for swipe (removed in favor of native scroll)
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

    // Handle scroll for native slider
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollLeft = container.scrollLeft;
        const width = container.offsetWidth;
        // Simple calculation - can be improved with IntersectionObserver for better accuracy
        const index = Math.round(scrollLeft / width);
        // Clamp index
        const safeIndex = Math.min(Math.max(index, 0), images.length - 1);
        if (safeIndex !== currentIndex) {
            setCurrentIndex(safeIndex);
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

            {/* Mobile Carousel - Native Horizontal Scroll */}
            <div className={cn('md:hidden relative group mt-4', className)}>
                <div className="relative aspect-9/10 w-full">
                    {/* Photos View */}
                    <div 
                        className={cn(
                            "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain pl-4 pr-[calc(15vw-16px)] pb-4 h-full absolute inset-0 transition-opacity duration-300",
                            activeView === 'photos' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        )}
                        ref={containerRef}
                        onScroll={handleScroll}
                        style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
                    >
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "relative w-[85vw] shrink-0 snap-start snap-always h-full rounded-xl overflow-hidden mr-3 last:mr-0 bg-muted",
                                )}
                            >
                                {/* Background: Blurred and Covered */}
                                <Image
                                    src={img}
                                    alt={title || `Image ${idx + 1}`}
                                    fill
                                    className="object-cover blur-xl scale-110 opacity-60"
                                    priority={idx === 0}
                                    sizes="85vw"
                                />
                                
                                {/* Foreground: Contained */}
                                <Image
                                    src={img}
                                    alt={title || `Image ${idx + 1}`}
                                    fill
                                    className="object-contain relative z-10"
                                    priority={idx === 0}
                                    sizes="85vw"
                                />
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 to-transparent pointer-events-none z-20" />
                            </div>
                        ))}
                        
                        {/* End of scroll indicator */}
                        <div className="flex flex-col items-center justify-center min-w-[40px] h-full shrink-0 opacity-30">
                            <div className="w-1 h-12 bg-text-tertiary rounded-full" />
                        </div>
                    </div>

                    {/* Video View */}
                    {video && (
                        <div className={cn(
                            "absolute inset-0 z-10 bg-zinc-900 dark:bg-black rounded-xl overflow-hidden flex items-center justify-center transition-opacity duration-300 mx-4 mb-4",
                            activeView === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        )}>
                            <div className="text-center text-white">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                    <Play className="w-8 h-8 fill-white" />
                                </div>
                                <p className="font-medium">{t('videoPresentation')}</p>
                            </div>
                            <Image 
                                src={video.thumbnail || images[0]} 
                                alt="Video thumbnail" 
                                fill 
                                className="object-cover opacity-50 -z-10" 
                            />
                        </div>
                    )}

                    {/* 3D Tour View */}
                    {tour3d && (
                        <div className={cn(
                            "absolute inset-0 z-10 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center transition-opacity duration-300 mx-4 mb-4",
                            activeView === 'tour3d' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        )}>
                            <div className="text-center text-white">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                    <Box className="w-8 h-8" />
                                </div>
                                <p className="font-medium">{t('tour3d')}</p>
                            </div>
                            <Image 
                                src={tour3d.thumbnail || images[0]} 
                                alt="3D Tour thumbnail" 
                                fill 
                                className="object-cover opacity-30 -z-10" 
                            />
                        </div>
                    )}

                    {/* Plan View */}
                    {floorPlan && (
                        <div className={cn(
                            "absolute inset-0 z-10 bg-background rounded-xl overflow-hidden flex items-center justify-center transition-opacity duration-300 mx-4 mb-4 border border-border/10",
                            activeView === 'plan' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        )}>
                            <div className="relative w-full h-full p-4">
                                <Image
                                    src={floorPlan}
                                    alt="Floor plan"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    )}
                </div>





                {/* Overlays */}
                {/* Counter badge - positioned bottom left inside the media area */}
                <div className="absolute bottom-7 left-8 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-sm pointer-events-none z-30">
                     {currentIndex + 1} / {totalImages}
                </div>
            </div>

            {/* Media Buttons - Below the block */}
            <div className="flex gap-2 pointer-events-auto overflow-x-auto max-w-full scrollbar-hide pb-1 mt-1.5 px-4 md:hidden">
                {/* Photos Button */}
                <button
                    onClick={() => setActiveView('photos')}
                    className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition-colors border whitespace-nowrap shrink-0",
                        activeView === 'photos'
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-secondary text-foreground border-transparent hover:bg-muted"
                    )}
                >
                        <Camera className={cn("w-3.5 h-3.5", activeView === 'photos' ? "stroke-white" : "stroke-current")} />
                        {t('photos') || 'Фото'}
                </button>

                {/* Video Button */}
                {video && (
                    <button
                        onClick={() => setActiveView(activeView === 'video' ? 'photos' : 'video')}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition-colors border whitespace-nowrap shrink-0",
                            activeView === 'video'
                                ? "bg-brand-primary text-white border-brand-primary"
                                : "bg-secondary text-foreground border-transparent hover:bg-muted"
                        )}
                    >
                            <Play className={cn("w-3.5 h-3.5", activeView === 'video' ? "fill-white stroke-white" : "fill-current stroke-current")} />
                            {t('video') || 'Видео'}
                    </button>
                )}

                {/* 3D Tour Button */}
                {tour3d && (
                    <button
                        onClick={() => setActiveView(activeView === 'tour3d' ? 'photos' : 'tour3d')}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition-colors border whitespace-nowrap shrink-0",
                            activeView === 'tour3d'
                                ? "bg-brand-primary text-white border-brand-primary"
                                : "bg-secondary text-foreground border-transparent hover:bg-muted"
                        )}
                    >
                            <Box className={cn("w-3.5 h-3.5", activeView === 'tour3d' ? "stroke-white" : "stroke-current")} />
                            {t('tour3d') || '3D-тур'}
                    </button>
                )}

                {/* Plan Button */}
                {floorPlan && (
                    <button
                        onClick={() => setActiveView(activeView === 'plan' ? 'photos' : 'plan')}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition-colors border whitespace-nowrap shrink-0",
                            activeView === 'plan'
                                ? "bg-brand-primary text-white border-brand-primary"
                                : "bg-secondary text-foreground border-transparent hover:bg-muted"
                        )}
                    >
                            <Group className={cn("w-3.5 h-3.5 ", activeView === 'plan' ? "stroke-white" : "stroke-current")} />
                            {t('plan') || 'Планировка'}
                    </button>
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
