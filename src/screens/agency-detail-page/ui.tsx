'use client';

import { AgencyDetail } from '@/widgets/agency-detail';
import type { Agency } from '@/entities/agency';
import type { Property } from '@/entities/property';

interface AgencyDetailPageProps {
    agency: Agency;
    properties: Property[];
    locale: string;
}

/**
 * Экран детальной страницы агентства
 */
export function AgencyDetailPage({ agency, properties, locale }: AgencyDetailPageProps) {
    return (
        <AgencyDetail
            agency={agency}
            properties={properties}
            locale={locale}
        />
    );
}
