'use client';

import { PropertyDetailWidget } from '@/widgets/property-detail';
import type { Property } from '@/entities/property/model/types';

interface PropertyDetailPageProps {
    property: Property;
}

export function PropertyDetailPage({ property }: PropertyDetailPageProps) {
    return (
        <main className="min-h-screen bg-background">
            <PropertyDetailWidget property={property} />
        </main>
    );
}
