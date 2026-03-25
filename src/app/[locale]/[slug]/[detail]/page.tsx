import { getTranslations } from 'next-intl/server';
import { DetailSubHeader } from './_detail-sub-header';

/**
 * Страница деталей объекта недвижимости.
 * Отображается по маршруту [locale]/[slug]/[detail].
 *
 * Основной хедер (SearchPageHeader) рендерится в SlugLayoutClient.
 * Здесь добавляется второй уровень навигации (PropertyDetailHeader variant="subHeader").
 */
export default async function DetailPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'propertyDetail' });

    // Переводы для второго уровня навигации
    const headerTranslations = {
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
            <DetailSubHeader
                translations={headerTranslations}
                mainInfoTranslations={mainInfoTranslations}
                locale={locale}
            />

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
