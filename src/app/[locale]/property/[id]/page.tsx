import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PropertyDetailPage } from '@/screens/property-detail-page';
import { getPropertyByIdServer, getPropertiesListServer } from '@/shared/api/properties-server';
import { getPropertyPageTranslations } from '@/shared/lib/get-property-translations';
import { getNearbyPlaces, getAgentProperties, getSimilarProperties } from '@/shared/api';

interface PropertyPageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

// ISR configuration - revalidate every 6 hours
export const revalidate = 21600;

export async function generateStaticParams() {
    try {
        // Generate params for the first 24 properties to speed up initial build
        // The rest will be generated on demand
        const { data } = await getPropertiesListServer({
            filters: {},
            page: 1,
            limit: 24
        });

        return data.map((property) => ({
            id: property.id
        }));
    } catch (e) {
        console.error('Failed to generate static params', e);
        return [];
    }
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
    const { locale, id } = await params;

    // Parallel data fetching
    const [property, t] = await Promise.all([
        getPropertyByIdServer(id),
        getTranslations({ locale, namespace: 'propertyDetail' })
    ]);

    if (!property) {
        return {
            title: 'Property Not Found'
        };
    }

    const price = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : locale === 'fr' ? 'fr-FR' : 'en-US').format(property.price);
    const title = `${property.title} | ${price} €/${t('perMonth')}`;
    const description = property.description.substring(0, 160);

    return {
        title,
        description,
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
    const { locale, id } = await params;

    // Parallel data fetching - property and translations
    const [property, translations] = await Promise.all([
        getPropertyByIdServer(id),
        getPropertyPageTranslations(locale)
    ]);

    if (!property) {
        notFound();
    }

    // Fetch additional data in parallel (after we have property for agent ID)
    const [nearbyPlaces, agentProperties, similarProperties] = await Promise.all([
        getNearbyPlaces(id),
        property.author?.id
            ? getAgentProperties(property.author.id, id)
            : Promise.resolve([]),
        getSimilarProperties(id)
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
