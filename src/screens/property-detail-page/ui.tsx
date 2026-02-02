'use client';

import { PropertyDetailWidget } from '@/widgets/property-detail';
import { Footer } from '@/widgets/footer';
import { PropertyDetailHeader } from '@/widgets/property-detail-header';
import type { Property } from '@/entities/property/model/types';
import type { PropertyPageTranslations } from '@/shared/lib/get-property-translations';
import type { NearbyPlaces, AgentPropertyCard, SimilarPropertyCard } from '@/shared/api';

interface PropertyDetailPageProps {
    property: Property;
    translations: PropertyPageTranslations;
    locale: string;
    nearbyPlaces?: NearbyPlaces;
    agentProperties?: AgentPropertyCard[];
    similarProperties?: SimilarPropertyCard[];
}

export function PropertyDetailPage({
    property,
    translations,
    locale,
    nearbyPlaces,
    agentProperties,
    similarProperties
}: PropertyDetailPageProps) {
    return (
        <main className="min-h-screen bg-background">
            {/* SEO-critical content is pre-rendered with translations from server */}
            <PropertyDetailHeader
                price={property.price}
                area={property.area}
                rooms={property.rooms}
                title={property.title}
                floor={property.floor}
                translations={translations.header}
                mainInfoTranslations={translations.mainInfo}
            />
            <PropertyDetailWidget
                property={property}
                translations={translations}
                locale={locale}
                nearbyPlaces={nearbyPlaces}
                agentProperties={agentProperties}
                similarProperties={similarProperties}
            />
            <Footer />
        </main>
    );
}

