'use client';

import { useTranslations, useLocale } from 'next-intl';
import { PropertyDetailHeader } from '@/widgets/property-detail-header';
import type { HeaderTranslations } from '@/widgets/property-detail-header/ui';

/**
 * Страница деталей объекта недвижимости.
 * Отображается по маршруту [locale]/[slug]/[detail].
 *
 * Основной хедер (SearchPageHeader) рендерится в SlugLayoutClient.
 * Здесь добавляется второй уровень навигации (PropertyDetailHeader variant="subHeader").
 */
export default function DetailPage() {
    const t = useTranslations('propertyDetail');
    const locale = useLocale();

    // Переводы для второго уровня навигации
    const headerTranslations: HeaderTranslations = {
        back: t('back'),
        navPhotos: t('navPhotos'),
        navMedia: t('navMedia'),
        navDescription: t('navDescription'),
        navCharacteristics: t('navCharacteristics'),
        navMap: t('navMap'),
        previous: t('previous'),
        next: t('next'),
    };

    const mainInfoTranslations = {
        sqm: t('sqm'),
        floor: t('floor'),
        rooms: t('rooms'),
        roomsShort: t('roomsShort'),
        livingArea: t('livingArea'),
        kitchenArea: t('kitchenArea'),
        ceilingHeight: t('ceilingHeight'),
        bathrooms: t('bathrooms'),
        area: t('area'),
        pricePerMeter: t('pricePerMeter'),
    };

    return (
        <div className="flex flex-col h-full">
            {/* Второй уровень навигации (sub-header) */}
            <div className="shrink-0 sticky top-0 z-40">
                <PropertyDetailHeader
                    translations={headerTranslations}
                    mainInfoTranslations={mainInfoTranslations}
                    locale={locale}
                    variant="subHeader"
                />
            </div>

            {/* Контент страницы деталей */}
            <main className="flex-1 overflow-auto bg-background">
                <div className="container mx-auto px-4 py-6">
                    {/* TODO: Здесь будет PropertyDetailWidget с данными от API */}
                    <div id="photos" className="scroll-mt-24">
                        {/* Секция медиа */}
                    </div>
                    <div id="characteristics" className="scroll-mt-24">
                        {/* Секция характеристик */}
                    </div>
                    <div id="description" className="scroll-mt-24">
                        {/* Секция описания */}
                    </div>
                    <div id="map" className="scroll-mt-24">
                        {/* Секция карты */}
                    </div>
                </div>
            </main>
        </div>
    );
}
