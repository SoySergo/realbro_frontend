import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DetailSubHeader } from './_detail-sub-header';
import { DetailContent } from './_detail-content';
import { getPropertyByIdServer, getPropertyBySlugServer } from '@/shared/api/properties-server';
import { getPropertyPageTranslations } from '@/shared/lib/get-property-translations';
import { getNearbyPlaces, getAgentProperties, getSimilarProperties } from '@/shared/api';

interface DetailPageProps {
    params: Promise<{
        locale: string;
        type: string;
        slug: string;
    }>;
}

/** UUID v4 pattern */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Получение объекта по slug (основной) или по ID (fallback для старых ссылок) */
async function fetchProperty(slugOrId: string, locale: string) {
    if (UUID_REGEX.test(slugOrId)) {
        return getPropertyByIdServer(slugOrId);
    }
    return getPropertyBySlugServer(slugOrId, locale);
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
    const { locale, slug } = await params;

    const [property, t] = await Promise.all([
        fetchProperty(slug, locale),
        getTranslations({ locale, namespace: 'propertyDetail' }),
    ]);

    if (!property) {
        return { title: 'Property Not Found' };
    }

    const price = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : locale === 'fr' ? 'fr-FR' : 'en-US').format(property.price);
    const title = property.seo_title || `${property.title} | ${price} €/${t('perMonth')}`;
    const description = property.seo_description || property.description.substring(0, 160);

    return {
        title,
        description,
        keywords: property.seo_keywords,
        openGraph: {
            title,
            description,
            images: property.images[0] ? [property.images[0]] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: property.images[0] ? [property.images[0]] : [],
        },
    };
}

/**
 * Страница деталей объекта недвижимости.
 * Отображается по маршруту [locale]/[type]/[slug].
 *
 * Основной хедер (SearchPageHeader) рендерится в SlugLayoutClient.
 * Здесь добавляется второй уровень навигации (PropertyDetailHeader variant="subHeader")
 * и контент через PropertyDetailWidget.
 */
export default async function DetailPage({ params }: DetailPageProps) {
    const { locale, slug } = await params;

    // Параллельная загрузка объекта и переводов
    const [property, translations] = await Promise.all([
        fetchProperty(slug, locale),
        getPropertyPageTranslations(locale),
    ]);

    if (!property) {
        notFound();
    }

    // company_id для загрузки объектов компании
    const companyId = property.author?.companyId || property.author?.id;

    // Параллельная загрузка дополнительных данных
    const [nearbyPlaces, agentProperties, similarProperties] = await Promise.all([
        getNearbyPlaces(property.coordinates),
        companyId
            ? getAgentProperties(companyId, property.id)
            : Promise.resolve([]),
        getSimilarProperties(property.id),
    ]);

    return (
        <div className="flex flex-col h-full">
            {/* Второй уровень навигации (sub-header) */}
            <DetailSubHeader
                translations={translations.header}
                mainInfoTranslations={translations.mainInfo}
                locale={locale}
                price={property.price}
                area={property.area}
                rooms={property.rooms}
                title={property.title}
                floor={property.floor}
            />

            {/* Контент страницы деталей */}
            <main className="flex-1 overflow-auto bg-background">
                <DetailContent
                    property={property}
                    translations={translations}
                    locale={locale}
                    nearbyPlaces={nearbyPlaces}
                    agentProperties={agentProperties}
                    similarProperties={similarProperties}
                />
            </main>
        </div>
    );
}
