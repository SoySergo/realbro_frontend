'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Map } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface MapPreviewProps {
    onOpenMap: () => void;
    /** 'inline' renders a compact card for desktop inline placement */
    variant?: 'default' | 'inline';
}

/**
 * Компонент превью карты
 * default — полноширинный блок (мобильная версия)
 * inline — компактная карточка для встраивания рядом с заголовком (desktop)
 */
export const MapPreview = forwardRef<HTMLDivElement, MapPreviewProps>(
    function MapPreview({ onOpenMap, variant = 'default' }, ref) {
        const t = useTranslations('listing');

        if (variant === 'inline') {
            return (
                <div
                    ref={ref}
                    className="shrink-0 w-[320px] cursor-pointer group"
                    onClick={onOpenMap}
                >
                    <div className="relative rounded-xl overflow-hidden bg-muted shadow-sm">
                        <div className="relative h-[140px]">
                            <Image
                                src="/images/template_map.webp"
                                alt="Map preview"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="320px"
                            />
                        </div>
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg rounded-lg h-8 px-4 text-xs font-medium whitespace-nowrap"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenMap();
                                }}
                            >
                                <Map className="h-3.5 w-3.5 mr-1.5" />
                                {t('showOnMap')}
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div ref={ref} className="mx-3 my-4">
                <div className="relative rounded-xl overflow-hidden bg-muted">
                    <div className="relative h-40">
                        <Image
                            src="/images/template_map.webp"
                            alt="Map preview"
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority
                        />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                        <Button
                            variant="secondary"
                            className="w-full bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg rounded-lg h-10"
                            onClick={onOpenMap}
                        >
                            <Map className="h-4 w-4 mr-2" />
                            {t('onMap')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
);
