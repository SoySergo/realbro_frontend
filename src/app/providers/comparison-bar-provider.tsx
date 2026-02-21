'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FloatingComparisonBar, ComparisonDialog } from '@/features/comparison';

/**
 * ComparisonBarProvider - Глобальный провайдер для FloatingComparisonBar
 * 
 * Показывает плавающую панель сравнения на всех страницах.
 * При клике открывает диалог сравнения вместо перехода на отдельную страницу.
 */
export function ComparisonBarProvider() {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('comparison');

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const barTranslations = {
        compare: t('compare'),
        clearAll: t('clearAll'),
        selected: t('selected'),
        outOf: t('outOf'),
        openComparison: t('openComparison'),
    };

    // Получаем текущую локаль из pathname
    const locale = pathname?.split('/')[1] || 'ru';

    const dialogTranslations = {
        dialogTitle: t('title'),
        dialogDescription: t('subtitle'),
        close: t('back'),
        title: t('title'),
        subtitle: t('subtitle'),
        clearAll: t('clearAll'),
        addMore: t('addMore'),
        emptySlot: t('emptySlot'),
        remove: t('remove'),
        backToSearch: t('backToSearch'),
        characteristics: t('characteristics'),
        // Характеристики
        price: t('price'),
        pricePerMeter: t('pricePerMeter'),
        area: t('area'),
        rooms: t('rooms'),
        floor: t('floor'),
        bathrooms: t('bathrooms'),
        // Условия
        deposit: t('deposit'),
        commission: t('commission'),
        minRentalPeriod: t('minRentalPeriod'),
        // Удобства
        elevator: t('elevator'),
        balcony: t('balcony'),
        terrace: t('terrace'),
        airConditioning: t('airConditioning'),
        heating: t('heating'),
        furnished: t('furnished'),
        petFriendly: t('petFriendly'),
        parking: t('parking'),
        pool: t('pool'),
        // Метки
        perMonth: t('perMonth'),
        sqm: t('sqm'),
        months: t('months'),
        yes: t('yes'),
        no: t('no'),
        notSpecified: t('notSpecified'),
    };

    const handleOpenComparison = () => {
        setIsDialogOpen(true);
    };

    const handlePropertyClick = (property: { id: string; slug?: string }) => {
        router.push(`/${locale}/property/${property.slug || property.id}`);
    };

    const handleAddMore = () => {
        router.push(`/${locale}/search/properties/list`);
    };

    return (
        <>
            <FloatingComparisonBar
                translations={barTranslations}
                onOpenComparison={handleOpenComparison}
            />
            <ComparisonDialog
                translations={dialogTranslations}
                locale={locale}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onPropertyClick={handlePropertyClick}
                onAddMore={handleAddMore}
            />
        </>
    );
}
