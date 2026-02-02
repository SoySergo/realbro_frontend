'use client';

import { PropertyDetailWidget } from '@/widgets/property-detail';
import { Footer } from '@/widgets/footer';
import { PropertyDetailHeader } from '@/widgets/property-detail-header';
import type { Property } from '@/entities/property/model/types';
import type { PropertyPageTranslations } from '@/shared/lib/get-property-translations';

interface PropertyDetailPageProps {
    property: Property;
    translations: PropertyPageTranslations;
    locale: string;
}

export function PropertyDetailPage({ property, translations, locale }: PropertyDetailPageProps) {
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
            />
            <Footer />
        </main>
    );
}

