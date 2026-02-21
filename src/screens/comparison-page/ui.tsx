'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ComparisonPanel } from '@/widgets/comparison-panel';
import { useComparisonStore } from '@/features/comparison';
import type { Property } from '@/entities/property';

interface ComparisonPageProps {
    locale: string;
}

/**
 * ComparisonPage - Страница сравнения объектов недвижимости
 * 
 * Полноэкранная страница с таблицей сравнения характеристик.
 */
export function ComparisonPage({ locale }: ComparisonPageProps) {
    const router = useRouter();
    const t = useTranslations('comparison');

    const translations = {
        title: t('title'),
        subtitle: t('subtitle'),
        clearAll: t('clearAll'),
        addMore: t('addMore'),
        emptySlot: t('emptySlot'),
        remove: t('remove'),
        backToSearch: t('backToSearch'),
        characteristics: t('characteristics'),
        price: t('price'),
        pricePerMeter: t('pricePerMeter'),
        area: t('area'),
        rooms: t('rooms'),
        floor: t('floor'),
        bathrooms: t('bathrooms'),
        deposit: t('deposit'),
        commission: t('commission'),
        minRentalPeriod: t('minRentalPeriod'),
        elevator: t('elevator'),
        balcony: t('balcony'),
        terrace: t('terrace'),
        airConditioning: t('airConditioning'),
        heating: t('heating'),
        furnished: t('furnished'),
        petFriendly: t('petFriendly'),
        parking: t('parking'),
        pool: t('pool'),
        perMonth: t('perMonth'),
        sqm: t('sqm'),
        months: t('months'),
        yes: t('yes'),
        no: t('no'),
        notSpecified: t('notSpecified'),
    };

    const handleBack = () => {
        router.back();
    };

    const handlePropertyClick = (property: Property) => {
        router.push(`/${locale}/property/${property.slug || property.id}`);
    };

    const handleAddMore = () => {
        router.push(`/${locale}/search/properties/map`);
    };

    return (
        <div className="min-h-screen bg-background">
            <ComparisonPanel
                translations={translations}
                locale={locale}
                onBack={handleBack}
                onPropertyClick={handlePropertyClick}
                onAddMore={handleAddMore}
                className="h-screen"
            />
        </div>
    );
}
