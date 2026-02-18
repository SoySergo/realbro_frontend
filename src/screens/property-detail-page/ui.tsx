'use client';

import { PropertyDetailWidget } from '@/widgets/property-detail';
import { Footer } from '@/widgets/footer';
import { PropertyDetailHeader } from '@/widgets/property-detail-header';
import { HeaderSlot } from '@/widgets/app-header';
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
        <main className="min-h-screen bg-background md:ml-14">
            {/* Контент хедера через портал — только desktop */}
            <HeaderSlot>
                <PropertyDetailHeader
                    price={property.price}
                    area={property.area}
                    rooms={property.rooms}
                    title={property.title}
                    floor={property.floor}
                    translations={translations.header}
                    mainInfoTranslations={translations.mainInfo}
                    locale={locale}
                    variant="headerSlot"
                />
            </HeaderSlot>

            {/* Мобильный хедер — рендерится отдельно на мобильных */}
            <div className="md:hidden">
                <PropertyDetailHeader
                    price={property.price}
                    area={property.area}
                    rooms={property.rooms}
                    title={property.title}
                    floor={property.floor}
                    translations={translations.header}
                    mainInfoTranslations={translations.mainInfo}
                    locale={locale}
                />
            </div>

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

