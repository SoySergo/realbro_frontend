'use client';

import { PropertyDetailWidget } from '@/widgets/property-detail';
import { Footer } from '@/widgets/footer';
import { PropertyDetailHeader } from '@/widgets/property-detail-header';
import type { Property } from '@/entities/property/model/types';

interface PropertyDetailPageProps {
    property: Property;
}

export function PropertyDetailPage({ property }: PropertyDetailPageProps) {
    return (
        <main className="min-h-screen bg-background">
            <PropertyDetailHeader />
            <PropertyDetailWidget property={property} />
            <Footer />
        </main>
    );
}
