import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PropertyDetailPage } from '@/screens/property-detail-page';
import { getPropertyByIdServer, getPropertyBySlugServer, getPropertiesListServer } from '@/shared/api/properties-server';
import { getPropertyPageTranslations } from '@/shared/lib/get-property-translations';
import { getNearbyPlaces, getAgentProperties, getSimilarProperties } from '@/shared/api';
import { FEATURES } from '@/shared/config/features';
import { generateMockGridCardsPage } from '@/shared/api/mocks/properties-mock';
import { Link } from 'lucide-react';

interface PropertyPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

// ISR configuration - revalidate every 6 hours
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

export async function generateStaticParams() {
    try {
        // Используем моки если включен флаг
        let data;
        if (FEATURES.USE_MOCK_PROPERTIES) {
            console.log('[StaticParams] Using mock mode for properties');
            const mockPage = generateMockGridCardsPage(1, 24, 500, {
                cardType: 'grid',
                includeAuthor: true,
                includeTransport: true
            });
            data = mockPage.data;
        } else {
            const response = await getPropertiesListServer({
                filters: {},
                page: 1,
                limit: 24,
            });
            data = response.data;
        }

        return data
            .filter((property) => property.slug)
            .map((property) => ({
                slug: property.slug!,
            }));
    } catch (e) {
        console.error('[StaticParams] Failed to generate static params', e);
        return [];
    }
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
    const { locale, slug } = await params;

    // Parallel data fetching
    const [property, t] = await Promise.all([
        fetchProperty(slug, locale),
        getTranslations({ locale, namespace: 'propertyDetail' }),
    ]);

    if (!property) {
        return {
            title: 'Property Not Found'
        };
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
            type: 'article'
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: property.images[0] ? [property.images[0]] : []
        }
    };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
    const { locale, slug } = await params;

    // Parallel data fetching - property and translations
    const [property, translations] = await Promise.all([
        fetchProperty(slug, locale),
        getPropertyPageTranslations(locale),
    ]);

    if (!property) {
        notFound();
    }

    // Use company_id for fetching company properties (not agent's personal id)
    const companyId = property.author?.companyId || property.author?.id;

    // Fetch additional data in parallel (after we have property for agent ID)
    const [nearbyPlaces, agentProperties, similarProperties] = await Promise.all([
        getNearbyPlaces(property.coordinates),
        companyId
            ? getAgentProperties(companyId, property.id)
            : Promise.resolve([]),
        getSimilarProperties(property.id)
    ]);

    return (
        <PropertyDetailPage
            property={property}
            translations={translations}
            locale={locale}
            nearbyPlaces={nearbyPlaces}
            agentProperties={agentProperties}
            similarProperties={similarProperties}
        />
    );
}
