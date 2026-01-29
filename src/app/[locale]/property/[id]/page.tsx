import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PropertyDetailPage } from '@/screens/property-detail-page';
import { getPropertyByIdServer, getPropertiesListServer } from '@/shared/api/properties-server';

interface PropertyPageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

// ISR configuration
export const revalidate = 21600; // 6 hours

export async function generateStaticParams() {
    try {
        // Generate params for the first 24 properties to speed up initial build
        // The rest will be substantialy generated on demand
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
    const property = await getPropertyByIdServer(id);
    const t = await getTranslations({ locale, namespace: 'propertyDetail' });

    if (!property) {
        return {
            title: t('maxTitle') || 'Property Not Found'
        };
    }

    const price = new Intl.NumberFormat('ru-RU').format(property.price);
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
    const { id } = await params;
    const property = await getPropertyByIdServer(id);

    if (!property) {
        notFound();
    }

    return <PropertyDetailPage property={property} />;
}
