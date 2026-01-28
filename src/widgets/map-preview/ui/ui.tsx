'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Map } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface MapPreviewProps {
    onOpenMap: () => void;
}

/**
 * Компонент превью карты для мобильных устройств
 * Показывает статичное изображение карты с кнопкой "На карте"
 */
export const MapPreview = forwardRef<HTMLDivElement, MapPreviewProps>(
    function MapPreview({ onOpenMap }, ref) {
        const t = useTranslations('listing');

        return (
            <div ref={ref} className="md:hidden mx-3 my-4">
                <div className="relative rounded-xl overflow-hidden bg-muted">
                    {/* Map background image */}
                    <div className="relative h-40">
                        <Image
                            src="/images/template_map.webp"
                            alt="Map preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw"
                            priority
                        />
                    </div>

                    {/* Open Map Button */}
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
