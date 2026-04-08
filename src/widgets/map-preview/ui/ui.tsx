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
                    className="w-full cursor-pointer group"
                    onClick={onOpenMap}
                >
                    <div className="relative rounded-2xl overflow-hidden bg-background shadow-sm border border-border/60 transition-all hover:border-brand-primary/30 hover:shadow-md">
                        <div className="relative h-[160px] w-full">
                            <Image
                                src="/images/template_map.webp"
                                alt="Map preview"
                                fill
                                className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                                sizes="(max-width: 1024px) 100vw, 480px"
                            />
                            {/* Градиентный оверлей для лучшей читаемости */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                        </div>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-background/95 backdrop-blur-md hover:bg-background shadow-sm border border-border/40 rounded-full h-9 px-5 text-[13px] font-medium whitespace-nowrap transition-all group-hover:shadow-md group-hover:scale-105"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenMap();
                                }}
                            >
                                <Map className="h-4 w-4 mr-2" />
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
