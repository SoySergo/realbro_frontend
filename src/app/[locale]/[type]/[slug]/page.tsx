import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PropertyDetailPage } from '@/screens/property-detail-page';
import { getPropertyByIdServer, getPropertyBySlugServer } from '@/shared/api/properties-server';
import { getPropertyPageTranslations } from '@/shared/lib/get-property-translations';
import { getNearbyPlaces, getAgentProperties, getSimilarProperties } from '@/shared/api';
import { DetailSubHeader } from './_detail-sub-header';

interface PropertySlugPageProps {
    params: Promise<{
        locale: string;
        type: string;
        slug: string;
    }>;
}

// ISR — ревалидация каждые 6 часов
export const revalidate = 21600;

/** UUID v4 pattern */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fetch property by slug (primary) or by ID (fallback for old links) */
async function fetchProperty(slugOrId: string, locale: string) {
    if (UUID_REGEX.test(slugOrId)) {
        return getPropertyByIdServer(slugOrId);
    }
    return getPropertyBySlugServer(slugOrId, locale);
}

export async function generateMetadata({ params }: PropertySlugPageProps): Promise<Metadata> {
    const { locale, slug } = await params;

    const [property, t] = await Promise.all([
        fetchProperty(slug, locale),
        getTranslations({ locale, namespace: 'propertyDetail' }),
    ]);

    if (!property) {
        return { title: 'Property Not Found' };
    }

    const price = new Intl.NumberFormat(
        locale === 'ru' ? 'ru-RU' : locale === 'fr' ? 'fr-FR' : 'en-US'
    ).format(property.price);
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

export default async function PropertySlugPage({ params }: PropertySlugPageProps) {
    const { locale, slug } = await params;

    // Параллельная загрузка данных объекта и переводов
    const [property, translations] = await Promise.all([
        fetchProperty(slug, locale),
        getPropertyPageTranslations(locale),
    ]);

    if (!property) {
        notFound();
    }

    // Используем company_id для загрузки объектов компании
    const companyId = property.author?.companyId || property.author?.id;

    // Дополнительные данные параллельно
    const [nearbyPlaces, agentProperties, similarProperties] = await Promise.all([
        getNearbyPlaces(property.coordinates),
        companyId
            ? getAgentProperties(companyId, property.id)
            : Promise.resolve([]),
        getSimilarProperties(property.id),
    ]);

    return (
        <div className="flex flex-col bg-background ">
            {/* Второй уровень навигации (sub-header) */}
            <DetailSubHeader
                translations={translations.header}
                mainInfoTranslations={translations.mainInfo}
                locale={locale}
            />

            <PropertyDetailPage
                property={property}
                translations={translations}
                locale={locale}
                nearbyPlaces={nearbyPlaces}
                agentProperties={agentProperties}
                similarProperties={similarProperties}
            />
        </div>
    );
}
