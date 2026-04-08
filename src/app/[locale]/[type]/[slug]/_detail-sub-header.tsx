'use client';

import { PropertyDetailHeader } from '@/widgets/property-detail-header';
import type { HeaderTranslations } from '@/widgets/property-detail-header/ui';

interface DetailSubHeaderProps {
    translations: HeaderTranslations;
    mainInfoTranslations: {
        sqm: string;
        floor: string;
        rooms: string;
        roomsShort: string;
        livingArea: string;
        kitchenArea: string;
        ceilingHeight: string;
        bathrooms: string;
        area: string;
        pricePerMeter: string;
    };
    locale: string;
}

/**
 * Клиентский компонент второго уровня навигации для страницы деталей.
 * Содержит навигацию по секциям (Медиа, Характеристики, Описание, Карта)
 * и кнопки Предыдущий/Следующий.
 */
export function DetailSubHeader({ translations, mainInfoTranslations, locale }: DetailSubHeaderProps) {
    return (
        <div className="shrink-0 hidden md:block fixed w-full top-[60px] z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-6">
                <PropertyDetailHeader
                    translations={translations}
                    mainInfoTranslations={mainInfoTranslations}
                    locale={locale}
                    variant="subHeader"
                />
            </div>
        </div>
    );
}
