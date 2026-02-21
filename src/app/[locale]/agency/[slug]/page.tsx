import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AgencyDetailPage } from '@/screens/agency-detail-page';
import { getAgencyById, getAgencyBySlug, getAgencyProperties } from '@/shared/api';
import type { Property } from '@/entities/property/model/types';
import type { PropertyGridCard, PropertyCardImage } from '@/entities/property/model/card-types';

/** Конвертирует Property (images: string[]) → PropertyGridCard (images: PropertyCardImage[]) */
function propertyToGridCard(p: Property): PropertyGridCard {
    const images: PropertyCardImage[] = (p.images ?? []).map((url, i) => ({
        id: `${p.id}_img_${i}`,
        url,
        width: 800,
        height: 600,
        alt: p.title,
    }));

    return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        property_type: p.property_type,
        property_kind: p.property_kind,
        category: p.category,
        sub_category: p.sub_category,
        currency: p.currency,
        price: p.price,
        price_per_meter: p.pricePerMeter,
        rooms: p.rooms,
        bathrooms: p.bathrooms,
        area: p.area,
        floor: p.floor,
        total_floors: p.totalFloors,
        address: p.address,
        images,
        author: p.author
            ? {
                id: p.author.id,
                name: p.author.name,
                avatar: p.author.avatar,
                type: p.author.type as 'agent' | 'owner' | 'agency',
            }
            : undefined,
        is_new: p.isNew,
        published_at: p.publishedAt ? new Date(p.publishedAt).toISOString() : p.published_at_iso,
        type: p.type,
    };
}

interface AgencyPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

// ISR: revalidate every hour
export const revalidate = 3600;

/** UUID v4 pattern */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fetch agency by slug (primary) or by ID (fallback for old links) */
async function fetchAgency(slugOrId: string, locale: string) {
    if (UUID_REGEX.test(slugOrId)) {
        return getAgencyById(slugOrId, locale);
    }
    return getAgencyBySlug(slugOrId, locale);
}

export async function generateMetadata({ params }: AgencyPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const agency = await fetchAgency(slug, locale);

    if (!agency) {
        return {
            title: 'Agency Not Found',
        };
    }

    // Формирование keywords
    const keywords = [
        agency.name,
        'агентство недвижимости',
        'real estate agency',
        ...agency.languages,
        ...agency.propertyTypes,
        ...(agency.offices.length > 0 ? [agency.offices[0].city] : []),
    ].join(', ');

    return {
        title: `${agency.name} - ${agency.offices[0]?.city || 'Real Estate Agency'}`,
        description: agency.descriptionShort || agency.description.substring(0, 160),
        keywords,
        openGraph: {
            title: agency.name,
            description: agency.descriptionShort || agency.description.substring(0, 160),
            images: agency.logo ? [agency.logo] : [],
            type: 'website',
            locale: locale,
            siteName: 'RealBro',
        },
        alternates: {
            canonical: `/${locale}/agency/${slug}`,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function Page({ params }: AgencyPageProps) {
    const { locale, slug } = await params;

    // Загрузка данных параллельно
    // fetchAgency uses slug for URL display, falls back to ID for old links
    const agency = await fetchAgency(slug, locale);

    if (!agency) {
        notFound();
    }

    // Use agency.id (UUID) for fetching properties
    const propertiesResult = await getAgencyProperties(agency.id, 1, 12);
    const properties = propertiesResult.data.map(propertyToGridCard);

    return (
        <AgencyDetailPage
            agency={agency}
            properties={properties}
            locale={locale}
        />
    );
}
