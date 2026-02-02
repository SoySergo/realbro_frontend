'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

interface PropertyDescriptionSectionProps {
    description: string;
    descriptionOriginal?: string;
    maxLines?: number;
    className?: string;
    variant?: 'default' | 'mobile';
}

export function PropertyDescriptionSection({
    description,
    descriptionOriginal,
    variant = 'default',
    maxLines = variant === 'mobile' ? 12 : 6,
    className
}: PropertyDescriptionSectionProps & { descriptionOriginal?: string }) {
    const t = useTranslations('propertyDetail');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    const currentDescription = showOriginal ? descriptionOriginal || description : description;

    useEffect(() => {
        if (textRef.current) {
            const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
            const maxHeight = lineHeight * maxLines;
            setIsOverflowing(textRef.current.scrollHeight > maxHeight);
        }
    }, [currentDescription, maxLines]);

    if (!description) return null;

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-full justify-between">
                    <h3 className="font-semibold text-lg text-foreground">
                        {t('description')}
                    </h3>
                    
                    {descriptionOriginal && (
                        <button
                            onClick={() => setShowOriginal(!showOriginal)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer outline-none whitespace-nowrap",
                                !showOriginal
                                    ? "bg-brand-primary-light text-brand-primary border-brand-primary-light hover:bg-brand-primary-light/80"
                                    : "bg-secondary text-text-secondary border-border hover:bg-brand-primary-light hover:text-brand-primary hover:border-brand-primary-light"
                            )}
                        >
                            {variant === 'mobile' ? (
                                <>
                                    {!showOriginal ? t('showOriginal') : t('showTranslation')}
                                </>
                            ) : (
                                !showOriginal ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        {isHovered ? t('showOriginal') : t('translatedByAI')}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {t('showTranslation')}
                                    </>
                                )
                            )}
                        </button>
                    )}
                </div>
            </div>
            
            <div className="relative">
                <p 
                    ref={textRef}
                    className={cn(
                        'text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap',
                        !isExpanded && 'line-clamp-5'
                    )}
                    style={{
                        WebkitLineClamp: isExpanded ? 'unset' : maxLines
                    }}
                >
                    {currentDescription}
                </p>

                {/* Gradient fade when collapsed */}
                {isOverflowing && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
                )}
            </div>

            {/* Show more button */}
            {isOverflowing && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors mt-0"
                >
                    <span>
                        {isExpanded ? t('showLess') : t('showMore')}
                    </span>
                    <ChevronDown 
                        className={cn(
                            'w-4 h-4 transition-transform',
                            isExpanded && 'rotate-180'
                        )} 
                    />
                </button>
            )}
        </div>
    );
}
