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
        <div className="shrink-0 fixed w-full top-[60px] md:px-6 z-40">
            <PropertyDetailHeader
                translations={translations}
                mainInfoTranslations={mainInfoTranslations}
                locale={locale}
                variant="subHeader"
            />
        </div>
    );
}
