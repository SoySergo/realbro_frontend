'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAutosearchStore } from '@/features/autosearch';
import { PropertyOpenCard, type PropertyCardLabels } from '@/entities/chat';
import { PropertyActionButtons } from '@/features/chat-property-actions/ui/property-action-buttons';
import { usePropertyActionsStore } from '@/features/chat-property-actions';
import { PropertyCompareButton } from '@/features/comparison';
import { ScrollToBottomButton } from '@/shared/ui/scroll-to-bottom';
import type { AutosearchProperty } from '@/entities/autosearch';

interface AutosearchPropertyFeedProps {
    className?: string;
    labels: {
        title: string;
        noProperties: string;
        propertyCard?: PropertyCardLabels;
    };
}

/**
 * Лента входящих объектов от AutoSearch
 * 
 * Отображает объекты недвижимости, поступающие в реальном времени
 * через WebSocket канал autosearch:user_{userId}
 */
export function AutosearchPropertyFeed({
    className,
    labels,
}: AutosearchPropertyFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const isAtBottomRef = useRef(true);
    
    const { incomingProperties, markPropertyAsViewed } = useAutosearchStore();
    const { viewedIds } = usePropertyActionsStore();

    // Проверка позиции скролла
    const checkScrollPosition = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        
        const { scrollTop, scrollHeight, clientHeight } = el;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        const atBottom = distanceFromBottom <= 50;
        setIsAtBottom(atBottom);
        isAtBottomRef.current = atBottom;
    }, []);

    // Скролл к низу
    const scrollToBottom = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        
        el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth',
        });
        setIsAtBottom(true);
    }, []);

    // Отслеживание скролла
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        
        el.addEventListener('scroll', checkScrollPosition);
        checkScrollPosition();
        
        return () => {
            el.removeEventListener('scroll', checkScrollPosition);
        };
    }, [checkScrollPosition]);

    // Автоскролл при новых объектах (если внизу)
    useEffect(() => {
        if (isAtBottomRef.current && incomingProperties.length > 0) {
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, [incomingProperties.length, scrollToBottom]);

    // Пометить как просмотренное при отображении
    const handlePropertyViewed = useCallback(
        (propertyId: string) => {
            if (!viewedIds.includes(propertyId)) {
                markPropertyAsViewed(propertyId);
            }
        },
        [viewedIds, markPropertyAsViewed]
    );

    return (
        <div className={cn('flex flex-col h-full bg-background', className)}>
            {/* Заголовок */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
                <Bot className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-text-primary">
                    {labels.title}
                </h2>
                {incomingProperties.length > 0 && (
                    <span className="ml-auto text-xs text-text-secondary">
                        {incomingProperties.length} объектов
                    </span>
                )}
            </div>

            {/* Лента объектов */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 relative"
            >
                {incomingProperties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8" />
                        </div>
                        <p className="text-sm max-w-sm">{labels.noProperties}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {incomingProperties.map((property) => (
                            <div 
                                key={property.id} 
                                className={cn(
                                    'transition-all duration-300',
                                    property.autosearchMetadata.isNew && 'animate-fade-in'
                                )}
                                onMouseEnter={() => handlePropertyViewed(property.id)}
                            >
                                <PropertyOpenCard
                                    property={property}
                                    renderActions={() => (
                                        <div className="flex items-center gap-2">
                                            <PropertyActionButtons propertyId={property.id} />
                                            <PropertyCompareButton propertyId={property.id} />
                                        </div>
                                    )}
                                    labels={labels.propertyCard}
                                    isNew={property.autosearchMetadata.isNew}
                                />
                                
                                {/* Метаданные AutoSearch */}
                                {property.autosearchMetadata.filterNames.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        {property.autosearchMetadata.filterNames.map((filterName, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                                            >
                                                {filterName}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Кнопка скролла вниз */}
                {!isAtBottom && incomingProperties.length > 0 && (
                    <ScrollToBottomButton onClick={scrollToBottom} />
                )}
            </div>
        </div>
    );
}
