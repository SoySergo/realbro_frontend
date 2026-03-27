'use client';

import { PropertyDetailWidget } from '@/widgets/property-detail';
import { Footer } from '@/widgets/footer';
import type { Property } from '@/entities/property/model/types';
import type { PropertyPageTranslations } from '@/shared/lib/get-property-translations';
import type { NearbyPlaces, AgentPropertyCard, SimilarPropertyCard } from '@/shared/api';

interface DetailContentProps {
    property: Property;
    translations: PropertyPageTranslations;
    locale: string;
    nearbyPlaces?: NearbyPlaces;
    agentProperties?: AgentPropertyCard[];
    similarProperties?: SimilarPropertyCard[];
}

/**
 * Клиентский компонент контента страницы деталей.
 * Оборачивает PropertyDetailWidget и Footer для использования
 * внутри layout маршрута [type]/[slug].
 */
export function DetailContent({
    property,
    translations,
    locale,
    nearbyPlaces,
    agentProperties,
    similarProperties,
}: DetailContentProps) {
    return (
        <>
            <PropertyDetailWidget
                property={property}
                translations={translations}
                locale={locale}
                nearbyPlaces={nearbyPlaces}
                agentProperties={agentProperties}
                similarProperties={similarProperties}
            />
            <Footer />
        </>
    );
}
